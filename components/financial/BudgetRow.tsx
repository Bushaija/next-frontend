"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { financialTerms } from "@/lib/financialTerms";
import { formatCurrency, formatPercentage } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { z } from "zod";

// Zod schema for validation
export const BudgetRowSchema = z.object({
  label: z.string(),
  note: z.string().optional(),
  originalBudget: z.number().or(z.string()).nullish(),
  revisedBudget: z.number().or(z.string()).nullish(),
  actualBudget: z.number().or(z.string()).nullish(),
  variance: z.number().or(z.string()).nullish(),
  performance: z.number().or(z.string()).nullish(),
  isTotal: z.boolean().optional(),
  indentLevel: z.number().optional(),
  className: z.string().optional(),
  hideIfEmpty: z.boolean().optional(),
  editable: z.boolean().optional(),
  error: z.record(z.string()).optional(),
  onValueChange: z.function()
    .args(z.object({ 
      field: z.enum(["originalBudget", "revisedBudget", "actualBudget", "note"]), 
      value: z.union([z.string(), z.number()]) 
    }))
    .optional(),
});

// Type derived from Zod schema
export type BudgetRowProps = z.infer<typeof BudgetRowSchema>;

// Helper to calculate variance (revisedBudget - actualBudget)
const calculateVariance = (revised: string | number | null | undefined, actual: string | number | null | undefined) => {
  if (revised === undefined || revised === null || actual === undefined || actual === null) return null;
  
  const revisedValue = typeof revised === 'number' ? revised : parseFloat(revised) || 0;
  const actualValue = typeof actual === 'number' ? actual : parseFloat(actual) || 0;
  
  return revisedValue - actualValue;
};

// Helper to calculate performance percentage ((actual / revised) * 100)
const calculatePerformance = (revised: string | number | null | undefined, actual: string | number | null | undefined) => {
  if (revised === undefined || revised === null || actual === undefined || actual === null) return null;
  
  const revisedValue = typeof revised === 'number' ? revised : parseFloat(revised) || 0;
  const actualValue = typeof actual === 'number' ? actual : parseFloat(actual) || 0;
  
  if (revisedValue === 0) return 0; // Avoid division by zero
  
  return (actualValue / revisedValue) * 100;
};

