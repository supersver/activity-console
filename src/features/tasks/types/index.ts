export type TaskType = "image" | "audio" | "text" | "video" | "unknown";
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "qa"
  | "QA"
  | "blocked"
  | "done"
  | "unknown";

export interface Assignee {
  id: string;
  name: string;
}

export interface TaskMeta {
  priority?: "high" | "medium" | "low";
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  assignee: Assignee | null;
  annotationCount: number;
  updatedAt: number; // always epoch ms
  meta: TaskMeta;
}

export interface TasksPage {
  page: number;
  pageSize: number;
  total: number;
  items: Task[];
}
