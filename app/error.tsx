/**
 * Error Boundary global (racine).
 *
 * @module app/error
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-2xl">⚠️</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Oups, une erreur s'est produite
          </h1>
          <p className="text-gray-500 mt-2">
            {error.message || "Une erreur inattendue a eu lieu."}
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-2 font-mono">
              ID d'erreur : {error.digest}
            </p>
          )}
        </div>
        <Button onClick={reset} size="lg">
          Réessayer
        </Button>
      </div>
    </div>
  );
}
