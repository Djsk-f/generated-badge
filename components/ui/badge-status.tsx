/**
 * Badge de statut pour les badges.
 *
 * @module components/ui/badge-status
 */

import type { BadgeStatus } from "@/lib/types";

const statusConfig: Record<BadgeStatus, { label: string; color: string }> = {
  NOT_READY: { label: "Non prêt", color: "bg-gray-100 text-gray-700" },
  READY: { label: "Prêt", color: "bg-blue-100 text-blue-700" },
  GENERATING: { label: "Génération...", color: "bg-yellow-100 text-yellow-700" },
  GENERATED: { label: "Généré", color: "bg-green-100 text-green-700" },
  LOST: { label: "Perdu", color: "bg-red-100 text-red-700" },
  REPLACED: { label: "Remplacé", color: "bg-orange-100 text-orange-700" },
};

interface BadgeStatusProps {
  status: BadgeStatus;
  className?: string;
}

export function BadgeStatusIndicator({ status, className = "" }: BadgeStatusProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full
        text-xs font-medium
        ${config.color}
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}
