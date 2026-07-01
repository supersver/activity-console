import { Notice } from "@/components/Notice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTaskSummary } from "../hooks";
import type { Task } from "../types";
import { errorMessage, formatDate } from "../utils/taskFormat";
import { TaskStatusBadge } from "./TaskBadge";

interface TaskDetailPanelProps {
  error: unknown;
  isFetching: boolean;
  onClose: () => void;
  task: Task | undefined;
}

export function TaskDetailPanel({
  error,
  isFetching,
  onClose,
  task,
}: TaskDetailPanelProps) {
  const message = errorMessage(error);
  const {
    error: summaryError,
    status: summaryStatus,
    summary,
  } = useTaskSummary(task?.id ?? null);

  function renderHtmlAsCodeBlocks(input: string) {
    return input
      .split("\n")
      .map((line) => {
        if (/<[^>]+>/.test(line)) {
          return "```html\n" + line + "\n```";
        }
        return line;
      })
      .join("\n");
  }

  return (
    <aside className="flex flex-col h-full overflow-y-auto border-l border-zinc-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">
            {task?.id ?? "Selected task"}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-950">
            {task?.title ?? "Loading task"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {task && <TaskStatusBadge status={task.status} />}
          <button
            aria-label="Close task details"
            className="rounded border border-zinc-300 px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>
      </div>
      {isFetching && <Notice>Refreshing task details...</Notice>}
      {message && <Notice tone="error">{message}</Notice>}
      {task?.title === "Unknown task" && (
        <div className="mt-3">
          <Notice tone="warning">
            Partial live-event task. The live event referenced this task before
            its full details were loaded.
          </Notice>
        </div>
      )}
      {task && (
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-zinc-500">Type</dt>
            <dd className="font-medium text-zinc-950">{task.type}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Assignee</dt>
            <dd className="font-medium text-zinc-950">
              {task.assignee?.name ?? "Unassigned"}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Annotations</dt>
            <dd className="font-medium text-zinc-950">
              {task.annotationCount}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Updated</dt>
            <dd className="font-medium text-zinc-950">
              {formatDate(task.updatedAt)}
            </dd>
          </div>
        </dl>
      )}
      <section className="mt-6 border-t border-zinc-200 pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-950">AI Summary</h3>
            {summaryStatus === "streaming" && (
              <span className="flex items-center gap-1 text-xs text-blue-500">
                <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-blue-500" />
                Generating
              </span>
            )}
            {summaryStatus === "done" && (
              <span className="text-xs text-emerald-600">✓ Done</span>
            )}
            {summaryStatus === "error" && (
              <span className="text-xs text-red-500">✗ Failed</span>
            )}
          </div>
        </div>
        {summaryError && <Notice tone="error">{summaryError}</Notice>}
        {!summary && summaryStatus === "streaming" && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 w-full rounded bg-zinc-100" />
            <div className="h-3 w-5/6 rounded bg-zinc-100" />
            <div className="h-3 w-4/6 rounded bg-zinc-100" />
          </div>
        )}
        {summaryStatus === "idle" && (
          <p className="text-sm text-zinc-400 italic">
            Select a task to generate a summary.
          </p>
        )}
        {summary && (
          <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 overflow-x-auto">
            <div className="prose prose-sm max-w-none text-zinc-800 prose-headings:text-zinc-900 prose-strong:text-zinc-900">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const isBlock = className?.includes("language-");
                    if (isBlock) {
                      return (
                        <pre className="overflow-x-auto rounded-md bg-zinc-950 p-3 text-sm text-zinc-50">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    }
                    return (
                      <code
                        className="rounded bg-zinc-200 px-1 py-0.5 text-xs text-zinc-800 font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {renderHtmlAsCodeBlocks(summary)}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </section>
    </aside>
  );
}
