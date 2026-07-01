import { Notice } from "@/components/Notice";
import type { Task } from "../types";
import { errorMessage, formatDate } from "../utils/taskFormat";
import { TaskStatusBadge } from "./TaskStatusBadge";

interface TaskDetailPanelProps {
  error: unknown;
  isFetching: boolean;
  task: Task | undefined;
}

export function TaskDetailPanel({
  error,
  isFetching,
  task,
}: TaskDetailPanelProps) {
  const message = errorMessage(error);

  return (
    <aside className="border-l border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">
            {task?.id ?? "Selected task"}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-950">
            {task?.title ?? "Loading task"}
          </h2>
        </div>
        {task && <TaskStatusBadge status={task.status} />}
      </div>

      {isFetching && <Notice>Refreshing task details...</Notice>}
      {message && <Notice tone="error">{message}</Notice>}
      {task?.title === "Unknown task" && (
        <div className="mt-3">
          <Notice tone="warning">
            Partial live-event task. The live event referenced this task before
            its full details were loaded.
          </Notice>
        </div>
      )}

      {task && (
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-zinc-500">Type</dt>
            <dd className="font-medium text-zinc-950">{task.type}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Assignee</dt>
            <dd className="font-medium text-zinc-950">
              {task.assignee?.name ?? "Unassigned"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Annotations</dt>
            <dd className="font-medium text-zinc-950">
              {task.annotationCount}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Updated</dt>
            <dd className="font-medium text-zinc-950">
              {formatDate(task.updatedAt)}
            </dd>
          </div>
        </dl>
      )}
    </aside>
  );
}
