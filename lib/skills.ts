import type { TaskClass } from "@/lib/model-router";

export type SkillCheck = {
  id: string;
  description: string;
};

export type SkillPack = {
  id: string;
  name: string;
  domain: string;
  taskClasses: TaskClass[];
  sourceHierarchy: string[];
  mandatoryChecks: SkillCheck[];
  defaultOutput: string;
  preferredRouting: "GPT" | "CLAUDE" | "BOTH" | "AUTO";
  status: "IN_BUILD" | "QUEUED" | "ACTIVE";
};

export const SKILLS: SkillPack[] = [
  {
    id: "SK-01",
    name: "Executive Business Operator",
    domain: "Executive / portfolio",
    taskClasses: ["OPERATIONS", "STRATEGIC_DECISION", "GENERAL"],
    sourceHierarchy: ["Strategic Priorities", "current commercial data", "active decisions", "approved expert frameworks"],
    mandatoryChecks: [
      { id: "freshness", description: "Confirm commercial and operational data freshness." },
      { id: "capacity", description: "Check delivery and capacity constraints." },
      { id: "conflicts", description: "Surface conflicting priorities." },
      { id: "commercial-impact", description: "Tie priorities to qualified demand, revenue or delivery risk." },
    ],
    defaultOutput: "Ranked actions, exceptions, blockers and Needs Dale items.",
    preferredRouting: "AUTO",
    status: "IN_BUILD",
  },
  {
    id: "SK-08",
    name: "GHL Operator",
    domain: "CRM / lifecycle",
    taskClasses: ["OPERATIONS"],
    sourceHierarchy: ["GHL canonical state", "lifecycle schema", "current offer rules", "Business OS"],
    mandatoryChecks: [
      { id: "dedupe", description: "Check for an existing contact or opportunity before creating another." },
      { id: "lifecycle", description: "Preserve monotonic lifecycle and stage progression." },
      { id: "consent", description: "Respect consent and suppression state before outbound actions." },
      { id: "production-state", description: "Confirm production versus shadow or draft state." },
      { id: "readback", description: "Read after every permitted write and record actual state." },
    ],
    defaultOutput: "CRM change set plus QA and readback evidence.",
    preferredRouting: "GPT",
    status: "IN_BUILD",
  },
  {
    id: "SK-16",
    name: "AI Automation & Systems Architect",
    domain: "AI / automation / software systems",
    taskClasses: ["CODE_ARCHITECTURE", "OPERATIONS", "STRATEGIC_DECISION"],
    sourceHierarchy: ["Command Centre architecture", "measured Dale system results", "first-party API documentation", "vetted practitioner frameworks"],
    mandatoryChecks: [
      { id: "determinism", description: "Choose deterministic automation when the workflow is known." },
      { id: "permissions", description: "Use capability-level permissions." },
      { id: "idempotency", description: "Make every external write replay-safe." },
      { id: "retries", description: "Retry only after checking current state and failure mode." },
      { id: "observability", description: "Log run, model, tool, cost, latency, approval and result." },
      { id: "approval", description: "Use approval gates for high-risk actions." },
      { id: "cost", description: "Select the cheapest adequate execution path and measure actual cost." },
      { id: "lock-in", description: "Prefer portable contracts and direct first-party APIs for core systems." },
      { id: "recovery", description: "Define failure recovery and reconciliation before activation." },
    ],
    defaultOutput: "Workflow architecture, implementation contract, controls and QA plan.",
    preferredRouting: "BOTH",
    status: "IN_BUILD",
  },
];

export function skillById(id: string): SkillPack | undefined {
  return SKILLS.find((skill) => skill.id === id);
}

export function selectSkill(taskClass: TaskClass, command: string): SkillPack {
  const text = command.toLowerCase();

  if (/(ghl|crm|pipeline|opportunity|contact|workflow|leadconnector)/.test(text)) {
    return skillById("SK-08") as SkillPack;
  }

  if (/(automation|agent|architecture|api|make|supabase|postgres|idempot|retry|observability)/.test(text)) {
    return skillById("SK-16") as SkillPack;
  }

  return SKILLS.find((skill) => skill.taskClasses.includes(taskClass)) ?? (skillById("SK-01") as SkillPack);
}
