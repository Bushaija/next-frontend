"use client"

import { useCallback, useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { NumericInputCellProps } from "./types"

export function NumericInputCell({ rowId, field, value, readOnly, label }: NumericInputCellProps) {
  const { setValue } = useFormContext();
  const fieldName = `rows.${rowId}.${field}`;
  const [localValue, setLocalValue] = useState(value?.toString() || '');
  
  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  // Handle input changes with local state
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
      setLocalValue(val);
    }
  }, []);

  // Handle blur to update form state
  const handleBlur = useCallback(() => {
    if (localValue === '') {
      setValue(fieldName, '', {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    } else {
      const numValue = parseFloat(localValue);
      if (!isNaN(numValue)) {
        setValue(fieldName, numValue.toString(), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        });
      }
    }
  }, [fieldName, setValue, localValue]);
  
  return (
    <Input
      type="text"
      inputMode="decimal"
      pattern="-?[0-9]*\.?[0-9]*"
      className="h-8 w-24 text-right"
      disabled={readOnly}
      aria-label={label}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
} 