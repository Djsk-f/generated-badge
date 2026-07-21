"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
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
    toast.error("Erreur lors du chargement", {
      description: error.message || "Impossible de charger les données.",
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      <p className="text-gray-500">Impossible de charger les données.</p>
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
