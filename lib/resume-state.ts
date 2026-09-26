import type { Decision, NeedsDale, Project, Task } from "@/lib/domain";

export type ResumeInput = {
  projects: Project[];
  tasks: Task[];
  decisions: Decision[];
  needsDale: NeedsDale[];
  now?: string;
};

export type NextAction = {
  taskId: string;
  projectId?: string;
  title: string;
  priority: number;
  dueAt?: string;
  reason: string;
};

export type ResumeState = {
  activeProjects: Project[];
  openTasks: Task[];
  activeDecisions: Decision[];
  needsDale: NeedsDale[];
  blockedTasks: Task[];
  nextActions: NextAction[];
};

function dueWeight(dueAt: string | undefined, nowMs: number): number {
  if (!dueAt) return 0;
  const dueMs = Date.parse(dueAt);
  if (Number.isNaN(dueMs)) return 0;
  if (dueMs <= nowMs) return 3;
  if (dueMs - nowMs <= 24 * 60 * 60 * 1000) return 2;
  if (dueMs - nowMs <= 7 * 24 * 60 * 60 * 1000) return 1;
  return 0;
}

export function buildResumeState(input: ResumeInput): ResumeState {
  const nowMs = Date.parse(input.now ?? new Date().toISOString());

  const activeProjects = input.projects.filter(
    (project) => project.status === "ACTIVE" || project.status === "BLOCKED",
  );
  const openTasks = input.tasks.filter(
    (task) =>
      task.status === "TODO" ||
      task.status === "DOING" ||
      task.status === "BLOCKED",
  );
  const blockedTasks = openTasks.filter((task) => task.status === "BLOCKED");
  const activeDecisions = input.decisions.filter(
    (decision) => decision.status === "ACTIVE",
  );
  const needsDale = input.needsDale.filter((item) => item.status === "OPEN");

  const nextActions = openTasks
    .filter((task) => task.status !== "BLOCKED")
    .map((task) => ({
      taskId: task.id,
      projectId: task.projectId,
      title: task.title,
      priority: task.priority,
      dueAt: task.dueAt,
      reason:
        task.status === "DOING"
          ? "Already in progress."
          : task.dueAt
            ? "Open task with a due date."
            : "Highest-ranked executable open task.",
      score:
        task.priority * 10 +
        dueWeight(task.dueAt, nowMs) * 5 +
        (task.status === "DOING" ? 4 : 0),
    }))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .map(({ score: _score, ...action }) => action);

  return {
    activeProjects,
    openTasks,
    activeDecisions,
    needsDale,
    blockedTasks,
    nextActions,
  };
}
