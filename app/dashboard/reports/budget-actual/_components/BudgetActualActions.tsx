import { cn } from "@/lib/utils";

interface BudgetActualActionsProps {
  isEditMode: boolean;
  isSaving: boolean;
  hasErrors: boolean;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
}

export function BudgetActualActions({
  isEditMode,
  isSaving,
  hasErrors,
  onSave,
  onCancel,
  onEdit
}: BudgetActualActionsProps) {
  return (
    <div className="flex justify-end gap-2 mb-4 print:hidden">
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
              "px-4 py-2 rounded transition-colors flex items-center gap-2",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            disabled={isSaving || hasErrors}
            aria-busy={isSaving}
          >
            {isSaving && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {isSaving && (
            <p className="text-sm text-muted-foreground self-center ml-2">Saving your changes...</p>
          )}
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