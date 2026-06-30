import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { normalizeTasksPage } from "../utils/normalize";
import type { TasksPage } from "../types";

export const tasksApi = createApi({
  reducerPath: "tasksApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL }),
  tagTypes: ["Task"],
  endpoints: (builder) => ({
    getTasks: builder.query<TasksPage, { page?: number } | void>({
      query: (params) => ({ url: "/tasks", params: params ?? undefined }),
      transformResponse: (raw: unknown) => normalizeTasksPage(raw),
      providesTags: [{ type: "Task", id: "LIST" }],
    }),
  }),
});

export const { useGetTasksQuery } = tasksApi;
