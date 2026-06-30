"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/lib/hooks";
import {
  makeSelectFilteredSortedTasks,
  type TaskFilters,
} from "../store/selectors";

export function useFilteredTasks(filters: TaskFilters) {
  const selectFilteredSortedTasks = useMemo(
    () => makeSelectFilteredSortedTasks(),
    [],
  );
  return useAppSelector((state) => selectFilteredSortedTasks(state, filters));
}
