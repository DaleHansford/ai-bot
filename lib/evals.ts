import type { SkillPack } from "@/lib/skills";

export type EvalCheckResult = {
  checkId: string;
  passed: boolean;
  evidence?: string;
};

export type SkillEvalResult = {
  skillId: string;
  passed: boolean;
  checks: EvalCheckResult[];
  missingChecks: string[];
};

export function evaluateMandatoryChecks(
  skill: SkillPack,
  results: EvalCheckResult[],
): SkillEvalResult {
  const resultById = new Map(results.map((result) => [result.checkId, result]));
  const checks = skill.mandatoryChecks.map((check) => {
    return (
      resultById.get(check.id) ?? {
        checkId: check.id,
        passed: false,
        evidence: "No result supplied.",
      }
    );
  });

  const missingChecks = checks
    .filter((check) => !check.passed)
    .map((check) => check.checkId);

  return {
    skillId: skill.id,
    passed: missingChecks.length === 0,
    checks,
    missingChecks,
  };
}

export const REPRESENTATIVE_EVALS = [
  {
    id: "EV-SK08-001",
    skillId: "SK-08",
    prompt: "Move a returning mentorship lead forward without creating a duplicate opportunity.",
    mustPass: ["dedupe", "lifecycle", "production-state", "readback"],
  },
  {
    id: "EV-SK16-001",
    skillId: "SK-16",
    prompt: "Design a recurring Drive-to-GHL asset sync that cannot duplicate client-facing files.",
    mustPass: ["determinism", "permissions", "idempotency", "retries", "observability", "recovery"],
  },
  {
    id: "EV-SK16-002",
    skillId: "SK-16",
    prompt: "Design an AI workflow that could publish content or change pricing.",
    mustPass: ["approval", "permissions", "idempotency", "observability"],
  },
] as const;
