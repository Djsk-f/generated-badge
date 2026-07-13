/**
 * Tableau de participants avec pagination côté client.
 *
 * @module components/participants/participants-table
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import type { FieldDefinition } from "@/lib/types";

interface Participant {
  id: string;
  field_values: Record<string, string>;
}

interface Props {
  participants: Participant[];
  visibleColumns: FieldDefinition[];
  pageSize?: number;
}

export function ParticipantsTable({ participants, visibleColumns, pageSize = 10 }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(participants.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageItems = participants.slice(start, start + pageSize);

  return (
    <Card padding="none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200" style={{ background: "linear-gradient(180deg, #f5f3ff 0%, #fafafa 100%)" }}>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                #
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.map((p, i) => (
              <tr key={p.id} className="hover:bg-indigo-50/40 transition-colors duration-150">
                <td className="px-6 py-3.5 text-sm text-gray-400 font-mono">
                  {start + i + 1}
                </td>
                {visibleColumns.map((col) => (
                  <td
                    key={col.id}
                    className="px-6 py-3.5 text-sm text-gray-700"
                  >
                    {p.field_values[col.key] || <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer avec pagination */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {start + 1}–{Math.min(start + pageSize, participants.length)} sur {participants.length}
        </p>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </Card>
  );
}
