/**
 * Error Boundary pour la section événements.
 *
 * @module app/(dashboard)/events/error
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Events Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-xl">⚠️</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Erreur lors du chargement
        </h2>
        <p className="text-gray-500 mt-2">
          {error.message || "Impossible de charger les données."}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-1 font-mono">
            ID d'erreur : {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </div>
  );
}
