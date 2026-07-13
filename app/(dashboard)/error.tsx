/**
 * Error Boundary pour le dashboard.
 *
 * @module app/(dashboard)/error
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Oups, une erreur s'est produite
        </h2>
        <p className="text-gray-500 mt-2">
          {error.message || "Une erreur inattendue a eu lieu."}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-1 font-mono">
            ID d'erreur : {error.digest}
          </p>
        )}
      </div>
      <Button onClick={reset} variant="outline">
        Réessayer
      </Button>
    </div>
  );
}
