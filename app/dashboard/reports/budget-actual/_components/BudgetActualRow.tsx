import { useMemo } from "react";
import { BudgetRow } from "@/components/financial";
import { cn } from "@/lib/utils";

interface RowData {
  label: string;
  note?: string;
  originalBudget?: number | string;
  revisedBudget?: number | string;
  actualBudget?: number | string;
  isTotal?: boolean;
  indentLevel?: number;
}

interface BudgetActualRowProps {
  row: RowData;
  rowId: string;
  isEditMode: boolean;
  errors: Record<string, string> | undefined;
  getValue: (rowId: string, field: string, originalValue: string | number | undefined) => string | number | undefined;
  onValueChange: (rowId: string, data: { field: string; value: string | number }) => void;
}

// Helper functions for calculations
export const calculateVariance = (revised: string | number | undefined, actual: string | number | undefined) => {
  if (revised === undefined || actual === undefined) return undefined;
  
  const revisedValue = typeof revised === 'number' ? revised : parseFloat(revised || '0') || 0;
  const actualValue = typeof actual === 'number' ? actual : parseFloat(actual || '0') || 0;
  
  return revisedValue - actualValue;
};

export const calculatePerformance = (revised: string | number | undefined, actual: string | number | undefined) => {
  if (revised === undefined || actual === undefined) return undefined;
  
  const revisedValue = typeof revised === 'number' ? revised : parseFloat(revised || '0') || 0;
  const actualValue = typeof actual === 'number' ? actual : parseFloat(actual || '0') || 0;
  
  if (revisedValue === 0) return 0; // Avoid division by zero
  
  return (actualValue / revisedValue) * 100;
};

export function BudgetActualRow({
  row,
  rowId,
  isEditMode,
  errors,
  getValue,
  onValueChange
}: BudgetActualRowProps) {
  // Process the note value
  const noteValue = getValue(rowId, "note", row.note);
  const note = typeof noteValue === 'string' ? noteValue : undefined;
  
  // Get edited or original values
  const originalBudget = getValue(rowId, "originalBudget", row.originalBudget);
  const revisedBudget = getValue(rowId, "revisedBudget", row.revisedBudget);
  const actualBudget = getValue(rowId, "actualBudget", row.actualBudget);
  
  // Memoize expensive calculations
  const variance = useMemo(() => 
    calculateVariance(revisedBudget, actualBudget),
    [revisedBudget, actualBudget]
  );
  
  const performance = useMemo(() => 
    calculatePerformance(revisedBudget, actualBudget),
    [revisedBudget, actualBudget]
  );
  
  // Handle value changes
  const handleValueChange = (data: { field: string; value: string | number }) => {
    onValueChange(rowId, data);
  };
  
  // Generate field-specific classes for error highlighting
  const getFieldClass = (fieldName: string) => {
    if (!isEditMode || !errors || !errors[fieldName]) return "";
    return "input-error";
  };
  
  // Pass custom CSS classes for error fields
  const fieldClasses = {
    originalBudgetClass: getFieldClass("originalBudget"),
    revisedBudgetClass: getFieldClass("revisedBudget"),
    actualBudgetClass: getFieldClass("actualBudget"),
    noteClass: getFieldClass("note")
  };
  
  return (
    <BudgetRow 
      key={rowId}
      label={row.label}
      note={note}
      originalBudget={originalBudget}
      revisedBudget={revisedBudget}
      actualBudget={actualBudget}
      variance={variance}
      performance={performance}
      isTotal={row.isTotal}
      indentLevel={row.indentLevel}
      editable={isEditMode}
      onValueChange={handleValueChange}
      error={errors}
      className={cn(
        row.isTotal ? "bg-muted/30 font-semibold" : "",
        errors && Object.keys(errors).length > 0 ? "has-error" : ""
      )}
      fieldClasses={fieldClasses}
    />
  );
} 