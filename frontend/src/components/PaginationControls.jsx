import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PaginationControls({ page, limit, totalPages, total, onPageChange, onLimitChange }) {
  if (total <= limit) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-3 py-2 text-sm text-muted">
      <label className="flex items-center gap-2">
        Rows per page:
        <select
          className="h-8 rounded border border-line bg-white px-2 text-ink outline-none focus:border-blue-600"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </label>
      <div className="flex items-center gap-1">
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-line bg-white disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            className={[
              "h-8 min-w-8 rounded border px-2",
              pageNumber === page
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-line bg-white text-ink",
            ].join(" ")}
            type="button"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-line bg-white disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
