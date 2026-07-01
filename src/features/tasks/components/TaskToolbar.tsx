import type { TaskStatus, TaskType } from "../types";
import { formatStatus } from "../utils/taskFormat";

export type TaskSortBy = "updatedAt" | "title";
export type TaskSortDirection = "asc" | "desc";

const TYPES: TaskType[] = ["image", "audio", "text", "video", "unknown"];
const STATUSES: TaskStatus[] = [
  "todo",
  "in_progress",
  "qa",
  "QA",
  "blocked",
  "done",
  "unknown",
];

interface TaskToolbarProps {
  search: string;
  sortBy: TaskSortBy;
  sortDirection: TaskSortDirection;
  status: TaskStatus | "all";
  type: TaskType | "all";
  onSearchChange: (value: string) => void;
  onSortByChange: (value: TaskSortBy) => void;
  onSortDirectionChange: (value: TaskSortDirection) => void;
  onStatusChange: (value: TaskStatus | "all") => void;
  onTypeChange: (value: TaskType | "all") => void;
}

export function TaskToolbar({
  onSearchChange,
  onSortByChange,
  onSortDirectionChange,
  onStatusChange,
  onTypeChange,
  search,
  sortBy,
  sortDirection,
  status,
  type,
}: TaskToolbarProps) {
  return (
    <div className="grid gap-3 border-b border-zinc-200 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_150px_160px_150px_140px]">
      <input
        className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
        placeholder="Search title, id, assignee"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <select
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
        value={type}
        onChange={(event) =>
          onTypeChange(event.target.value as TaskType | "all")
        }
      >
        <option value="all">All types</option>
        {TYPES.map((taskType) => (
          <option key={taskType} value={taskType}>
            {taskType}
          </option>
        ))}
      </select>

      <select
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
        value={status}
        onChange={(event) =>
          onStatusChange(event.target.value as TaskStatus | "all")
        }
      >
        <option value="all">All statuses</option>
        {STATUSES.map((taskStatus) => (
          <option key={taskStatus} value={taskStatus}>
            {formatStatus(taskStatus)}
          </option>
        ))}
      </select>

      <select
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
        value={sortBy}
        onChange={(event) => onSortByChange(event.target.value as TaskSortBy)}
      >
        <option value="updatedAt">Updated time</option>
        <option value="title">Title</option>
      </select>

      <select
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
        value={sortDirection}
        onChange={(event) =>
          onSortDirectionChange(event.target.value as TaskSortDirection)
        }
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
}
