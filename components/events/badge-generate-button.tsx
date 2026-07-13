"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BadgeGenerateButton({
  eventId,
  disabled,
}: {
  eventId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/badges/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de la génération");
        return;
      }

      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleGenerate}
        disabled={disabled || loading}
        variant="outline"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <BadgeCheck className="w-4 h-4 mr-2" />
        )}
        Générer les badges
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
