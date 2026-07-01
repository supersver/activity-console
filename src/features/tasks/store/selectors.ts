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
  search?: string;
  sortBy?: "updatedAt" | "title";
  sortDirection?: "asc" | "desc";
}

// Factory, not a singleton selector: each component instance needs its
// own memoized selector or they'd thrash each other's cache when filters
// differ across instances. Pair with useMemo in the consuming hook.
export const makeSelectFilteredSortedTasks = () =>
  createSelector(
    [selectAllTasks, (_: RootState, filters: TaskFilters) => filters],
    (tasks, filters) => {
      let result = tasks;

      if (filters.status) {
        result = result.filter((task) => task.status === filters.status);
      }

      if (filters.type) {
        result = result.filter((task) => task.type === filters.type);
      }

      if (filters.assigneeId) {
        result = result.filter(
          (task) => task.assignee?.id === filters.assigneeId,
        );
      }

      if (filters.search?.trim()) {
        const query = filters.search.trim().toLowerCase();
        result = result.filter(
          (task) =>
            task.id.toLowerCase().includes(query) ||
            task.title.toLowerCase().includes(query) ||
            task.assignee?.name.toLowerCase().includes(query),
        );
      }

      const direction = filters.sortDirection === "asc" ? 1 : -1;
      const sortBy = filters.sortBy ?? "updatedAt";

      return [...result].sort((a, b) => {
        if (sortBy === "title") {
          return direction * a.title.localeCompare(b.title);
        }

        return direction * (a.updatedAt - b.updatedAt);
      });
    },
  );
