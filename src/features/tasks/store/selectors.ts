import { createSelector } from "@reduxjs/toolkit";
import { tasksAdapter } from "./tasksSlice";
import type { RootState } from "@/lib/store";
import type { TasksState } from "./tasksSlice";
import type { TaskStatus, TaskType } from "../types";

const adapterSelectors = tasksAdapter.getSelectors<RootState>(
  (state): TasksState => state.tasks,
);

export const selectAllTasks = adapterSelectors.selectAll;
export const selectTaskById = adapterSelectors.selectById;
export const selectTaskIds = adapterSelectors.selectIds;

export interface TaskFilters {
  status?: TaskStatus;
  type?: TaskType;
  assigneeId?: string;
}

// Factory, not a singleton selector — each component instance needs its
// own memoized selector or they'd thrash each other's cache when filters
// differ across instances. Pair with useMemo in the consuming hook.
export const makeSelectFilteredSortedTasks = () =>
  createSelector(
    [selectAllTasks, (_: RootState, filters: TaskFilters) => filters],
    (tasks, filters) => {
      let result = tasks;
      if (filters.status)
        result = result.filter((t) => t.status === filters.status);
      if (filters.type) result = result.filter((t) => t.type === filters.type);
      if (filters.assigneeId)
        result = result.filter((t) => t.assignee?.id === filters.assigneeId);
      return [...result].sort((a, b) => b.updatedAt - a.updatedAt);
    },
  );
