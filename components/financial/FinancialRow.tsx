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
export const FinancialRowSchema = z.object({
  label: z.string(),
  note: z.string().optional(),
  fy2024Value: z.number().or(z.string()).nullish(),
  fy2023Value: z.number().or(z.string()).nullish(),
  isTotal: z.boolean().optional(),
  indentLevel: z.number().optional(),
  className: z.string().optional(),
  hideIfEmpty: z.boolean().optional(),
  editable: z.boolean().optional(),
  onValueChange: z.function()
    .args(z.object({ 
      field: z.enum(["fy2024Value", "fy2023Value", "note"]), 
      value: z.union([z.string(), z.number()]) 
    }))
    .optional(),
});

// Type derived from Zod schema
export type FinancialRowProps = z.infer<typeof FinancialRowSchema>;

export function FinancialRow({ 
  label, 
  note, 
  fy2024Value, 
  fy2023Value, 
  isTotal = false,
  indentLevel = 0,
  className,
  hideIfEmpty = false,
  editable = false,
  onValueChange
}: FinancialRowProps) {
  // State for editable values
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  // Skip rendering if both values are empty and hideIfEmpty is true
  if (hideIfEmpty && fy2024Value == null && fy2023Value == null) {
    return null;
  }

  // Calculate indent class based on indentation level
  const indentClass = `pl-${4 + indentLevel * 4}`;
  
  // Format number values as currency
  const formattedFy2024 = typeof fy2024Value === 'number' 
    ? formatCurrency(fy2024Value) 
    : fy2024Value || '';
    
  const formattedFy2023 = typeof fy2023Value === 'number' 
    ? formatCurrency(fy2023Value) 
    : fy2023Value || '';
  
  // Check if this term has a tooltip explanation
  const hasTooltip = financialTerms[label] !== undefined;
  
  // Handle edit mode start
  const startEditing = (field: "fy2024Value" | "fy2023Value" | "note") => {
    if (!editable) return;
    setIsEditing(field);
    
    // Set initial edit value based on field
    if (field === "note") {
      setEditValue(note || "");
    } else if (field === "fy2024Value") {
      setEditValue(typeof fy2024Value === 'number' ? fy2024Value.toString() : fy2024Value || "");
    } else if (field === "fy2023Value") {
      setEditValue(typeof fy2023Value === 'number' ? fy2023Value.toString() : fy2023Value || "");
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
      <TableCell className="p-2 text-center">
        {isEditing === "note" ? (
          <div className="flex">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="w-full border rounded p-1 text-center text-sm"
              autoFocus
            />
          </div>
        ) : (
          <div 
            className={cn(editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded")}
            onClick={() => startEditing("note")}
          >
            {note}
          </div>
        )}
      </TableCell>
      <TableCell className="p-2 text-right">
        {isEditing === "fy2024Value" ? (
          <div className="flex">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="w-full border rounded p-1 text-right text-sm"
              autoFocus
            />
          </div>
        ) : (
          <div 
            className={cn(editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded")}
            onClick={() => startEditing("fy2024Value")}
          >
            {formattedFy2024}
          </div>
        )}
      </TableCell>
      <TableCell className="p-2 text-right">
        {isEditing === "fy2023Value" ? (
          <div className="flex">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              className="w-full border rounded p-1 text-right text-sm"
              autoFocus
            />
          </div>
        ) : (
          <div 
            className={cn(editable && "cursor-pointer hover:bg-muted/50 px-2 py-1 rounded")}
            onClick={() => startEditing("fy2023Value")}
          >
            {formattedFy2023}
          </div>
        )}
      </TableCell>
    </TableRow>
  );
} 