import type { Task } from "../types";
import { formatDate } from "../utils/taskFormat";
import { TaskStatusBadge } from "./TaskStatusBadge";

interface TaskTableProps {
  isInitialLoading: boolean;
  selectedId: string | null;
  tasks: Task[];
  onSelect: (taskId: string) => void;
}

export function TaskTable({
  isInitialLoading,
  onSelect,
  selectedId,
  tasks,
}: TaskTableProps) {
  if (isInitialLoading) {
    return (
      <div className="space-y-2 bg-white p-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="h-10 animate-pulse rounded bg-zinc-100" key={index} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white p-12 text-center text-sm text-zinc-500">
        No tasks match the current view.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Task</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Assignee</th>
            <th className="px-4 py-3 font-semibold">Annotations</th>
            <th className="px-4 py-3 font-semibold">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              className={`cursor-pointer border-b border-zinc-100 hover:bg-zinc-50 ${
                selectedId === task.id ? "bg-blue-50" : ""
              }`}
              key={task.id}
              onClick={() => onSelect(task.id)}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-zinc-950">{task.title}</div>
                <div className="text-xs text-zinc-500">{task.id}</div>
              </td>
              <td className="px-4 py-3">{task.type}</td>
              <td className="px-4 py-3">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="px-4 py-3">
                {task.assignee?.name ?? "Unassigned"}
              </td>
              <td className="px-4 py-3">{task.annotationCount}</td>
              <td className="px-4 py-3">{formatDate(task.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
