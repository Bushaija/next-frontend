import React from "react";
import { cn } from "@/lib/utils";

export interface ChangesInNetAssetsActionsProps {
  isEditMode: boolean;
  isSaving: boolean;
  hasErrors: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onPrint: () => void;
}

export function ChangesInNetAssetsActions({
  isEditMode,
  isSaving,
  hasErrors,
  hasChanges,
  onEdit,
  onSave,
  onCancel,
  onPrint
}: ChangesInNetAssetsActionsProps) {
  return (
    <div className="flex justify-end gap-2 mb-4 print:hidden">
      <button
        onClick={onPrint}
        className="px-4 py-2 rounded transition-colors bg-muted hover:bg-muted/80"
        aria-label="Print or save as PDF"
      >
        Print / Save as PDF
      </button>
      
      {isEditMode ? (
        <>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded transition-colors bg-muted hover:bg-muted/80"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className={cn(
              "px-4 py-2 rounded transition-colors",
              "bg-primary text-primary-foreground",
              hasChanges ? "hover:bg-primary/90" : "opacity-50 cursor-not-allowed"
            )}
            disabled={isSaving || hasErrors || !hasChanges}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      ) : (
        <button
          onClick={onEdit}
          className="px-4 py-2 rounded transition-colors bg-muted hover:bg-muted/80"
        >
          Edit Values
        </button>
      )}
    </div>
  );
} 