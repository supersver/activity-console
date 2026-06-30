import { configureStore } from "@reduxjs/toolkit";
import { tasksApi, tasksReducer } from "@/features/tasks";

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    [tasksApi.reducerPath]: tasksApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(tasksApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
