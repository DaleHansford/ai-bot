export type ApprovalMode = "AUTO" | "RULE" | "DALE";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CapabilityPolicy = {
  capability: string;
  risk: RiskLevel;
  approval: ApprovalMode;
  failClosed: boolean;
};

const POLICIES: CapabilityPolicy[] = [
  { capability: "crm.read", risk: "MEDIUM", approval: "AUTO", failClosed: false },
  { capability: "crm.write", risk: "HIGH", approval: "RULE", failClosed: true },
  { capability: "financial.write", risk: "CRITICAL", approval: "DALE", failClosed: true },
  { capability: "data.delete", risk: "CRITICAL", approval: "DALE", failClosed: true },
  { capability: "outbound.bulk", risk: "HIGH", approval: "DALE", failClosed: true },
  { capability: "social.publish", risk: "HIGH", approval: "DALE", failClosed: true },
  { capability: "paid.activate", risk: "HIGH", approval: "DALE", failClosed: true },
  { capability: "health.identifiable.read", risk: "CRITICAL", approval: "DALE", failClosed: true },
];

export function policyFor(capability: string): CapabilityPolicy {
  return (
    POLICIES.find((policy) => policy.capability === capability) ?? {
      capability,
      risk: "HIGH",
      approval: "DALE",
      failClosed: true,
    }
  );
}

export function canExecute(
  capability: string,
  approvalState: "NONE" | "RULE_MATCHED" | "DALE_APPROVED",
): boolean {
  const policy = policyFor(capability);

  if (policy.approval === "AUTO") return true;
  if (policy.approval === "RULE") {
    return approvalState === "RULE_MATCHED" || approvalState === "DALE_APPROVED";
  }
  return approvalState === "DALE_APPROVED";
}
