// components/EditModeButton.tsx
"use client";

import { PencilLine } from "lucide-react";
import { cn } from "@/lib/utils"; // or use your own `cn` function

interface EditModeButtonProps {
  isEditMode: boolean;
  onToggle: () => void;
}

export function EditModeButton({ isEditMode, onToggle }: EditModeButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "px-4 py-2 rounded-md flex items-center gap-2",
        isEditMode
          ? "bg-secondary text-secondary-foreground"
          : "bg-primary text-primary-foreground"
      )}
    >
      <PencilLine className="w-4 h-4" />
      {isEditMode ? "Exit Edit Mode" : "Enable Edit Mode"}
    </button>
  );
}
