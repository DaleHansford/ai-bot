import type { EvidenceSource } from "@/lib/canonical-context";
import type { TaskClass } from "@/lib/model-router";

export type EvidenceSourcePlan = {
  taskClass: TaskClass;
  required: EvidenceSource[];
  optional: EvidenceSource[];
  skipped: EvidenceSource[];
  reason: string;
};

const ALL_SOURCES: EvidenceSource[] = [
  "BUSINESS_OS",
  "GHL",
  "STRIPE",
  "GOOGLE_DRIVE",
  "OBSIDIAN",
  "GITHUB",
  "COMMAND_CENTRE_DB",
];

function unique(values: EvidenceSource[]): EvidenceSource[] {
  return [...new Set(values)];
}

function implicatedOperationalSources(command: string): EvidenceSource[] {
  const text = command.toLowerCase();
  const sources: EvidenceSource[] = [];

  if (/(ghl|crm|contact|pipeline|opportunit|workflow|form|leadconnector)/.test(text)) {
    sources.push("GHL");
  }
  if (/(stripe|payment|checkout|refund|price|pricing|payment link)/.test(text)) {
    sources.push("STRIPE");
  }
  if (/(drive|document|file|asset|pdf|sheet|spreadsheet|google docs)/.test(text)) {
    sources.push("GOOGLE_DRIVE");
  }
  if (/(github|repo|branch|commit|pull request|code|typescript|next\.js|schema|migration)/.test(text)) {
    sources.push("GITHUB");
  }
  if (/(command centre|command center|database|supabase|postgres|decision|task|needs dale|audit)/.test(text)) {
    sources.push("COMMAND_CENTRE_DB");
  }
  if (/(obsidian|doctrine|course manual|private ip|research note)/.test(text)) {
    sources.push("OBSIDIAN");
  }

  return unique(sources);
}

function skippedFrom(selected: EvidenceSource[]): EvidenceSource[] {
  const set = new Set(selected);
  return ALL_SOURCES.filter((source) => !set.has(source));
}

export function selectEvidenceSources(
  taskClass: TaskClass,
  command: string,
): EvidenceSourcePlan {
  const implicated = implicatedOperationalSources(command);

  switch (taskClass) {
    case "OPERATIONS": {
      const required = unique(["BUSINESS_OS", ...implicated]);
      const optional = required.includes("COMMAND_CENTRE_DB")
        ? []
        : (["COMMAND_CENTRE_DB"] as EvidenceSource[]);
      const selected = unique([...required, ...optional]);
      return {
        taskClass,
        required,
        optional,
        skipped: skippedFrom(selected),
        reason:
          "Operational work starts with Business OS and retrieves only systems explicitly implicated by the command.",
      };
    }

    case "CODE_ARCHITECTURE": {
      const required = unique([
        "BUSINESS_OS",
        "GITHUB",
        "COMMAND_CENTRE_DB",
        ...implicated.filter((source) => source === "GOOGLE_DRIVE" || source === "OBSIDIAN"),
      ]);
      return {
        taskClass,
        required,
        optional: [],
        skipped: skippedFrom(required),
        reason:
          "Architecture work is grounded in Business OS, repository state and Command Centre application state.",
      };
    }

    case "LONG_DOCUMENT": {
      const required: EvidenceSource[] = ["BUSINESS_OS", "GOOGLE_DRIVE"];
      const optional: EvidenceSource[] = ["OBSIDIAN"];
      return {
        taskClass,
        required,
        optional,
        skipped: skippedFrom([...required, ...optional]),
        reason:
          "Long-document work uses durable source files first and may add Dale IP from Obsidian without touching CRM or payments.",
      };
    }

    case "SCIENTIFIC_EVIDENCE": {
      const required: EvidenceSource[] = ["BUSINESS_OS", "OBSIDIAN"];
      const optional: EvidenceSource[] = ["GOOGLE_DRIVE"];
      return {
        taskClass,
        required,
        optional,
        skipped: skippedFrom([...required, ...optional]),
        reason:
          "Scientific work separates Business OS context from Dale doctrine/research notes and avoids operational systems by default.",
      };
    }

    case "STRATEGIC_DECISION": {
      const required = unique(["BUSINESS_OS", ...implicated]);
      const optional: EvidenceSource[] = required.includes("COMMAND_CENTRE_DB")
        ? []
        : ["COMMAND_CENTRE_DB"];
      return {
        taskClass,
        required,
        optional,
        skipped: skippedFrom([...required, ...optional]),
        reason:
          "Strategic work begins with Business OS and adds commercial or operational systems only when the command makes them relevant.",
      };
    }

    case "GENERAL":
    default: {
      const required: EvidenceSource[] = ["BUSINESS_OS"];
      const optional = implicated.filter(
        (source) => source === "GOOGLE_DRIVE" || source === "OBSIDIAN" || source === "GITHUB",
      );
      return {
        taskClass,
        required,
        optional,
        skipped: skippedFrom([...required, ...optional]),
        reason:
          "General work defaults away from confidential CRM/payment systems unless the task class or command explicitly requires them.",
      };
    }
  }
}

export function missingRequiredSources(
  plan: EvidenceSourcePlan,
  availableSources: Iterable<EvidenceSource>,
): EvidenceSource[] {
  const available = new Set(availableSources);
  return plan.required.filter((source) => !available.has(source));
}
