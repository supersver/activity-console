import { Badge } from "@/components/Badge";
import type { TaskStatus } from "../types";
import { formatStatus } from "../utils/taskFormat";

const STATUS_TONE: Record<
  TaskStatus,
  "neutral" | "blue" | "green" | "amber" | "red" | "violet"
> = {
  blocked: "red",
  done: "green",
  in_progress: "blue",
  qa: "violet",
  QA: "violet",
  todo: "neutral",
  unknown: "amber",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{formatStatus(status)}</Badge>;
}
