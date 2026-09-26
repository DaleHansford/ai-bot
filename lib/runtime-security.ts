export type RuntimeSecurityState = {
  privateRuntimeApproved: boolean;
  supabaseConfigured: boolean;
  approvalSigningConfigured: boolean;
  providerExecutionAllowed: boolean;
  persistenceAllowed: boolean;
  governedWriteExecutionAllowed: boolean;
  blockedReasons: string[];
};

export function runtimeSecurityState(
  env: NodeJS.ProcessEnv = process.env,
): RuntimeSecurityState {
  const privateRuntimeApproved = env.COMMAND_CENTRE_PRIVATE_RUNTIME === "true";
  const supabaseConfigured = Boolean(
    env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
      env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const approvalSigningConfigured = Boolean(
    env.COMMAND_CENTRE_APPROVAL_SIGNING_SECRET,
  );

  const blockedReasons: string[] = [];
  if (!privateRuntimeApproved) {
    blockedReasons.push(
      "Private production runtime has not been explicitly approved.",
    );
  }
  if (!supabaseConfigured) {
    blockedReasons.push("Supabase persistence is not fully configured.");
  }
  if (!approvalSigningConfigured) {
    blockedReasons.push(
      "Approval receipt signing is not configured; governed writes must fail closed.",
    );
  }

  return {
    privateRuntimeApproved,
    supabaseConfigured,
    approvalSigningConfigured,
    providerExecutionAllowed: privateRuntimeApproved,
    persistenceAllowed: privateRuntimeApproved && supabaseConfigured,
    governedWriteExecutionAllowed:
      privateRuntimeApproved && approvalSigningConfigured,
    blockedReasons,
  };
}
