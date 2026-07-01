import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { normalizeTask, normalizeTasksPage } from "../utils/normalize";
import type { Task, TasksPage } from "../types";

export interface GetTasksParams {
  page?: number;
  pageSize?: number;
}

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getTasks: builder.query<TasksPage, GetTasksParams | void>({
      query: (params) => ({ url: "/tasks", params: params ?? undefined }),
      transformResponse: (raw: unknown) => normalizeTasksPage(raw),
      providesTags: [{ type: "Task", id: "LIST" }],
    }),
    getTaskById: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      transformResponse: (raw: unknown) => {
        const task = normalizeTask(raw);
        if (!task) {
          throw new Error("Malformed task response");
        }
        return task;
      },
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),
  }),
});

export const { useGetTaskByIdQuery, useGetTasksQuery } = tasksApi;
