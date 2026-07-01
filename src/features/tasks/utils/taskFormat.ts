import type { TaskStatus } from "../types";

export function formatStatus(status: TaskStatus) {
  return status.replace("_", " ");
}

export function formatDate(value: number | null | undefined) {
  if (!value) return "never";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function errorMessage(error: unknown) {
  if (!error) return null;

  if (typeof error === "object" && "status" in error) {
    return `Request failed (${String(error.status)}).`;
  }

  return error instanceof Error ? error.message : "Request failed.";
}
