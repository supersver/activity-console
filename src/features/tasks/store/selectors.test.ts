import {
  makeSelectFilteredSortedTasks,
  selectCurrentPageTasks,
} from "./selectors";
import type { RootState } from "@/lib/store";
import type { Task } from "../types";

function task(overrides: Partial<Task> & Pick<Task, "id" | "title">): Task {
  return {
    id: overrides.id,
    title: overrides.title,
    type: overrides.type ?? "text",
    status: overrides.status ?? "todo",
    assignee: overrides.assignee ?? null,
    annotationCount: overrides.annotationCount ?? 0,
    updatedAt: overrides.updatedAt ?? 0,
    meta: overrides.meta ?? {},
  };
}

function state(tasks: Task[], currentPageIds: string[]): RootState {
  return {
    tasks: {
      ids: tasks.map((item) => item.id),
      entities: Object.fromEntries(tasks.map((item) => [item.id, item])),
      page: 1,
      pageSize: currentPageIds.length,
      total: tasks.length,
      currentPageIds,
      dataSource: "fresh",
      cachedAt: null,
      lastFreshAt: 123,
      lastLiveEvent: null,
      wsStatus: "idle",
    },
    tasksApi: {} as RootState["tasksApi"],
  };
}

describe("task selectors", () => {
  it("returns only current-page tasks in current-page order", () => {
    const first = task({ id: "t1", title: "First" });
    const second = task({ id: "t2", title: "Second" });
    const offPage = task({ id: "t3", title: "Off page" });

    const result = selectCurrentPageTasks(
      state([first, second, offPage], ["t2", "missing", "t1"]),
    );

    expect(result.map((item) => item.id)).toEqual(["t2", "t1"]);
  });

  it("filters by status, type, assignee, and search before sorting by title", () => {
    const selectFiltered = makeSelectFilteredSortedTasks();
    const rootState = state(
      [
        task({
          id: "t1",
          title: "Beta image",
          status: "done",
          type: "image",
          assignee: { id: "u1", name: "Asha" },
          updatedAt: 20,
        }),
        task({
          id: "t2",
          title: "Alpha image",
          status: "done",
          type: "image",
          assignee: { id: "u1", name: "Asha" },
          updatedAt: 10,
        }),
        task({
          id: "t3",
          title: "Alpha audio",
          status: "done",
          type: "audio",
          assignee: { id: "u1", name: "Asha" },
          updatedAt: 30,
        }),
        task({
          id: "t4",
          title: "Alpha image other user",
          status: "done",
          type: "image",
          assignee: { id: "u2", name: "Ben" },
          updatedAt: 40,
        }),
      ],
      ["t1", "t2", "t3", "t4"],
    );

    const result = selectFiltered(rootState, {
      assigneeId: "u1",
      search: "image",
      sortBy: "title",
      sortDirection: "asc",
      status: "done",
      type: "image",
    });

    expect(result.map((item) => item.id)).toEqual(["t2", "t1"]);
  });

  it("searches by title, id, and assignee name case-insensitively", () => {
    const selectFiltered = makeSelectFilteredSortedTasks();
    const rootState = state(
      [
        task({ id: "TASK-100", title: "Transcript", updatedAt: 1 }),
        task({
          id: "t2",
          title: "Image review",
          assignee: { id: "u1", name: "Chen" },
          updatedAt: 2,
        }),
        task({ id: "t3", title: "Audio cleanup", updatedAt: 3 }),
      ],
      ["TASK-100", "t2", "t3"],
    );

    expect(
      selectFiltered(rootState, { search: "task-100" }).map((item) => item.id),
    ).toEqual(["TASK-100"]);
    expect(
      selectFiltered(rootState, { search: "chen" }).map((item) => item.id),
    ).toEqual(["t2"]);
    expect(
      selectFiltered(rootState, { search: "cleanup" }).map((item) => item.id),
    ).toEqual(["t3"]);
  });

  it("sorts by updatedAt descending by default and ascending when requested", () => {
    const selectFiltered = makeSelectFilteredSortedTasks();
    const rootState = state(
      [
        task({ id: "old", title: "Old", updatedAt: 1 }),
        task({ id: "new", title: "New", updatedAt: 3 }),
        task({ id: "middle", title: "Middle", updatedAt: 2 }),
      ],
      ["old", "new", "middle"],
    );

    expect(selectFiltered(rootState, {}).map((item) => item.id)).toEqual([
      "new",
      "middle",
      "old",
    ]);
    expect(
      selectFiltered(rootState, {
        sortBy: "updatedAt",
        sortDirection: "asc",
      }).map((item) => item.id),
    ).toEqual(["old", "middle", "new"]);
  });

  it("memoizes results for the same state and filter object", () => {
    const selectFiltered = makeSelectFilteredSortedTasks();
    const rootState = state(
      [task({ id: "t1", title: "Memoized", updatedAt: 1 })],
      ["t1"],
    );
    const filters = { search: "memo" };

    const first = selectFiltered(rootState, filters);
    const second = selectFiltered(rootState, filters);

    expect(second).toBe(first);
  });
});
