import { useState, useCallback } from "react";
import { debounce } from "@/lib/debounce";

// Type for edited values
export interface EditedValues {
  [rowId: string]: {
    [field: string]: string | number;
  };
}

// Interface for form validation errors
export interface ValidationErrors {
  [rowId: string]: {
    [field: string]: string;
  };
}

export function useChangesInNetAssetsPage(sections: any[]) {
  // Group all useState hooks together at the top
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<EditedValues>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Calculate summary values from data instead of hardcoding
  const getSummaryValues = useCallback(() => {
    let totalSurplus = 0;
    let totalAdjustments = 0;
    
    sections.forEach(section => {
      // Process subsections
      section.subsections?.forEach(subsection => {
        subsection.rows.forEach(row => {
          if (row.isTotal) {
            totalSurplus += Number(row.surplus) || 0;
            totalAdjustments += Number(row.adjustments) || 0;
          }
        });
      });
      
      // Process direct rows
      section.rows.forEach(row => {
        if (row.isTotal) {
          totalSurplus += Number(row.surplus) || 0;
          totalAdjustments += Number(row.adjustments) || 0;
        }
      });
    });
    
    return { totalSurplus, totalAdjustments };
  }, [sections]);
  
  // Create a debounced handler for value changes
  const debouncedValueChange = useCallback(
    debounce((rowId: string, data: { field: string; value: string | number }) => {
      setEditedValues(prev => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          [data.field]: data.value
        }
      }));
      
      // In a real implementation, this would update the backend data
      console.log(`Updated ${rowId} ${data.field} to:`, data.value);
    }, 300),
    []
  );
  
  // Validate financial data
  const validateValue = (field: string, value: string | number): string | null => {
    if (field === 'note') return null; // Notes don't need validation
    
    if (typeof value === 'string') {
      // Check if it's a valid number
      if (value && isNaN(Number(value))) {
        return 'Must be a valid number';
      }
    }
    
    return null;
  };
  
  // Handler for value changes in editable mode
  const handleValueChange = useCallback((rowId: string, data: { field: string; value: string | number }) => {
    // Validate the input
    const validationError = validateValue(data.field, data.value);
    
    // Update errors state
    if (validationError) {
      setErrors(prev => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          [data.field]: validationError
        }
      }));
      return; // Don't update the value if validation fails
    } else {
      // Clear any existing error for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[rowId]) {
          delete newErrors[rowId][data.field];
          // Remove rowId entirely if there are no errors left
          if (Object.keys(newErrors[rowId]).length === 0) {
            delete newErrors[rowId];
          }
        }
        return newErrors;
      });
    }
    
    // Update immediately for UI responsiveness
    setEditedValues(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [data.field]: data.value
      }
    }));
    
    // Use debounced update for backend
    debouncedValueChange(rowId, data);
  }, [debouncedValueChange]);
  
  // Function to get value (edited or original) with proper type handling
  const getValue = (rowId: string, field: string, originalValue: string | number | undefined) => {
    const value = editedValues[rowId]?.[field] !== undefined 
      ? editedValues[rowId][field] 
      : originalValue;
    
    // Ensure note is always a string or undefined
    if (field === 'note') {
      return value === undefined ? undefined : String(value);
    }
    
    return value;
  };
  
  // Function to calculate total dynamically
  const calculateTotal = (surplus: string | number | undefined, adjustments: string | number | undefined) => {
    const s = typeof surplus === 'number' ? surplus : parseFloat(surplus || '0') || 0;
    const a = typeof adjustments === 'number' ? adjustments : parseFloat(adjustments || '0') || 0;
    return s + a;
  };
  
  // Generate a better row ID based on section, subsection, and label
  const generateRowId = (sectionKey: string, subsectionKey: string | undefined, label: string, index: number) => {
    const cleanLabel = label.replace(/[\s/()]+/g, "_").toLowerCase();
    return subsectionKey 
      ? `${sectionKey}-${subsectionKey}-${cleanLabel}-${index}`
      : `${sectionKey}-${cleanLabel}-${index}`;
  };
  
  // Handle saving changes to backend
  const handleSaveChanges = async () => {
    if (Object.keys(editedValues).length === 0) {
      setIsEditMode(false);
      return; // Nothing to save
    }
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Changes saved:', editedValues);
      
      // Reset edited values after successful save
      setEditedValues({});
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle canceling edits
  const handleCancelEdits = () => {
    // Discard changes and exit edit mode
    setEditedValues({});
    setErrors({});
    setIsEditMode(false);
  };

  return {
    isEditMode,
    setIsEditMode,
    editedValues,
    errors,
    isSaving,
    getSummaryValues,
    handleValueChange,
    getValue,
    calculateTotal,
    generateRowId,
    handleSaveChanges,
    handleCancelEdits
  };
} 