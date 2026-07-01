"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { readCachedTasksPage, writeCachedTasksPage } from "../cache/tasksCache";
import { tasksCacheLoaded } from "../store/tasksSlice";
import type { TasksPage } from "../types";

interface UseTasksCacheOptions {
  onCachedPage?: (page: Pick<TasksPage, "page" | "pageSize">) => void;
}

function runWhenIdle(work: () => void) {
  if (typeof window === "undefined") return;

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(work, { timeout: 1500 });
    return;
  }

  window.setTimeout(work, 0);
}

export function useTasksCache(
  latestPage: TasksPage | undefined,
  { onCachedPage }: UseTasksCacheOptions = {},
) {
  const dispatch = useAppDispatch();
  const [readError, setReadError] = useState<string | null>(null);
  const [writeError, setWriteError] = useState<string | null>(null);
  const latestCacheKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    readCachedTasksPage()
      .then((cachedPage) => {
        if (cancelled || !cachedPage) return;
        dispatch(tasksCacheLoaded(cachedPage));
        onCachedPage?.({
          page: cachedPage.page,
          pageSize: cachedPage.pageSize,
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setReadError(error instanceof Error ? error.message : String(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, onCachedPage]);

  useEffect(() => {
    if (!latestPage) return;

    const cacheKey = `${latestPage.page}:${latestPage.pageSize}:${latestPage.total}:${latestPage.items
      .map((task) => `${task.id}:${task.updatedAt}`)
      .join("|")}`;

    if (latestCacheKeyRef.current === cacheKey) return;
    latestCacheKeyRef.current = cacheKey;

    runWhenIdle(() => {
      writeCachedTasksPage(latestPage).catch((error: unknown) => {
        setWriteError(error instanceof Error ? error.message : String(error));
      });
    });
  }, [latestPage]);

  return {
    cacheReadError: readError,
    cacheWriteError: writeError,
  };
}
