"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "var(--font-display), system-ui, sans-serif",
            borderRadius: "12px",
            padding: "12px 16px",
          },
        }}
      />
    </>
  );
}
