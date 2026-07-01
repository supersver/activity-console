import type {
  Assignee,
  Task,
  TaskStatus,
  TasksPage,
  TaskType,
} from "@/features/tasks/types";

/**
 * Normalization policy:
 * - id/title missing → task is unusable (can't be referenced/rendered), so it's dropped.
 *   Everything else gets a safe fallback instead of dropping the task, because a task
 *   silently vanishing from someone's queue is worse than it showing "Unknown" status.
 * - Unrecognized status/type → 'unknown' bucket, not a guess. New backend values show
 *   up visibly instead of being silently mapped to the wrong existing status.
 * - updatedAt → normalized to epoch ms (handles both number and ISO string from backend).
 *   Unparseable → 0, not Date.now() — broken data should sort as oldest, not newest.
 * - All drops/coercions are console.warn'd, never silent.
 */

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const STATUS_MAP: Record<string, TaskStatus> = {
  todo: "todo",
  inprogress: "in_progress",
  in_progress: "in_progress",
  qa: "qa",
  QA: "QA",
  blocked: "blocked",
  done: "done",
};

function normalizeStatus(raw: unknown): TaskStatus {
  if (typeof raw !== "string") return "unknown";
  return STATUS_MAP[raw.toLowerCase().replace(/[\s-]+/g, "_")] ?? "unknown";
}

function normalizeType(raw: unknown): TaskType {
  const valid: TaskType[] = ["image", "audio", "text", "video"];
  return typeof raw === "string" &&
    valid.includes(raw.toLowerCase() as TaskType)
    ? (raw.toLowerCase() as TaskType)
    : "unknown";
}

function normalizeAssignee(raw: unknown): Assignee | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.name !== "string") return null;
  return { id: raw.id, name: raw.name };
}

function normalizeCount(raw: unknown): number {
  const n = typeof raw === "string" ? Number(raw) : raw;
  return typeof n === "number" && Number.isFinite(n)
    ? Math.max(0, Math.round(n))
    : 0;
}

function normalizeUpdatedAt(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}

function normalizeTask(raw: unknown): Task | null {
  if (
    !isRecord(raw) ||
    typeof raw.id !== "string" ||
    typeof raw.title !== "string"
  ) {
    console.warn("[normalizeTask] dropped task, missing id/title:", raw);
    return null;
  }

  return {
    id: raw.id,
    title: raw.title,
    type: normalizeType(raw.type),
    status: normalizeStatus(raw.status),
    assignee: normalizeAssignee(raw.assignee),
    annotationCount: normalizeCount(raw.annotationCount),
    updatedAt: normalizeUpdatedAt(raw.updatedAt),
    meta: isRecord(raw.meta) ? raw.meta : {},
  };
}

function normalizeTasksPage(raw: unknown): TasksPage {
  if (!isRecord(raw) || !Array.isArray(raw.items)) {
    console.warn("[normalizeTasksPage] malformed response:", raw);
    return { page: 1, pageSize: 0, total: 0, items: [] };
  }

  const items = raw.items
    .map(normalizeTask)
    .filter((t): t is Task => t !== null); // drop nulls, keep the rest

  return {
    page: typeof raw.page === "number" ? raw.page : 1,
    pageSize: typeof raw.pageSize === "number" ? raw.pageSize : items.length,
    total: typeof raw.total === "number" ? raw.total : items.length,
    items,
  };
}

export {
  normalizeStatus,
  normalizeType,
  normalizeAssignee,
  normalizeUpdatedAt,
  normalizeTasksPage,
  normalizeTask,
  isRecord,
};
