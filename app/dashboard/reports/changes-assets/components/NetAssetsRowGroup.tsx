import React, { memo } from "react";
import { NetAssetsRow } from "./NetAssetsRow";

interface RowData {
  label: string;
  note?: string;
  surplus?: string | number;
  adjustments?: string | number;
  total?: string | number;
  isTotal?: boolean;
  indentLevel?: number;
}

interface NetAssetsRowGroupProps {
  rows: RowData[];
  sectionKey: string;
  subsectionKey?: string;
  isEditMode: boolean;
  errors: { [rowId: string]: { [field: string]: string } };
  onValueChange: (rowId: string, data: { field: string; value: string | number }) => void;
  getValue: (rowId: string, field: string, originalValue: string | number | undefined) => string | number | undefined;
  calculateTotal: (surplus: string | number | undefined, adjustments: string | number | undefined) => number;
  generateRowId: (sectionKey: string, subsectionKey: string | undefined, label: string, index: number) => string;
}

export const NetAssetsRowGroup = memo(function NetAssetsRowGroup({
  rows,
  sectionKey,
  subsectionKey,
  isEditMode,
  errors,
  onValueChange,
  getValue,
  calculateTotal,
  generateRowId
}: NetAssetsRowGroupProps) {
  // Helper function to safely convert string value to note
  const getNoteValue = (rowId: string, originalNote?: string) => {
    const noteValue = getValue(rowId, "note", originalNote);
    return typeof noteValue === 'string' ? noteValue : undefined;
  };
  
  return (
    <>
      {rows.map((row, index) => {
        const rowId = generateRowId(sectionKey, subsectionKey, row.label, index);
        const note = getNoteValue(rowId, row.note);
        
        return (
          <NetAssetsRow 
            key={rowId}
            label={row.label}
            note={note}
            surplus={getValue(rowId, "surplus", row.surplus)}
            adjustments={getValue(rowId, "adjustments", row.adjustments)}
            total={getValue(rowId, "total", row.total ?? calculateTotal(row.surplus, row.adjustments))}
            isTotal={row.isTotal}
            indentLevel={row.indentLevel}
            editable={isEditMode}
            onValueChange={(data) => onValueChange(rowId, data)}
            error={errors[rowId]}
            className={row.isTotal ? "bg-muted/30 font-semibold" : ""}
          />
        );
      })}
    </>
  );
}); 