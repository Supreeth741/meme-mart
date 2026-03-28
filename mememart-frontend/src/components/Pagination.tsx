'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-slate-500">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              p === page
                ? 'bg-primary text-bg-dark'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
