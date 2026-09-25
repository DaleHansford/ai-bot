export type ProjectStatus = "PLANNED" | "ACTIVE" | "BLOCKED" | "DONE" | "ARCHIVED";
export type TaskStatus = "TODO" | "DOING" | "BLOCKED" | "DONE" | "CANCELLED";
export type DecisionStatus = "ACTIVE" | "SUPERSEDED" | "REVOKED";
export type ApprovalState = "NONE" | "RULE_MATCHED" | "DALE_APPROVED" | "DECLINED";
export type RunStatus = "STARTED" | "SUCCEEDED" | "FAILED" | "CANCELLED";

export type Project = {
  id: string;
  externalKey?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priorityRank?: string;
  canonicalSource: string;
  sourceObjectId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  projectId?: string;
  externalKey?: string;
  title: string;
  detail?: string;
  status: TaskStatus;
  priority: number;
  dueAt?: string;
  canonicalSource: string;
  sourceObjectId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Decision = {
  id: string;
  projectId?: string;
  decisionKey?: string;
  title: string;
  decisionText: string;
  rationale?: string;
  status: DecisionStatus;
  supersedesDecisionId?: string;
  canonicalSource: string;
  sourceObjectId?: string;
  decidedAt: string;
};

export type NeedsDale = {
  id: string;
  projectId?: string;
  title: string;
  reason: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  requestedAction?: string;
  status: "OPEN" | "APPROVED" | "DECLINED" | "RESOLVED";
  createdAt: string;
  updatedAt: string;
};

export type SourceRecord = {
  id: string;
  sourceSystem: string;
  sourceObjectId: string;
  sourceUrl?: string;
  checksum?: string;
  sourceModifiedAt?: string;
  lastSeenAt: string;
};

export type ModelRun = {
  id: string;
  correlationId: string;
  provider: "OPENAI" | "ANTHROPIC" | "MULTI";
  model?: string;
  requestedMode: "AUTO" | "GPT" | "CLAUDE" | "BOTH";
  effectiveMode: "GPT" | "CLAUDE" | "BOTH";
  taskClass: string;
  skillId?: string;
  inputHash?: string;
  evidenceHash?: string;
  status: RunStatus;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  costUsd?: number;
  startedAt: string;
  completedAt?: string;
};

export type AuditEvent = {
  id: string;
  modelRunId?: string;
  correlationId: string;
  actionId: string;
  connector: string;
  capability: string;
  objectId?: string;
  intendedState?: unknown;
  beforeState?: unknown;
  afterState?: unknown;
  approvalState: ApprovalState;
  approvalReference?: string;
  idempotencyKey: string;
  result: string;
  createdAt: string;
};
