"use client";

import { useEffect, useState } from "react";

type SummaryStatus = "idle" | "streaming" | "done" | "error";

interface SummaryState {
  taskId: string;
  summary: string;
  status: Exclude<SummaryStatus, "idle">;
  error: string | null;
}

function getSummaryUrl(taskId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  return `${baseUrl}/tasks/${encodeURIComponent(taskId)}/summary`;
}

export function useTaskSummary(taskId: string | null) {
  const [state, setState] = useState<SummaryState | null>(null);

  useEffect(() => {
    if (!taskId) return;

    const source = new EventSource(getSummaryUrl(taskId));

    source.onmessage = (event) => {
      try {
        const chunk = JSON.parse(event.data);
        if (typeof chunk !== "string") return;

        setState((current) => ({
          taskId,
          summary:
            current?.taskId === taskId ? `${current.summary}${chunk}` : chunk,
          status: "streaming",
          error: null,
        }));
      } catch {
        setState((current) => ({
          taskId,
          summary:
            current?.taskId === taskId
              ? `${current.summary}${event.data}`
              : event.data,
          status: "streaming",
          error: null,
        }));
      }
    };

    source.addEventListener("done", () => {
      setState((current) => ({
        taskId,
        summary: current?.taskId === taskId ? current.summary : "",
        status: "done",
        error: null,
      }));
      source.close();
    });

    source.onerror = () => {
      setState((current) => ({
        taskId,
        summary: current?.taskId === taskId ? current.summary : "",
        status: "error",
        error: "Summary stream failed.",
      }));
      source.close();
    };

    return () => source.close();
  }, [taskId]);

  if (!taskId) {
    return { error: null, status: "idle" as const, summary: "" };
  }

  if (state?.taskId !== taskId) {
    return { error: null, status: "streaming" as const, summary: "" };
  }

  return {
    error: state.error,
    status: state.status,
    summary: state.summary,
  };
}
