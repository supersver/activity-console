import { fireEvent, render, screen, within } from "@testing-library/react";
import { TaskTable } from "./TaskTable";
import type { Task } from "../types";

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? "t1",
    title: overrides.title ?? "Inspect transcript",
    type: overrides.type ?? "text",
    status: overrides.status ?? "todo",
    assignee:
      "assignee" in overrides
        ? (overrides.assignee ?? null)
        : { id: "u1", name: "Asha" },
    annotationCount: overrides.annotationCount ?? 3,
    updatedAt: overrides.updatedAt ?? Date.parse("2024-06-28T20:00:00.000Z"),
    meta: overrides.meta ?? { priority: "high" },
  };
}

describe("TaskTable", () => {
  it("renders task rows with normalized display values", () => {
    render(
      <TaskTable
        isInitialLoading={false}
        selectedId={null}
        tasks={[task()]}
        onSelect={jest.fn()}
      />,
    );

    const row = screen.getByRole("row", { name: /inspect transcript/i });
    expect(within(row).getByText("t1")).toBeVisible();
    expect(within(row).getByText("text")).toBeVisible();
    expect(within(row).getByText("todo")).toBeVisible();
    expect(within(row).getByText("Asha")).toBeVisible();
    expect(within(row).getByText("3")).toBeVisible();
    expect(within(row).getByText("high")).toBeVisible();
  });

  it("calls onSelect with the task id when a task row is clicked", () => {
    const onSelect = jest.fn();

    render(
      <TaskTable
        isInitialLoading={false}
        selectedId={null}
        tasks={[task()]}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("row", { name: /inspect transcript/i }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("t1");
  });

  it("marks the selected row without selecting other rows", () => {
    render(
      <TaskTable
        isInitialLoading={false}
        selectedId="t2"
        tasks={[
          task({ id: "t1", title: "First task" }),
          task({ id: "t2", title: "Second task" }),
        ]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole("row", { name: /first task/i })).not.toHaveClass(
      "bg-blue-50",
    );
    expect(screen.getByRole("row", { name: /second task/i })).toHaveClass(
      "bg-blue-50",
    );
  });

  it("shows fallback values for unassigned tasks without priority", () => {
    render(
      <TaskTable
        isInitialLoading={false}
        selectedId={null}
        tasks={[task({ assignee: null, meta: {} })]}
        onSelect={jest.fn()}
      />,
    );

    const row = screen.getByRole("row", { name: /inspect transcript/i });
    expect(within(row).getByText("Unassigned")).toBeVisible();
    expect(within(row).getByText("-")).toBeVisible();
  });

  it("shows loading placeholders instead of rows while initially loading", () => {
    render(
      <TaskTable
        isInitialLoading
        selectedId={null}
        tasks={[task()]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("Inspect transcript")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".animate-pulse")).toHaveLength(6);
  });

  it("shows an empty state when there are no rows", () => {
    render(
      <TaskTable
        isInitialLoading={false}
        selectedId={null}
        tasks={[]}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText("No tasks match the current view.")).toBeVisible();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
