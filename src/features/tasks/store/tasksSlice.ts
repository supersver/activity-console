import {
  createEntityAdapter,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { tasksApi } from "../api/getTasks";
import {
  isRecord,
  normalizeAssignee,
  normalizeStatus,
} from "../utils/normalize";
import type { Task } from "../types";
import type { RootState } from "@/lib/store";

export const tasksAdapter = createEntityAdapter<Task>();

interface TasksMeta {
  page: number;
  pageSize: number;
  total: number;
  wsStatus: "idle" | "connecting" | "open" | "closed" | "error";
}

const initialState = tasksAdapter.getInitialState<TasksMeta>({
  page: 1,
  pageSize: 0,
  total: 0,
  wsStatus: "idle",
});

export type TasksState = typeof initialState;

function ensureTask(state: TasksState, id: string): Task {
  const existing = state.entities[id];
  if (existing) return existing;

  const stub: Task = {
    id,
    title: "Unknown task",
    type: "unknown",
    status: "unknown",
    assignee: null,
    annotationCount: 0,
    updatedAt: Date.now(),
    meta: {},
  };

  tasksAdapter.addOne(state, stub);
  return stub;
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    wsStatusChanged(state, action: PayloadAction<TasksMeta["wsStatus"]>) {
      state.wsStatus = action.payload;
    },

    taskEventReceived(state, action: PayloadAction<unknown>) {
      const event = action.payload;

      if (
        !isRecord(event) ||
        typeof event.kind !== "string" ||
        !isRecord(event.payload)
      ) {
        console.warn("[tasksSlice] malformed WS event, ignored", event);
        return;
      }

      const { kind, payload } = event;

      switch (kind) {
        case "task.updated": {
          if (typeof payload.id !== "string") return;

          ensureTask(state, payload.id);

          tasksAdapter.updateOne(state, {
            id: payload.id,
            changes: {
              ...(typeof payload.status === "string" && {
                status: normalizeStatus(payload.status),
              }),
              updatedAt: Date.now(),
            },
          });
          break;
        }

        case "task.assigned": {
          if (typeof payload.id !== "string") return;

          ensureTask(state, payload.id);

          tasksAdapter.updateOne(state, {
            id: payload.id,
            changes: {
              assignee: normalizeAssignee(payload.assignee),
              updatedAt: Date.now(),
            },
          });
          break;
        }

        case "annotation.created": {
          if (typeof payload.taskId !== "string") return;

          const task = ensureTask(state, payload.taskId);

          tasksAdapter.updateOne(state, {
            id: payload.taskId,
            changes: {
              annotationCount: task.annotationCount + 1,
              updatedAt: Date.now(),
            },
          });
          break;
        }

        default:
          console.warn("[tasksSlice] unrecognized event kind", kind);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      tasksApi.endpoints.getTasks.matchFulfilled,
      (state, action) => {
        tasksAdapter.upsertMany(state, action.payload.items);
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
      },
    );
  },
});

export const { wsStatusChanged, taskEventReceived } = tasksSlice.actions;
export const tasksReducer = tasksSlice.reducer;
export default tasksReducer;

export const selectWsStatus = (state: RootState) => state.tasks.wsStatus;

export const selectPageInfo = (state: RootState) => ({
  page: state.tasks.page,
  pageSize: state.tasks.pageSize,
  total: state.tasks.total,
});
