import {
  isRecord,
  normalizeAssignee,
  normalizeMeta,
  normalizeStatus,
  normalizeTask,
  normalizeTasksPage,
  normalizeType,
  normalizeUpdatedAt,
} from "./normalize";

describe("normalize utils", () => {
  const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

  beforeEach(() => {
    warnSpy.mockClear();
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  describe("isRecord", () => {
    it("returns true for plain objects", () => {
      expect(isRecord({ a: 1 })).toBe(true);
    });

    it("returns false for null, arrays, and primitives", () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord([1, 2, 3])).toBe(false);
      expect(isRecord("x")).toBe(false);
      expect(isRecord(123)).toBe(false);
    });
  });

  describe("normalizeStatus", () => {
    it("normalizes common status values", () => {
      expect(normalizeStatus("todo")).toBe("todo");
      expect(normalizeStatus("inprogress")).toBe("in_progress");
      expect(normalizeStatus("in progress")).toBe("in_progress");
      expect(normalizeStatus("in-progress")).toBe("in_progress");
      expect(normalizeStatus("blocked")).toBe("blocked");
      expect(normalizeStatus("done")).toBe("done");
    });

    it("keeps QA as QA", () => {
      expect(normalizeStatus("QA")).toBe("QA");
    });

    it("returns unknown for unsupported values", () => {
      expect(normalizeStatus("review")).toBe("unknown");
      expect(normalizeStatus(123)).toBe("unknown");
      expect(normalizeStatus(null)).toBe("unknown");
    });
  });

  describe("normalizeType", () => {
    it("normalizes valid task types", () => {
      expect(normalizeType("image")).toBe("image");
      expect(normalizeType("audio")).toBe("audio");
      expect(normalizeType("text")).toBe("text");
      expect(normalizeType("video")).toBe("video");
    });

    it("returns unknown for invalid values", () => {
      expect(normalizeType("doc")).toBe("unknown");
      expect(normalizeType(1)).toBe("unknown");
      expect(normalizeType(undefined)).toBe("unknown");
    });
  });

  describe("normalizeAssignee", () => {
    it("returns a valid assignee object", () => {
      expect(normalizeAssignee({ id: "u1", name: "Asha" })).toEqual({
        id: "u1",
        name: "Asha",
      });
    });

    it("returns null for malformed values", () => {
      expect(normalizeAssignee(null)).toBeNull();
      expect(normalizeAssignee({ id: "u1" })).toBeNull();
      expect(normalizeAssignee({ name: "Asha" })).toBeNull();
      expect(normalizeAssignee(["u1", "Asha"])).toBeNull();
    });
  });

  describe("normalizeUpdatedAt", () => {
    it("keeps valid numbers", () => {
      expect(normalizeUpdatedAt(1719600000000)).toBe(1719600000000);
    });

    it("parses valid ISO strings", () => {
      expect(normalizeUpdatedAt("2024-06-28T12:00:00.000Z")).toBe(
        Date.parse("2024-06-28T12:00:00.000Z"),
      );
    });

    it("returns 0 for invalid values", () => {
      expect(normalizeUpdatedAt("not-a-date")).toBe(0);
      expect(normalizeUpdatedAt(NaN)).toBe(0);
      expect(normalizeUpdatedAt(null)).toBe(0);
    });
  });

  describe("normalizeMeta", () => {
    it("keeps valid priority and note and preserves extra fields", () => {
      expect(
        normalizeMeta({
          priority: "high",
          note: "rush",
          owner: "team-a",
        }),
      ).toEqual({
        priority: "high",
        note: "rush",
        owner: "team-a",
      });
    });

    it("drops invalid priority and invalid note", () => {
      expect(
        normalizeMeta({
          priority: "urgent",
          note: 123,
          extra: true,
        }),
      ).toEqual({
        extra: true,
      });
    });

    it("returns empty object for non-record input", () => {
      expect(normalizeMeta(null)).toEqual({});
      expect(normalizeMeta("x")).toEqual({});
      expect(normalizeMeta([1, 2, 3])).toEqual({});
    });
  });

  describe("normalizeTask", () => {
    it("normalizes a valid task", () => {
      expect(
        normalizeTask({
          id: "t1",
          title: "Task 1",
          type: "Image",
          status: "in progress",
          assignee: { id: "u1", name: "Asha" },
          annotationCount: "3",
          updatedAt: "2024-06-28T12:00:00.000Z",
          meta: {
            priority: "medium",
            note: "check",
            source: "ws",
          },
        }),
      ).toEqual({
        id: "t1",
        title: "Task 1",
        type: "image",
        status: "in_progress",
        assignee: { id: "u1", name: "Asha" },
        annotationCount: 3,
        updatedAt: Date.parse("2024-06-28T12:00:00.000Z"),
        meta: {
          priority: "medium",
          note: "check",
          source: "ws",
        },
      });
    });

    it("drops tasks missing id or title", () => {
      expect(
        normalizeTask({
          title: "Missing id",
          type: "image",
        }),
      ).toBeNull();

      expect(
        normalizeTask({
          id: "t2",
          type: "image",
        }),
      ).toBeNull();

      expect(warnSpy).toHaveBeenCalled();
    });

    it("uses safe fallbacks for bad fields", () => {
      expect(
        normalizeTask({
          id: "t3",
          title: "Task 3",
          type: "doc",
          status: "review",
          assignee: { bad: "data" },
          annotationCount: "not-a-number",
          updatedAt: "bad-date",
          meta: { priority: "urgent", note: 123 },
        }),
      ).toEqual({
        id: "t3",
        title: "Task 3",
        type: "unknown",
        status: "unknown",
        assignee: null,
        annotationCount: 0,
        updatedAt: 0,
        meta: {},
      });
    });
  });

  describe("normalizeTasksPage", () => {
    it("normalizes a full page and drops invalid tasks", () => {
      expect(
        normalizeTasksPage({
          page: 2,
          pageSize: 20,
          total: 50,
          items: [
            {
              id: "t1",
              title: "Task 1",
              type: "audio",
              status: "done",
              assignee: null,
              annotationCount: 1,
              updatedAt: 1719600000000,
              meta: {},
            },
            {
              title: "Broken task",
              type: "text",
            },
          ],
        }),
      ).toEqual({
        page: 2,
        pageSize: 20,
        total: 50,
        items: [
          {
            id: "t1",
            title: "Task 1",
            type: "audio",
            status: "done",
            assignee: null,
            annotationCount: 1,
            updatedAt: 1719600000000,
            meta: {},
          },
        ],
      });
    });

    it("returns safe defaults for malformed responses", () => {
      expect(normalizeTasksPage(null)).toEqual({
        page: 1,
        pageSize: 0,
        total: 0,
        items: [],
      });

      expect(normalizeTasksPage({ page: 1 })).toEqual({
        page: 1,
        pageSize: 0,
        total: 0,
        items: [],
      });

      expect(warnSpy).toHaveBeenCalled();
    });

    it("falls back pageSize and total to item length when missing", () => {
      expect(
        normalizeTasksPage({
          items: [
            {
              id: "t1",
              title: "Task 1",
              type: "text",
              status: "todo",
              assignee: null,
              annotationCount: 0,
              updatedAt: 1719600000000,
              meta: {},
            },
          ],
        }),
      ).toEqual({
        page: 1,
        pageSize: 1,
        total: 1,
        items: [
          {
            id: "t1",
            title: "Task 1",
            type: "text",
            status: "todo",
            assignee: null,
            annotationCount: 0,
            updatedAt: 1719600000000,
            meta: {},
          },
        ],
      });
    });
  });
});
