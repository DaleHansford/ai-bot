import { NextResponse } from "next/server";
import type { EvidencePacket } from "@/lib/canonical-context";
import { planCommand } from "@/lib/command-plan";
import type { ModelMode } from "@/lib/model-router";

const MODES: ModelMode[] = ["AUTO", "GPT", "CLAUDE", "BOTH"];

type PlanRequest = {
  command?: unknown;
  mode?: unknown;
  evidencePacket?: unknown;
};

function isEvidencePacket(value: unknown): value is EvidencePacket {
  if (!value || typeof value !== "object") return false;
  const packet = value as Partial<EvidencePacket>;
  return (
    typeof packet.correlationId === "string" &&
    typeof packet.command === "string" &&
    Array.isArray(packet.evidence)
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as PlanRequest;

  const command = typeof body.command === "string" ? body.command.trim() : "";
  const mode = typeof body.mode === "string" && MODES.includes(body.mode as ModelMode)
    ? (body.mode as ModelMode)
    : "AUTO";

  if (command.length < 3) {
    return NextResponse.json({ error: "Command is required." }, { status: 400 });
  }

  if (!isEvidencePacket(body.evidencePacket)) {
    return NextResponse.json(
      { error: "A canonical evidence packet is required." },
      { status: 400 },
    );
  }

  if (body.evidencePacket.command !== command) {
    return NextResponse.json(
      { error: "Evidence packet command does not match the submitted command." },
      { status: 409 },
    );
  }

  return NextResponse.json(planCommand(command, mode, body.evidencePacket));
}
