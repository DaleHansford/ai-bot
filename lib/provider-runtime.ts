import type { EvidencePacket } from "@/lib/canonical-context";
import type { ModelMode, TaskClass } from "@/lib/model-router";

export type Provider = "OPENAI" | "ANTHROPIC";

export type ProviderExecutionRequest = {
  correlationId: string;
  provider: Provider;
  model: string;
  requestedMode: ModelMode;
  taskClass: TaskClass;
  skillId: string;
  command: string;
  evidencePacket: EvidencePacket;
};

export type ProviderUsage = {
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  latencyMs?: number;
};

export type ProviderExecutionResult = {
  provider: Provider;
  model: string;
  correlationId: string;
  outputText: string;
  usage: ProviderUsage;
};

export type ProviderAdapter = {
  provider: Provider;
  execute(request: ProviderExecutionRequest): Promise<ProviderExecutionResult>;
};

export type ProviderAvailability = {
  openaiConfigured: boolean;
  anthropicConfigured: boolean;
};

export function providerAvailability(): ProviderAvailability {
  return {
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL),
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_MODEL),
  };
}

export function assertSharedEvidence(
  requests: ProviderExecutionRequest[],
): void {
  if (requests.length < 2) return;

  const [first, ...rest] = requests;
  const firstPacket = JSON.stringify(first.evidencePacket);

  for (const request of rest) {
    if (request.correlationId !== first.correlationId) {
      throw new Error("Cross-model execution must share one correlation ID.");
    }
    if (JSON.stringify(request.evidencePacket) !== firstPacket) {
      throw new Error("BOTH mode requires identical grounded evidence packets.");
    }
  }
}
