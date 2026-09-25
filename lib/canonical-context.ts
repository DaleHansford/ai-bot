export const CANONICAL_SOURCES = [
  { system: "BUSINESS_OS", owns: ["strategic priorities", "commercial state during V1", "governance", "build registry"] },
  { system: "GHL", owns: ["contacts", "pipelines", "opportunities", "customer lifecycle"] },
  { system: "STRIPE", owns: ["payments", "payment links", "refund truth"] },
  { system: "GOOGLE_DRIVE", owns: ["durable source files", "approved finished assets", "master specification"] },
  { system: "OBSIDIAN", owns: ["Dale doctrine", "course knowledge", "private IP", "research notes"] },
  { system: "GITHUB", owns: ["Command Centre code", "Periodization Lab code", "product-development state"] },
  { system: "COMMAND_CENTRE_DB", owns: ["projects", "tasks", "decisions", "Needs Dale", "AI runs", "audit events", "normalized references"] },
] as const;

export type EvidenceSource = (typeof CANONICAL_SOURCES)[number]["system"];

export type EvidenceItem = {
  source: EvidenceSource;
  sourceObjectId: string;
  capturedAt: string;
  checksum?: string;
  excerpt?: string;
};

export type EvidencePacket = {
  correlationId: string;
  command: string;
  evidence: EvidenceItem[];
};
