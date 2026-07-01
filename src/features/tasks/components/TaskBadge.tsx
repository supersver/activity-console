import { Badge } from "@/components/Badge";
import type { TaskMeta, TaskStatus } from "@/features/tasks/types";
import { formatStatus } from "@/features/tasks/utils/taskFormat";

type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "violet";
type Priority = NonNullable<TaskMeta["priority"]>;

interface TaskBadgeProps<T extends string> {
  value: T;
  toneMap: Record<T, Tone>;
  format?: (v: T) => string;
}

function TaskBadge<T extends string>({
  value,
  toneMap,
  format,
}: TaskBadgeProps<T>) {
  return <Badge tone={toneMap[value]}>{format ? format(value) : value}</Badge>;
}

const STATUS_TONE: Record<TaskStatus, Tone> = {
  todo: "neutral",
  in_progress: "blue",
  qa: "violet",
  QA: "violet",
  done: "green",
  blocked: "red",
  unknown: "amber",
};

const PRIORITY_TONE: Record<Priority, Tone> = {
  high: "red",
  medium: "amber",
  low: "neutral",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <TaskBadge value={status} toneMap={STATUS_TONE} format={formatStatus} />
  );
}

export function TaskPriorityBadge({ priority }: { priority: Priority }) {
  return <TaskBadge value={priority} toneMap={PRIORITY_TONE} />;
}
