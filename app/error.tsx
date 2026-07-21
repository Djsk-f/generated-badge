"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    toast.error("Une erreur inattendue s'est produite", {
      description: error.message || "Veuillez réessayer.",
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <p className="text-gray-500 mb-4">Une erreur s'est produite.</p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
