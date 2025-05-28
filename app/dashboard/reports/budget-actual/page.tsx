"use client";

import { useCallback, useState, useTransition } from "react";
import {
  FinancialSectionGroup,
  FinancialSubsectionGroup,
  FinancialTable,
  FinancialTableHeader,
  FinancialTableSkeleton,
  FinancialSummaryRow,
  ReportTitle,
  SeparatorRow
} from "@/components/financial";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useReportData } from "@/hooks/useReportData";
import { useBudgetActualCalculations } from "@/hooks/useBudgetActualCalculations";
import { debounce } from "@/lib/debounce";
import React from "react";
import { BudgetActualRow } from "./_components/BudgetActualRow";
import { BudgetActualActions } from "./_components/BudgetActualActions";
import { validateBudgetValue } from "./_components/BudgetActualValidator";
import { ConfirmDialog } from "./_components/ConfirmDialog";
import { ExportButton } from "@/components/financial/export-button";
import { EditModeButton } from "@/components/financial/edit-mode-button";

// Type for edited values
interface EditedValues {
  [rowId: string]: {
    [field: string]: string | number;
  };
}

// Interface for form validation errors
interface ValidationErrors {
  [rowId: string]: {
    [field: string]: string;
  };
}

export default function BudgetActualPage() {
  // Group all useState hooks together at the top
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<EditedValues>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [, startTransition] = useTransition();
  
  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Get report data from the hook
  const { title, sections, loading, error } = useReportData('budget-actual');
  
  // Use the custom hook for calculations
  const { netBalance } = useBudgetActualCalculations(sections, loading);
  
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
    [] // debounce is a stable function import, not a reactive dependency
  );
  
  // Handler for value changes in editable mode
  const handleValueChange = useCallback((rowId: string, data: { field: string; value: string | number }) => {
    // Validate the input using Zod-based validation
    const validationError = validateBudgetValue(data.field, data.value);
    
    // Update errors state - use startTransition for better UX during updates
    startTransition(() => {
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
    });
  }, [debouncedValueChange]);
  
  // Function to get value (edited or original) with proper type handling
  const getValue = useCallback((rowId: string, field: string, originalValue: string | number | undefined) => {
    const value = editedValues[rowId]?.[field] !== undefined 
      ? editedValues[rowId][field] 
      : originalValue;
    
    // Ensure note is always a string or undefined
    if (field === 'note') {
      return value === undefined ? undefined : String(value);
    }
    
    return value;
  }, [editedValues]);
  
  // Generate a better row ID based on section, subsection, and label
  const generateRowId = useCallback((sectionKey: string, subsectionKey: string | undefined, label: string, index: number) => {
    const cleanLabel = label.replace(/[\s/()]+/g, "_").toLowerCase();
    return subsectionKey 
      ? `${sectionKey}-${subsectionKey}-${cleanLabel}-${index}`
      : `${sectionKey}-${cleanLabel}-${index}`;
  }, []);
  
  // Open save dialog
  const handleSaveClick = useCallback(() => {
    if (Object.keys(editedValues).length === 0) {
      setIsEditMode(false);
      return; // Nothing to save
    }
    
    setSaveDialogOpen(true);
  }, [editedValues]);
  
  // Handle saving changes to backend
  const handleSaveChanges = useCallback(async () => {
    setIsSaving(true);
    setSaveDialogOpen(false);
    
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
  }, [editedValues]);
  
  // Open cancel dialog
  const handleCancelClick = useCallback(() => {
    if (Object.keys(editedValues).length > 0) {
      setCancelDialogOpen(true);
    } else {
      setIsEditMode(false);
    }
  }, [editedValues]);
  
  // Handle cancel button click
  const handleCancel = useCallback(() => {
    setCancelDialogOpen(false);
    setEditedValues({});
    setErrors({});
    setIsEditMode(false);
  }, []);
  
  // If loading, show skeleton
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <FinancialTableSkeleton />
      </div>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="container py-4 ml-12 ">
      <div className="print-include flex justify-between items-end">
          <ReportTitle
            governmentBody={title.governmentBody}
            program={title.program}
            reportType={title.reportType}
            statement={title.statement}
          />

          {/* Action buttons */}
          <div className="flex items-end gap-4">
            <EditModeButton isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />
            <ExportButton />
          </div>
        </div>
        
        <div className="mt-4 financial-table print-include">
          <FinancialTable 
            className="print-include" 
            caption="Statement of Comparison of Budget and Actual Amounts"
            ariaLabel="Budget vs Actual table"
          >
            <FinancialTableHeader 
              columns={[
                { key: 'description', label: 'Description' },
                { key: 'notes', label: 'Notes' },
                { key: 'originalBudget', label: 'Original Budget 2024 (Frw)' },
                { key: 'revisedBudget', label: 'Revised Budget 2024 (A) (Frw)' },
                { key: 'actualBudget', label: 'Actual Budget 2024 (B) (Frw)' },
                { key: 'variance', label: 'Variance (A - B) (Frw)' },
                { key: 'performance', label: 'Performance % (B/A * 100)' },
              ]} 
            />
            
            {/* Dynamically render sections */}
            {sections.map((section) => (
              <FinancialSectionGroup key={section.key} title={section.title}>
                {section.subsections?.map((subsection) => (
                  <React.Fragment key={subsection.key}>
                    <FinancialSubsectionGroup title={subsection.title} className="pl-4">
                      {subsection.rows.map((row, index) => {
                        const rowId = generateRowId(section.key, subsection.key, row.label, index);
                        return (
                          <BudgetActualRow
                            key={rowId}
                            row={row}
                            rowId={rowId}
                            isEditMode={isEditMode}
                            errors={errors[rowId]}
                            getValue={getValue}
                            onValueChange={handleValueChange}
                          />
                        );
                      })}
                    </FinancialSubsectionGroup>
                    <SeparatorRow />
                  </React.Fragment>
                ))}
                
                {/* Show non-subsectioned rows */}
                {section.rows.map((row, index) => {
                  const rowId = generateRowId(section.key, undefined, row.label, index);
                  return (
                    <BudgetActualRow
                      key={rowId}
                      row={row}
                      rowId={rowId}
                      isEditMode={isEditMode}
                      errors={errors[rowId]}
                      getValue={getValue}
                      onValueChange={handleValueChange}
                    />
                  );
                })}
                
                {section.isSummarySection && (
                  <FinancialSummaryRow 
                    label="BUDGET SURPLUS/(DEFICIT)" 
                    formulaHint="Total Receipts - Total Expenditures"
                    fy2024Value={netBalance}
                    isHighlighted={true}
                  />
                )}
                <SeparatorRow />
              </FinancialSectionGroup>
            ))}
          </FinancialTable>
        </div>
        
        {/* Confirmation Dialogs */}
        <ConfirmDialog
          isOpen={saveDialogOpen}
          onClose={() => setSaveDialogOpen(false)}
          onConfirm={handleSaveChanges}
          title="Save Changes"
          description="Are you sure you want to save these changes? This will update the budget data."
          confirmLabel="Save Changes"
          cancelLabel="Cancel"
          isLoading={isSaving}
        />
        
        <ConfirmDialog
          isOpen={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          onConfirm={handleCancel}
          title="Cancel Editing"
          description="You have unsaved changes. Are you sure you want to exit edit mode? All changes will be lost."
          confirmLabel="Discard Changes"
          cancelLabel="Continue Editing"
        />
      </div>
    </TooltipProvider>
  );
} 