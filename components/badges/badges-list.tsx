/**
 * Liste de participants avec badges et pagination.
 *
 * @module components/badges/badges-list
 */

"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { BadgeStatusIndicator } from "@/components/ui/badge-status";
import { Pagination } from "@/components/ui/pagination";

interface Participant {
  id: string;
  field_values: Record<string, string>;
}

interface Badge {
  participant_id: string;
  badge_code: string;
  status: string;
}

interface Props {
  participants: Participant[];
  badges: Badge[];
  displayNameKey: string | null;
  pageSize?: number;
}

export function BadgesList({
  participants,
  badges,
  displayNameKey,
  pageSize = 10,
}: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(participants.length / pageSize);
  const start = (page - 1) * pageSize;
  const pageItems = participants.slice(start, start + pageSize);

  const badgeMap = new Map(badges.map((b) => [b.participant_id, b]));

  const getDisplayName = (fv: Record<string, string>) => {
    if (displayNameKey && fv[displayNameKey]) return fv[displayNameKey];
    return Object.values(fv).find((v) => v) ?? "";
  };

  return (
    <Card padding="none">
      <div className="divide-y divide-gray-100">
        {pageItems.map((p) => {
          const badge = badgeMap.get(p.id);
          const status = badge?.status ?? null;

          return (
            <div
              key={p.id}
              className="flex items-center justify-between px-6 py-3.5 hover:bg-indigo-50/40 transition-colors duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                     style={{ background: "var(--gradient-cool)" }}>
                  <span className="text-xs font-semibold text-white">
                    {getDisplayName(p.field_values)?.[0] ?? "?"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getDisplayName(p.field_values) || "Sans nom"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Object.entries(p.field_values).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {badge?.badge_code && (
                  <span className="text-xs font-mono text-gray-400">
                    {badge.badge_code}
                  </span>
                )}
                {status ? (
                  <BadgeStatusIndicator status={status as any} />
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                    Pas de badge
                  </span>
                )}
              </div>
            </div>
          );
        })}
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
