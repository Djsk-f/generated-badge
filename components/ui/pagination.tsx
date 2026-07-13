/**
 * Pagination moderne avec navigation par pages.
 *
 * @module components/ui/pagination
 */

"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

export function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Pages */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="px-2 py-1 text-gray-400">
            <MoreHorizontal className="w-4 h-4" />
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${
                          page === currentPage
                            ? "text-white shadow-md"
                            : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
            style={page === currentPage ? { background: "var(--gradient-primary)" } : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-gray-500 hover:bg-indigo-50 hover:text-indigo-600
                   disabled:opacity-30 disabled:cursor-not-allowed
                   transition-all duration-200"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
