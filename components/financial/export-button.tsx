// components/ExportButton.tsx
"use client";

import { Printer } from "lucide-react";

export function ExportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
    >
      <Printer className="w-4 h-4" />
      Print / Export to PDF
    </button>
  );
}
