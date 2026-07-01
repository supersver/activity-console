const PAGE_SIZES = [10, 20, 50, 100];

interface TaskPaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function TaskPagination({
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  totalPages,
}: TaskPaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <button
          className="rounded border border-zinc-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          type="button"
        >
          Previous
        </button>
        <span className="text-zinc-600">
          Page {page} of {totalPages}
        </span>
        <button
          className="rounded border border-zinc-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          type="button"
        >
          Next
        </button>
      </div>

      <label className="flex items-center gap-2 text-zinc-600">
        Rows
        <select
          className="rounded border border-zinc-300 px-2 py-2"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
