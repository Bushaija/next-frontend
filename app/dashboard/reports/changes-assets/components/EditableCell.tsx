import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface EditableCellProps {
  value: string | number | undefined;
  field: string;
  isEditable: boolean;
  onValueChange: (data: { field: string; value: string | number }) => void;
  error?: string;
  className?: string;
  isNumeric?: boolean;
  isHighlighted?: boolean;
}

export function EditableCell({
  value,
  field,
  isEditable,
  onValueChange,
  error,
  className,
  isNumeric = true,
  isHighlighted = false
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState<string>(
    value === undefined ? '' : String(value)
  );
  
  // Update local value when prop changes
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(String(value));
    } else {
      setLocalValue('');
    }
  }, [value]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };
  
  // Handle blur - commit the change
  const handleBlur = () => {
    // Convert to number if it's a numeric field and valid
    const processedValue = isNumeric && localValue && !isNaN(Number(localValue))
      ? Number(localValue)
      : localValue;
      
    onValueChange({ field, value: processedValue });
  };
  
  // Handle key press - commit on Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };
  
  // Format value for display in read-only mode
  const displayValue = () => {
    if (value === undefined || value === '') return '';
    
    if (isNumeric && typeof value === 'number') {
      return value.toLocaleString();
    }
    
    return value;
  };
  
  return (
    <div className={cn(
      "relative",
      error ? "text-red-500" : "",
      className
    )}>
      {isEditable ? (
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          className={cn(
            "w-full px-2 py-1 border rounded",
            "focus:outline-none focus:ring-2 focus:ring-primary/50",
            error ? "border-red-500" : "border-gray-300",
            isNumeric ? "text-right" : "text-left",
            isHighlighted ? "font-semibold" : ""
          )}
          aria-invalid={!!error}
          aria-errormessage={error ? `${field}-error` : undefined}
        />
      ) : (
        <div className={cn(
          "px-2 py-1",
          isNumeric ? "text-right" : "text-left",
          isHighlighted ? "font-semibold" : ""
        )}>
          {displayValue()}
        </div>
      )}
      
      {error && (
        <div 
          id={`${field}-error`}
          className="absolute text-xs text-red-500 mt-0.5"
        >
          {error}
        </div>
      )}
    </div>
  );
} 