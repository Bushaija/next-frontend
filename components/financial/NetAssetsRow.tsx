"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip } from "@/components/ui/tooltip";
import { financialTerms } from "@/lib/financialTerms";
import { formatCurrency } from "@/lib/formatter";
import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import { z } from "zod";

// Zod schema for validation
export const NetAssetsRowSchema = z.object({
  label: z.string(),
  note: z.string().optional(),
  surplus: z.number().or(z.string()).nullish(),
  adjustments: z.number().or(z.string()).nullish(),
  total: z.number().or(z.string()).nullish(),
  isTotal: z.boolean().optional(),
  indentLevel: z.number().optional(),
  className: z.string().optional(),
  hideIfEmpty: z.boolean().optional(),
  editable: z.boolean().optional(),
  error: z.record(z.string()).optional(),
  onValueChange: z.function()
    .args(z.object({ 
      field: z.enum(["surplus", "adjustments", "total", "note"]), 
      value: z.union([z.string(), z.number()]) 
    }))
    .optional(),
});

// Type derived from Zod schema
export type NetAssetsRowProps = z.infer<typeof NetAssetsRowSchema>;

// Function to calculate total from surplus and adjustments
const calculateTotal = (surplus: number | string | undefined | null, adjustments: number | string | undefined | null) => {
  const s = typeof surplus === 'number' ? surplus : parseFloat(surplus || '0') || 0;
  const a = typeof adjustments === 'number' ? adjustments : parseFloat(adjustments || '0') || 0;
  return s + a;
};

export function NetAssetsRow({ 
  label, 
  note, 
  surplus, 
  adjustments,
  total,
  isTotal = false,
  indentLevel = 0,
  className,
  hideIfEmpty = false,
  editable = false,
  error,
  onValueChange
}: NetAssetsRowProps) {
  // State for editable values
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  // Skip rendering if values are empty and hideIfEmpty is true
  if (hideIfEmpty && surplus == null && adjustments == null && total == null) {
    return null;
  }

  // Calculate indent class based on indentation level
  const indentClass = `pl-${4 + indentLevel * 4}`;
  
  // Dynamic total calculation
  const calculatedTotal = total ?? calculateTotal(surplus, adjustments);
  
  // Format number values as currency
  const formattedSurplus = typeof surplus === 'number' 
    ? formatCurrency(surplus) 
    : surplus || '';
    
  const formattedAdjustments = typeof adjustments === 'number' 
    ? formatCurrency(adjustments) 
    : adjustments || '';
    
  const formattedTotal = typeof calculatedTotal === 'number' 
    ? formatCurrency(calculatedTotal) 
    : calculatedTotal || '';
  
  // Check if this term has a tooltip explanation
  const hasTooltip = financialTerms[label] !== undefined;
  
  // Handle edit mode start
  const startEditing = (field: "surplus" | "adjustments" | "total" | "note") => {
    if (!editable) return;
    setIsEditing(field);
    
    // Set initial edit value based on field
    if (field === "note") {
      setEditValue(note || "");
    } else if (field === "surplus") {
      setEditValue(typeof surplus === 'number' ? surplus.toString() : surplus || "");
    } else if (field === "adjustments") {
      setEditValue(typeof adjustments === 'number' ? adjustments.toString() : adjustments || "");
    } else if (field === "total") {
      setEditValue(typeof calculatedTotal === 'number' ? calculatedTotal.toString() : calculatedTotal || "");
    }
  };
  
  // Handle edit save
  const saveEdit = () => {
    if (!isEditing || !onValueChange) return;
    
    // For number fields, convert to number if possible
    let finalValue: string | number = editValue;
    if (isEditing !== "note" && !isNaN(Number(editValue))) {
      finalValue = Number(editValue);
    }
    
    onValueChange({ field: isEditing as any, value: finalValue });
    setIsEditing(null);
    
    // If editing surplus or adjustments, also update total
    if ((isEditing === "surplus" || isEditing === "adjustments") && onValueChange) {
      const newSurplus = isEditing === "surplus" ? finalValue : surplus;
      const newAdjustments = isEditing === "adjustments" ? finalValue : adjustments;
      const newTotal = calculateTotal(newSurplus, newAdjustments);
      
      // We don't trigger this now to avoid extra renders, but it would be used in a real implementation
      // onValueChange({ field: "total", value: newTotal });
    }
  };
  
  // Get error message for field if present
  const getErrorMessage = (field: string) => {
    return error?.[field];
  };
  
  return (
    <TableRow 
      className={cn(
        "transition-colors",
        isTotal && "font-semibold bg-muted/20",
        className
      )}
    >
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
      
      {/* Surplus Cell */}
      <TableCell className="p-2 text-right">
        {isEditing === "surplus" ? (
          <div className="flex flex-col">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className={cn(
                "w-full border rounded p-1 text-right text-sm",
                getErrorMessage("surplus") && "border-red-500"
              )}
              autoFocus
            />
            {getErrorMessage("surplus") && (
              <span className="text-red-500 text-xs mt-1">{getErrorMessage("surplus")}</span>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded",
              getErrorMessage("surplus") && "text-red-500"
            )}
            onClick={() => startEditing("surplus")}
          >
            {formattedSurplus}
            {getErrorMessage("surplus") && (
              <span className="text-red-500 text-xs ml-1">!</span>
            )}
          </div>
        )}
      </TableCell>
      
      {/* Adjustments Cell */}
      <TableCell className="p-2 text-right">
        {isEditing === "adjustments" ? (
          <div className="flex flex-col">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className={cn(
                "w-full border rounded p-1 text-right text-sm",
                getErrorMessage("adjustments") && "border-red-500"
              )}
              autoFocus
            />
            {getErrorMessage("adjustments") && (
              <span className="text-red-500 text-xs mt-1">{getErrorMessage("adjustments")}</span>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded",
              getErrorMessage("adjustments") && "text-red-500"
            )}
            onClick={() => startEditing("adjustments")}
          >
            {formattedAdjustments}
            {getErrorMessage("adjustments") && (
              <span className="text-red-500 text-xs ml-1">!</span>
            )}
          </div>
        )}
      </TableCell>
      
      {/* Total Cell */}
      <TableCell className="p-2 text-right">
        {isEditing === "total" ? (
          <div className="flex flex-col">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className={cn(
                "w-full border rounded p-1 text-right text-sm",
                getErrorMessage("total") && "border-red-500"
              )}
              autoFocus
            />
            {getErrorMessage("total") && (
              <span className="text-red-500 text-xs mt-1">{getErrorMessage("total")}</span>
            )}
          </div>
        ) : (
          <div 
            className={cn(
              editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded",
              isTotal && "font-bold",
              getErrorMessage("total") && "text-red-500"
            )}
            onClick={() => startEditing("total")}
          >
            {formattedTotal}
            {getErrorMessage("total") && (
              <span className="text-red-500 text-xs ml-1">!</span>
            )}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
} 