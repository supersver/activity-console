"use client";

import { useGetTasksQuery } from "@/features/tasks";

export default function Home() {
  const { data, isLoading } = useGetTasksQuery({ page: 1 });

  return (
    <main className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {isLoading && <p>Loading tasks...</p>}

        {!isLoading && data?.items.length === 0 && <p>No tasks found.</p>}

        <ul className="w-full space-y-2">
          {data?.items.map((task) => (
            <li key={task.id} className="flex justify-between border-b py-2">
              <span>{task.title}</span>
              <span className="text-sm text-zinc-500">{task.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
