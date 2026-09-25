"use client";

import { FormEvent, useMemo, useState } from "react";

type Mode = "AUTO" | "GPT" | "CLAUDE" | "BOTH";

type CommandResult = {
  status: string;
  routing?: {
    requestedMode: Mode;
    effectiveMode: Mode;
    taskClass: string;
    reason: string;
  };
  message?: string;
};

const MODES: Mode[] = ["AUTO", "GPT", "CLAUDE", "BOTH"];

const panels = [
  ["Strategic priority", "Mentorship + Australian education", "Business OS"],
  ["CRM", "GHL materially complete · tail QA", "GHL"],
  ["Command Centre", "V1 foundation active", "GitHub + DB"],
  ["Needs Dale", "0 loaded in this shell", "Operational DB"],
];

export function CommandCentre() {
  const [mode, setMode] = useState<Mode>("AUTO");
  const [command, setCommand] = useState("");
  const [result, setResult] = useState<CommandResult | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => command.trim().length > 2 && !busy, [command, busy]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setResult(null);

    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ command: command.trim(), mode }),
      });

      setResult((await response.json()) as CommandResult);
    } catch {
      setResult({
        status: "error",
        message: "The command shell could not reach its server route.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-6 md:px-10 md:py-10">
      <header className="mx-auto flex max-w-7xl items-end justify-between border-b border-[var(--line)] pb-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--orange-soft)]">
            Coach Dale
          </p>
          <h1 className="text-3xl font-black tracking-tight md:text-5xl">Command Centre</h1>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          <div>V1 FOUNDATION</div>
          <div className="mt-1 text-[var(--cream)]">SHADOW STATE</div>
        </div>
      </header>

      <section className="mx-auto mt-6 grid max-w-7xl gap-3 md:grid-cols-4">
        {panels.map(([label, value, source]) => (
          <article key={label} className="border border-[var(--line)] bg-[#202020] p-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</div>
            <div className="mt-3 min-h-12 text-lg font-bold leading-tight">{value}</div>
            <div className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[var(--orange-soft)]">
              SOURCE · {source}
            </div>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[1.6fr_0.8fr]">
        <form onSubmit={submit} className="border border-[var(--line)] bg-[#202020] p-4 md:p-6">
          <div className="flex flex-wrap gap-2">
            {MODES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={[
                  "border px-4 py-2 text-xs font-black tracking-[0.12em] transition",
                  mode === item
                    ? "border-[var(--orange)] bg-[var(--orange)] text-white"
                    : "border-[var(--line)] bg-transparent text-[var(--cream)] hover:border-[var(--muted)]",
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="mt-6 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            Command
          </label>
          <textarea
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            placeholder="What needs to happen next?"
            className="mt-2 min-h-48 w-full resize-y border border-[var(--line)] bg-[#171717] p-4 text-lg leading-relaxed text-[var(--cream)] outline-none focus:border-[var(--orange)]"
          />

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="max-w-xl text-xs leading-relaxed text-[var(--muted)]">
              Commands are routed through shared policy and canonical context. External writes remain gated until connector idempotency, approval and audit contracts are live.
            </p>
            <button
              disabled={!canSubmit}
              className="shrink-0 bg-[var(--cream)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink)] disabled:opacity-40"
            >
              {busy ? "Routing…" : "Run"}
            </button>
          </div>

          {result && (
            <div className="mt-5 border-l-4 border-[var(--orange)] bg-[#171717] p-4 text-sm">
              <div className="font-bold uppercase tracking-[0.12em] text-[var(--orange-soft)]">{result.status}</div>
              {result.routing && (
                <div className="mt-2 leading-relaxed">
                  {result.routing.taskClass} → {result.routing.effectiveMode}
                  <br />
                  <span className="text-[var(--muted)]">{result.routing.reason}</span>
                </div>
              )}
              {result.message && <div className="mt-2 text-[var(--muted)]">{result.message}</div>}
            </div>
          )}
        </form>

        <aside className="space-y-3">
          <div className="border border-[var(--line)] p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--orange-soft)]">Canonical order</div>
            <ol className="mt-4 space-y-3 text-sm">
              <li>1 · Business OS — strategic truth</li>
              <li>2 · GHL — CRM/customer truth</li>
              <li>3 · Stripe — payment truth</li>
              <li>4 · Drive — durable files/assets</li>
              <li>5 · Obsidian — Dale IP/doctrine</li>
              <li>6 · GitHub — code/product state</li>
            </ol>
          </div>

          <div className="border border-[var(--line)] p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[var(--orange-soft)]">Safety state</div>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              Financial, destructive, bulk outbound, organic publishing and materially strategic writes fail closed until an explicit approval state is present.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