export function BudgetRow({ 
  label, 
  note, 
  originalBudget, 
  revisedBudget, 
  actualBudget,
  variance: propVariance,
  performance: propPerformance,
  isTotal = false,
  indentLevel = 0,
  className,
  hideIfEmpty = false,
  editable = false,
  error,
  onValueChange
}: BudgetRowProps) {
  // State for editable values
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  // Skip rendering if all values are empty and hideIfEmpty is true
  if (hideIfEmpty && originalBudget == null && revisedBudget == null && actualBudget == null) {
    return null;
  }

  // Calculate indent class based on indentation level
  const indentClass = `pl-${4 + indentLevel * 4}`;
  
  // Calculate derived values if not provided
  const variance = propVariance ?? calculateVariance(revisedBudget, actualBudget);
  const performance = propPerformance ?? calculatePerformance(revisedBudget, actualBudget);
  
  // Format values for display
  const formattedOriginal = typeof originalBudget === 'number' 
    ? formatCurrency(originalBudget) 
    : originalBudget || '';
    
  const formattedRevised = typeof revisedBudget === 'number' 
    ? formatCurrency(revisedBudget) 
    : revisedBudget || '';
    
  const formattedActual = typeof actualBudget === 'number' 
    ? formatCurrency(actualBudget) 
    : actualBudget || '';
    
  const formattedVariance = typeof variance === 'number' 
    ? formatCurrency(variance) 
    : variance || '';
    
  const formattedPerformance = typeof performance === 'number' 
    ? formatPercentage(performance) 
    : performance || '';
  
  // Get the performance color based on percentage
  const getPerformanceColor = (perf: number | string | null | undefined) => {
    if (perf === null || perf === undefined) return '';
    
    const perfValue = typeof perf === 'number' ? perf : parseFloat(perf.toString());
    
    if (isNaN(perfValue)) return '';
    
    if (perfValue >= 100) return 'text-green-600';
    if (perfValue >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Check if this term has a tooltip explanation
  const hasTooltip = financialTerms[label] !== undefined;
  
  // Get error message for a field
  const getErrorMessage = (field: string) => {
    return error?.[field];
  };
  
  // Start editing a field
  const startEditing = (field: "originalBudget" | "revisedBudget" | "actualBudget" | "note") => {
    if (!editable) return;
    setIsEditing(field);
    
    // Set initial edit value based on field
    switch (field) {
      case "note":
        setEditValue(note || "");
        break;
      case "originalBudget":
        setEditValue(typeof originalBudget === 'number' ? originalBudget.toString() : originalBudget || "");
        break;
      case "revisedBudget":
        setEditValue(typeof revisedBudget === 'number' ? revisedBudget.toString() : revisedBudget || "");
        break;
      case "actualBudget":
        setEditValue(typeof actualBudget === 'number' ? actualBudget.toString() : actualBudget || "");
        break;
    }
  };
  
  // Save the current edit
  const saveEdit = () => {
    if (!isEditing || !onValueChange) return;
    
    // For number fields, convert to number if possible
    let finalValue: string | number = editValue;
    if (isEditing !== "note" && !isNaN(Number(editValue))) {
      finalValue = Number(editValue);
    }
    
    onValueChange({ field: isEditing, value: finalValue });
    setIsEditing(null);
    setEditValue("");
  };
  
  return (
    <TableRow 
      className={cn(
        "transition-colors",
        isTotal && "font-semibold bg-muted/20",
        className
      )}
    >
      {/* Description */}
      <TableCell className={cn("p-2", indentClass)}>
        <div className="flex items-center gap-1">
          {label}
          {hasTooltip && (
            <Tooltip content={financialTerms[label]}>
              <span className="inline-flex cursor-help text-muted-foreground">
                <InfoIcon size={14} />
              </span>
            </Tooltip>
          )}
        </div>
      </TableCell>
      
      {/* Notes */}
      <TableCell className="p-2 text-center">
        {isEditing === "note" ? (
          <div className="flex flex-col">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className={cn(
                "w-full border rounded p-1 text-center text-sm",
                getErrorMessage("note") && "border-red-500"
              )}
              autoFocus
            />
            {getErrorMessage("note") && (
              <span className="text-red-500 text-xs mt-1">{getErrorMessage("note")}</span>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded",
              getErrorMessage("note") && "text-red-500"
            )}
            onClick={() => startEditing("note")}
          >
            {note}
            {getErrorMessage("note") && (
              <span className="text-red-500 text-xs ml-1">!</span>
            )}
          </div>
        )}
      </TableCell>
      
      {/* Original Budget */}
      <TableCell className="p-2 text-right">
        {isEditing === "originalBudget" ? (
          <div className="flex flex-col">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className={cn(
                "w-full border rounded p-1 text-right text-sm",
                getErrorMessage("originalBudget") && "border-red-500"
              )}
              autoFocus
            />
            {getErrorMessage("originalBudget") && (
              <span className="text-red-500 text-xs mt-1">{getErrorMessage("originalBudget")}</span>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded",
              getErrorMessage("originalBudget") && "text-red-500"
            )}
            onClick={() => startEditing("originalBudget")}
          >
            {formattedOriginal}
            {getErrorMessage("originalBudget") && (
              <span className="text-red-500 text-xs ml-1">!</span>
            )}
          </div>
        )}
      </TableCell>
      
      {/* Revised Budget */}
      <TableCell className="p-2 text-right">
        {isEditing === "revisedBudget" ? (
          <div className="flex flex-col">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className={cn(
                "w-full border rounded p-1 text-right text-sm",
                getErrorMessage("revisedBudget") && "border-red-500"
              )}
              autoFocus
            />
            {getErrorMessage("revisedBudget") && (
              <span className="text-red-500 text-xs mt-1">{getErrorMessage("revisedBudget")}</span>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded",
              getErrorMessage("revisedBudget") && "text-red-500"
            )}
            onClick={() => startEditing("revisedBudget")}
          >
            {formattedRevised}
            {getErrorMessage("revisedBudget") && (
              <span className="text-red-500 text-xs ml-1">!</span>
            )}
          </div>
        )}
      </TableCell>
      
      {/* Actual Budget */}
      <TableCell className="p-2 text-right">
        {isEditing === "actualBudget" ? (
          <div className="flex flex-col">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className={cn(
                "w-full border rounded p-1 text-right text-sm",
                getErrorMessage("actualBudget") && "border-red-500"
              )}
              autoFocus
            />
            {getErrorMessage("actualBudget") && (
              <span className="text-red-500 text-xs mt-1">{getErrorMessage("actualBudget")}</span>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded",
              getErrorMessage("actualBudget") && "text-red-500"
            )}
            onClick={() => startEditing("actualBudget")}
          >
            {formattedActual}
            {getErrorMessage("actualBudget") && (
              <span className="text-red-500 text-xs ml-1">!</span>
            )}
          </div>
        )}
      </TableCell>
      
      {/* Variance (calculated) */}
      <TableCell className="p-2 text-right">
        <div className={cn(variance && variance < 0 ? "text-red-600" : "")}>
          {formattedVariance}
        </div>
      </TableCell>
      
      {/* Performance % (calculated) */}
      <TableCell className="p-2 text-right">
        <div className={cn(getPerformanceColor(performance))}>
          {formattedPerformance}
        </div>
      </TableCell>
    </TableRow>
  );
} 