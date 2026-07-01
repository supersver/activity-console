"use client";

import { useCallback, useMemo, useState } from "react";
import { Notice } from "@/components/Notice";
import { useAppSelector } from "@/lib/hooks";
import { useGetTaskByIdQuery, useGetTasksQuery } from "../api/getTasks";
import { useFilteredTasks, useTaskFeed, useTasksCache } from "../hooks";
import {
  selectCachedAt,
  selectDataSource,
  selectLastFreshAt,
  selectLastLiveEvent,
  selectTaskTotal,
  selectWsStatus,
} from "../store/tasksSlice";
import { selectTaskById } from "../store/selectors";
import type { TaskStatus, TaskType } from "../types";
import { errorMessage, formatDate } from "../utils/taskFormat";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { TaskPagination } from "./TaskPagination";
import { TaskTable } from "./TaskTable";
import {
  TaskToolbar,
  type TaskSortBy,
  type TaskSortDirection,
} from "./TaskToolbar";

export function TaskConsole() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TaskType | "all">("all");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [sortBy, setSortBy] = useState<TaskSortBy>("updatedAt");
  const [sortDirection, setSortDirection] = useState<TaskSortDirection>("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useTaskFeed();

  const filters = useMemo(
    () => ({
      search,
      sortBy,
      sortDirection,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
    }),
    [search, sortBy, sortDirection, status, type],
  );

  const tasks = useFilteredTasks(filters);
  const dataSource = useAppSelector(selectDataSource);
  const cachedAt = useAppSelector(selectCachedAt);
  const lastFreshAt = useAppSelector(selectLastFreshAt);
  const lastLiveEvent = useAppSelector(selectLastLiveEvent);
  const total = useAppSelector(selectTaskTotal);
  const wsStatus = useAppSelector(selectWsStatus);
  const selectedTask = useAppSelector((state) =>
    selectedId ? selectTaskById(state, selectedId) : undefined,
  );

  const { data, error, isError, isFetching, isLoading } = useGetTasksQuery(
    { page, pageSize },
    { refetchOnMountOrArgChange: true },
  );

  const handleCachedPage = useCallback(
    (cachedPage: { page: number; pageSize: number }) => {
      setPage(cachedPage.page);
      setPageSize(cachedPage.pageSize);
    },
    [],
  );

  const { cacheReadError, cacheWriteError } = useTasksCache(data, {
    onCachedPage: handleCachedPage,
  });

  const {
    data: selectedTaskDetails,
    error: selectedTaskError,
    isFetching: isSelectedTaskFetching,
  } = useGetTaskByIdQuery(selectedId ?? "", { skip: !selectedId });

  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  const selectedTaskForPanel = selectedTaskDetails ?? selectedTask;
  const requestMessage = errorMessage(error);

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Activity Console</h1>
            {wsStatus === "open" && (
              <span className="relative flex size-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex size-3 rounded-full bg-green-500"></span>
              </span>
            )}
            <p className="mt-1 text-sm text-zinc-600">{total} total tasks</p>
          </div>
          <span className="rounded border border-zinc-200 bg-zinc-50 px-3 py-2">
            Last event: {lastLiveEvent?.replace(".", " ") ?? "none"}
          </span>
        </div>
      </header>

      <section className="space-y-2 border-b border-zinc-200 bg-white px-6 py-3">
        {dataSource === "cached" && (
          <Notice tone="warning">
            Showing cached data from {formatDate(cachedAt)} while fresh data
            loads.
          </Notice>
        )}
        {dataSource === "fresh" && (
          <Notice tone="success">
            Fresh data loaded {formatDate(lastFreshAt)}.
            {isFetching ? " Refreshing in the background." : ""}
          </Notice>
        )}
        {isLoading && dataSource === "empty" && (
          <Notice>Loading tasks from the server...</Notice>
        )}
        {isError && (
          <Notice tone="error">
            {requestMessage}{" "}
            {tasks.length > 0
              ? "Keeping available task data visible."
              : "No task data is available yet."}
          </Notice>
        )}
        {(cacheReadError || cacheWriteError) && (
          <Notice tone="error">
            Cache error: {cacheReadError ?? cacheWriteError}
          </Notice>
        )}
      </section>

      <div
        className={
          selectedId
            ? "grid min-h-[calc(100vh-132px)] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]"
            : "min-h-[calc(100vh-132px)]"
        }
      >
        <section className="min-w-0">
          <TaskToolbar
            search={search}
            sortBy={sortBy}
            sortDirection={sortDirection}
            status={status}
            type={type}
            onSearchChange={setSearch}
            onSortByChange={setSortBy}
            onSortDirectionChange={setSortDirection}
            onStatusChange={setStatus}
            onTypeChange={setType}
          />

          <TaskTable
            isInitialLoading={isLoading && dataSource === "empty"}
            selectedId={selectedId}
            tasks={tasks}
            onSelect={setSelectedId}
          />

          <TaskPagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPage(1);
              setPageSize(nextPageSize);
            }}
          />
        </section>

        {selectedId && (
          <TaskDetailPanel
            error={selectedTaskError}
            isFetching={isSelectedTaskFetching}
            task={selectedTaskForPanel}
          />
        )}
      </div>
    </main>
  );
}
