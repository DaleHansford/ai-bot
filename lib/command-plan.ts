import type { EvidencePacket } from "@/lib/canonical-context";
import { routeCommand, type ModelMode } from "@/lib/model-router";
import { providerAvailability } from "@/lib/provider-runtime";
import { selectSkill } from "@/lib/skills";

export type CommandPlan = {
  routing: ReturnType<typeof routeCommand>;
  skillId: string;
  skillName: string;
  evidenceCount: number;
  providerAvailability: ReturnType<typeof providerAvailability>;
  executionReady: boolean;
  blockedReason?: string;
};

export function planCommand(
  command: string,
  requestedMode: ModelMode,
  evidencePacket: EvidencePacket,
): CommandPlan {
  const routing = routeCommand(command, requestedMode);
  const skill = selectSkill(routing.taskClass, command);
  const availability = providerAvailability();

  const providersReady =
    routing.effectiveMode === "GPT"
      ? availability.openaiConfigured
      : routing.effectiveMode === "CLAUDE"
        ? availability.anthropicConfigured
        : availability.openaiConfigured && availability.anthropicConfigured;

  const hasEvidence = evidencePacket.evidence.length > 0;

  return {
    routing,
    skillId: skill.id,
    skillName: skill.name,
    evidenceCount: evidencePacket.evidence.length,
    providerAvailability: availability,
    executionReady: providersReady && hasEvidence,
    blockedReason: !hasEvidence
      ? "No canonical evidence packet is attached."
      : !providersReady
        ? "Required provider configuration is not present."
        : undefined,
  };
}
