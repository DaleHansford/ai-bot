export type ModelMode = "AUTO" | "GPT" | "CLAUDE" | "BOTH";

export type TaskClass =
  | "OPERATIONS"
  | "CODE_ARCHITECTURE"
  | "LONG_DOCUMENT"
  | "SCIENTIFIC_EVIDENCE"
  | "STRATEGIC_DECISION"
  | "GENERAL";

export type RoutingDecision = {
  requestedMode: ModelMode;
  effectiveMode: Exclude<ModelMode, "AUTO">;
  taskClass: TaskClass;
  reason: string;
};

function classify(command: string): TaskClass {
  const text = command.toLowerCase();

  if (/(ghl|crm|make|wordpress|stripe|drive|calendar|email|pipeline|workflow|form)/.test(text)) {
    return "OPERATIONS";
  }
  if (/(code|schema|database|supabase|postgres|api|architecture|github|typescript|next\.js)/.test(text)) {
    return "CODE_ARCHITECTURE";
  }
  if (/(manual|course|chapter|rewrite|critique|long document|slides)/.test(text)) {
    return "LONG_DOCUMENT";
  }
  if (/(evidence|research|study|paper|pubmed|scientific|systematic review)/.test(text)) {
    return "SCIENTIFIC_EVIDENCE";
  }
  if (/(strategy|pricing|major decision|allocation|positioning|commercial|high stakes)/.test(text)) {
    return "STRATEGIC_DECISION";
  }
  return "GENERAL";
}

export function routeCommand(command: string, requestedMode: ModelMode): RoutingDecision {
  const taskClass = classify(command);

  if (requestedMode !== "AUTO") {
    return {
      requestedMode,
      effectiveMode: requestedMode,
      taskClass,
      reason: "Explicit model selection overrides AUTO routing.",
    };
  }

  switch (taskClass) {
    case "OPERATIONS":
      return {
        requestedMode,
        effectiveMode: "GPT",
        taskClass,
        reason: "Tool-heavy business operations default to GPT under the V1 routing policy.",
      };
    case "LONG_DOCUMENT":
      return {
        requestedMode,
        effectiveMode: "CLAUDE",
        taskClass,
        reason: "Long-document critique/editing defaults to Claude, with cross-review available when required.",
      };
    case "SCIENTIFIC_EVIDENCE":
    case "STRATEGIC_DECISION":
      return {
        requestedMode,
        effectiveMode: "BOTH",
        taskClass,
        reason: "Consequential or evidence-sensitive work receives independent cross-model analysis.",
      };
    case "CODE_ARCHITECTURE":
      return {
        requestedMode,
        effectiveMode: "GPT",
        taskClass,
        reason: "Software architecture defaults to GPT with optional independent Claude review.",
      };
    default:
      return {
        requestedMode,
        effectiveMode: "GPT",
        taskClass,
        reason: "General operational work uses the default primary provider.",
      };
  }
}
