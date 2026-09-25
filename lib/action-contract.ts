import type { ApprovalState } from "@/lib/domain";
import { canExecute, policyFor } from "@/lib/governance";

export type ExternalActionIntent = {
  actionId: string;
  correlationId: string;
  connector: string;
  capability: string;
  objectId?: string;
  intendedState?: unknown;
  idempotencyKey: string;
  approvalState: ApprovalState;
  approvalReference?: string;
};

export type ActionPreflight = {
  allowed: boolean;
  reason: string;
  policy: ReturnType<typeof policyFor>;
};

export function preflightAction(intent: ExternalActionIntent): ActionPreflight {
  const policy = policyFor(intent.capability);

  const mappedApproval =
    intent.approvalState === "DALE_APPROVED"
      ? "DALE_APPROVED"
      : intent.approvalState === "RULE_MATCHED"
        ? "RULE_MATCHED"
        : "NONE";

  const allowed = canExecute(intent.capability, mappedApproval);

  return {
    allowed,
    policy,
    reason: allowed
      ? "Capability and approval state satisfy the current policy."
      : "Action blocked: the capability does not have the required approval state.",
  };
}

export type ActionReadback = {
  actionId: string;
  objectId?: string;
  beforeState?: unknown;
  afterState?: unknown;
  result: "SUCCEEDED" | "FAILED" | "BLOCKED";
  errorText?: string;
};
