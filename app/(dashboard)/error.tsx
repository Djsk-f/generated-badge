"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error("Une erreur s'est produite", {
      description: error.message || "Veuillez réessayer.",
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
      <p className="text-gray-500">Une erreur s'est produite.</p>
      <Button onClick={reset} variant="outline">
        Réessayer
      </Button>
    </div>
  );
}
