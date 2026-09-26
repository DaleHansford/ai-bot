-- Command Centre V1 core persistence.
-- Create-only migration. Business OS remains canonical during V1.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  external_key text,
  name text not null,
  description text,
  status text not null check (status in ('PLANNED','ACTIVE','BLOCKED','DONE','ARCHIVED')),
  priority_rank text,
  canonical_source text not null,
  source_object_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, external_key)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  project_id uuid references public.projects(id),
  external_key text,
  title text not null,
  detail text,
  status text not null check (status in ('TODO','DOING','BLOCKED','DONE','CANCELLED')),
  priority integer not null default 0,
  due_at timestamptz,
  canonical_source text not null,
  source_object_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, external_key)
);

create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  project_id uuid references public.projects(id),
  decision_key text,
  title text not null,
  decision_text text not null,
  rationale text,
  status text not null check (status in ('ACTIVE','SUPERSEDED','REVOKED')),
  supersedes_decision_id uuid references public.decisions(id),
  canonical_source text not null,
  source_object_id text,
  decided_at timestamptz not null default now(),
  unique (owner_user_id, decision_key)
);

create table if not exists public.needs_dale (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  project_id uuid references public.projects(id),
  title text not null,
  reason text not null,
  risk_level text not null check (risk_level in ('LOW','MEDIUM','HIGH','CRITICAL')),
  requested_action text,
  status text not null check (status in ('OPEN','APPROVED','DECLINED','RESOLVED')),
  approval_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.source_records (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  source_system text not null,
  source_object_id text not null,
  source_url text,
  checksum text,
  source_modified_at timestamptz,
  last_seen_at timestamptz not null default now(),
  payload_hash text,
  unique (owner_user_id, source_system, source_object_id)
);

create table if not exists public.model_runs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  correlation_id text not null,
  provider text not null check (provider in ('OPENAI','ANTHROPIC','MULTI')),
  model text,
  requested_mode text not null check (requested_mode in ('AUTO','GPT','CLAUDE','BOTH')),
  effective_mode text not null check (effective_mode in ('GPT','CLAUDE','BOTH')),
  task_class text not null,
  skill_id text,
  input_hash text,
  evidence_hash text,
  status text not null check (status in ('STARTED','SUCCEEDED','FAILED','CANCELLED')),
  input_tokens integer,
  output_tokens integer,
  latency_ms integer,
  cost_usd numeric(12,6),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  model_run_id uuid references public.model_runs(id),
  correlation_id text not null,
  action_id text not null,
  connector text not null,
  capability text not null,
  object_id text,
  intended_state jsonb,
  before_state jsonb,
  after_state jsonb,
  approval_state text not null check (approval_state in ('NONE','RULE_MATCHED','DALE_APPROVED','DECLINED')),
  approval_reference text,
  idempotency_key text not null,
  result text not null,
  error_text text,
  created_at timestamptz not null default now(),
  unique (owner_user_id, idempotency_key)
);

create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  source_system text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null check (status in ('STARTED','SUCCEEDED','FAILED','PARTIAL')),
  records_seen integer not null default 0,
  records_changed integer not null default 0,
  reconciliation_errors integer not null default 0,
  cursor jsonb,
  error_text text
);

create index if not exists tasks_owner_status_idx on public.tasks(owner_user_id, status);
create index if not exists decisions_owner_status_idx on public.decisions(owner_user_id, status);
create index if not exists needs_dale_owner_status_idx on public.needs_dale(owner_user_id, status);
create index if not exists source_records_owner_system_idx on public.source_records(owner_user_id, source_system);
create index if not exists model_runs_owner_started_idx on public.model_runs(owner_user_id, started_at desc);
create index if not exists audit_events_owner_created_idx on public.audit_events(owner_user_id, created_at desc);
create index if not exists audit_events_correlation_idx on public.audit_events(correlation_id);

alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.decisions enable row level security;
alter table public.needs_dale enable row level security;
alter table public.source_records enable row level security;
alter table public.model_runs enable row level security;
alter table public.audit_events enable row level security;
alter table public.sync_runs enable row level security;

create policy "projects_owner_all" on public.projects for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "tasks_owner_all" on public.tasks for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "decisions_owner_all" on public.decisions for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "needs_dale_owner_all" on public.needs_dale for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "source_records_owner_all" on public.source_records for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "model_runs_owner_all" on public.model_runs for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "audit_events_owner_all" on public.audit_events for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
create policy "sync_runs_owner_all" on public.sync_runs for all using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);
