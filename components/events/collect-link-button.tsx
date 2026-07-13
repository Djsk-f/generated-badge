"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CollectLinkButton({ eventId }: { eventId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/collect/${eventId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <Check className="w-4 h-4 mr-2 text-green-600" />
      ) : (
        <Share2 className="w-4 h-4 mr-2" />
      )}
      {copied ? "Copié !" : "Lien de collecte"}
    </Button>
  );
}
