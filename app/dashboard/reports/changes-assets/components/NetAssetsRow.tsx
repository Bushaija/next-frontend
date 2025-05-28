import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { EditableCell } from "./EditableCell";

export interface NetAssetsRowProps {
  label: string;
  note?: string;
  surplus: string | number | undefined;
  adjustments: string | number | undefined;
  total: string | number | undefined;
  isTotal?: boolean;
  indentLevel?: number;
  editable?: boolean;
  onValueChange?: (data: { field: string; value: string | number }) => void;
  error?: { [field: string]: string };
  className?: string;
  isHighlighted?: boolean;
}

export const NetAssetsRow = memo(function NetAssetsRow({
  label,
  note,
  surplus,
  adjustments,
  total,
  isTotal = false,
  indentLevel = 0,
  editable = false,
  onValueChange = () => {},
  error = {},
  className,
  isHighlighted = false
}: NetAssetsRowProps) {
  // Calculate padding based on indent level
  const indentPadding = `${indentLevel * 1.5}rem`;
  
  return (
    <tr className={cn(
      isTotal ? "bg-muted/30 font-semibold" : "",
      isHighlighted ? "bg-muted/50 font-semibold" : "",
      className
    )}>
      <td 
        className={cn(
          "py-2 px-4 border-b",
          isTotal ? "font-semibold" : ""
        )}
        style={{ paddingLeft: indentPadding }}
      >
        <div className="flex items-start">
          <span>{label}</span>
          {note && (
            <span className="ml-1 text-xs text-muted-foreground align-super">
              {note}
            </span>
          )}
        </div>
      </td>
      
      <td className="py-2 px-4 border-b">
        <EditableCell
          value={surplus}
          field="surplus"
          isEditable={editable}
          onValueChange={onValueChange}
          error={error.surplus}
          isNumeric={true}
          isHighlighted={isTotal || isHighlighted}
        />
      </td>
      
      <td className="py-2 px-4 border-b">
        <EditableCell
          value={adjustments}
          field="adjustments"
          isEditable={editable}
          onValueChange={onValueChange}
          error={error.adjustments}
          isNumeric={true}
          isHighlighted={isTotal || isHighlighted}
        />
      </td>
      
      <td className="py-2 px-4 border-b">
        <EditableCell
          value={total}
          field="total"
          isEditable={false} // Total is always calculated, not editable
          onValueChange={onValueChange}
          isNumeric={true}
          isHighlighted={isTotal || isHighlighted}
        />
      </td>
    </tr>
  );
}); 