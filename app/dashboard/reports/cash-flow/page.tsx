"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FinancialRow,
  FinancialSectionGroup,
  FinancialSubsectionGroup,
  FinancialSummaryRow,
  FinancialTable,
  FinancialTableHeader,
  FinancialTableSkeleton,
  FooterSection,
  ReportTitle,
  SeparatorRow
} from "@/components/financial";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useReportData } from "@/hooks/useReportData";
import { useCashFlowCalculations } from "@/hooks/useCashFlowCalculations";
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/debounce";
import React from "react";
import { ExportButton } from "@/components/financial/export-button";
import { EditModeButton } from "@/components/financial/edit-mode-button";

// Type for edited values
interface EditedValues {
  [rowId: string]: {
    [field: string]: string | number;
  };
}

export default function CashFlowPage() {
  // Group all useState hooks together at the top
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<EditedValues>({});
  
  // Use our custom hooks
  const { title, sections, loading, error } = useReportData('cash-flow');
  
  // Use our extracted calculation hook
  const summary = useCashFlowCalculations(sections, loading);
  
  // Destructure the summary for convenience
  const {
    totalAssets: cashFromOperations,
    totalLiabilities: cashFromInvesting,
    totalCurrentAssets: cashFromFinancing,
    netAssets: netChange,
    totalNonCurrentAssets: openingBalance,
    totalCurrentLiabilities: closingBalance,
  } = summary;
  
  // Debounced value change handler to reduce excessive updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedHandleValueChange = useCallback(
    debounce((rowId: string, data: { field: string, value: string | number }) => {
      setEditedValues(prev => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          [data.field]: data.value
        }
      }));
      
      // In a real app, you would update the data source or API
      console.log(`Updated ${rowId} ${data.field} to:`, data.value);
    }, 300),
    []
  );
  
  // Handle value changes from editable rows
  const handleValueChange = (rowId: string, data: { field: string, value: string | number }) => {
    // Update immediately for UI responsiveness
    setEditedValues(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [data.field]: data.value
      }
    }));
    
    // Debounce the actual processing
    debouncedHandleValueChange(rowId, data);
  };
  
  // Get value for a field, checking edited values first
  const getValue = (rowId: string, field: string, original: any) => {
    return editedValues[rowId]?.[field] !== undefined 
      ? editedValues[rowId][field] 
      : original;
  };
  
  // Dynamic calculation of totals based on edited values
  const calculateDynamicTotals = useCallback(() => {
    // Only recalculate if we're in edit mode
    if (!isEditMode || loading) return;
    
    // We'll implement dynamic recalculation for:
    // 1. Opening balance edits should affect closing balance
    // 2. Any changes to values in sections should affect the section totals
    
    // For each edited value, check if it's a value that affects a total
    const beginningBalanceRowId = 'beginning-end-row-1'; // Row for cash at beginning of period
    const newOpeningBalance = (editedValues[beginningBalanceRowId]?.['fy2024Value'] as number) ?? openingBalance;
    
    // If opening balance has been edited, update closing balance calculation
    if (editedValues[beginningBalanceRowId]?.['fy2024Value'] !== undefined) {
      console.log('Recalculating closing balance based on edited opening balance');
      
      // Calculate the new closing balance (opening balance + net change)
      const newClosingBalance = newOpeningBalance + netChange;
      
      // In a full implementation, we'd update this in the store
      // For demo purposes, we'll just log it
      console.log(`New closing balance: ${newClosingBalance}`);
    }
    
    // Look for edits to any rows in the operating/investing/financing sections
    // In a full implementation, we'd recalculate all the section totals here
    for (const rowId in editedValues) {
      if (rowId.startsWith('operating-') || 
          rowId.startsWith('investing-') || 
          rowId.startsWith('financing-')) {
        console.log(`Edited value in ${rowId} would trigger recalculation of section totals`);
      }
    }
  }, [isEditMode, loading, editedValues, openingBalance, netChange]);
  
  // Recalculate when edited values change
  useEffect(() => {
    calculateDynamicTotals();
  }, [editedValues, calculateDynamicTotals]);
  
  // Show loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse mb-6">
          <div className="h-6 bg-muted rounded mb-2 w-1/3 mx-auto"></div>
          <div className="h-5 bg-muted rounded mb-2 w-2/3 mx-auto"></div>
          <div className="h-5 bg-muted rounded mb-2 w-1/2 mx-auto"></div>
          <div className="h-5 bg-muted rounded w-3/4 mx-auto"></div>
        </div>
        <FinancialTableSkeleton rowCount={15} />
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Report</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }
  
  // Prepare all sections, subsections and footer content
  const renderSections = () => {
    return (
      <>
        {/* Main sections (operating, investing, financing) */}
        {sections.map((section) => {
          if (section.key === 'beginning-end') return null; // Skip, we'll handle this separately
          
          return (
            <FinancialSectionGroup key={section.key} title={section.title}>
              {section.subsections?.map((subsection) => (
                <React.Fragment key={subsection.key}>
                  <FinancialSubsectionGroup title={subsection.title} className="pl-4">
                    {subsection.rows.map((row, index) => {
                      const rowId = `${subsection.key}-row-${index}`;
                      return (
                        <FinancialRow 
                          key={rowId}
                          label={row.label}
                          note={getValue(rowId, "note", row.note)}
                          fy2024Value={getValue(rowId, "fy2024Value", row.fy2024Value)}
                          fy2023Value={getValue(rowId, "fy2023Value", row.fy2023Value)}
                          isTotal={row.isTotal}
                          indentLevel={row.indentLevel}
                          editable={isEditMode}
                          onValueChange={(data) => handleValueChange(rowId, data)}
                          // Enhanced styling for total rows
                          className={row.isTotal ? "bg-muted/30 font-semibold" : ""}
                        />
                      );
                    })}
                  </FinancialSubsectionGroup>
                  <SeparatorRow />
                </React.Fragment>
              ))}
              
              {section.key === 'operating-activities' && (
                <FinancialSummaryRow 
                  label="NET CASH FROM OPERATING ACTIVITIES (A)" 
                  fy2024Value={cashFromOperations}
                  isHighlighted={true}
                />
              )}
              
              {section.key === 'investing-activities' && (
                <FinancialSummaryRow 
                  label="NET CASH FROM INVESTING ACTIVITIES (B)" 
                  fy2024Value={cashFromInvesting}
                  isHighlighted={true}
                />
              )}
              
              {section.key === 'financing-activities' && (
                <FinancialSummaryRow 
                  label="NET CASH FROM FINANCING ACTIVITIES (C)" 
                  fy2024Value={cashFromFinancing}
                  isHighlighted={true}
                />
              )}
              
              <SeparatorRow />
            </FinancialSectionGroup>
          );
        })}
        
        {/* Net Change in Cash (Footer Section) */}
        <FooterSection>
          {/* Get the beginning-end section for this part */}
          {sections.find(s => s.key === 'beginning-end')?.rows.map((row, index) => {
            const rowId = `beginning-end-row-${index}`;
            
            if (row.label.includes("Net increase/(decrease)")) {
              return (
                <FinancialSummaryRow 
                  key={rowId}
                  label={row.label}
                  formulaHint="= (A + B + C)"
                  fy2024Value={getValue(rowId, "fy2024Value", row.fy2024Value) ?? netChange}
                  fy2023Value={getValue(rowId, "fy2023Value", row.fy2023Value)}
                  isHighlighted={true}
                />
              );
            } else if (row.label === "Cash and cash equivalents at end of period") {
              return (
                <FinancialSummaryRow 
                  key={rowId}
                  label={row.label}
                  formulaHint="= Opening Balance + Net Change"
                  fy2024Value={getValue(rowId, "fy2024Value", row.fy2024Value) ?? closingBalance}
                  fy2023Value={getValue(rowId, "fy2023Value", row.fy2023Value)}
                  isFinal={true}
                />
              );
            } else {
              return (
                <FinancialRow 
                  key={rowId}
                  label={row.label}
                  note={getValue(rowId, "note", row.note)}
                  fy2024Value={getValue(rowId, "fy2024Value", row.fy2024Value)}
                  fy2023Value={getValue(rowId, "fy2023Value", row.fy2023Value)}
                  isTotal={row.isTotal}
                  indentLevel={row.indentLevel}
                  editable={isEditMode}
                  onValueChange={(data) => handleValueChange(rowId, data)}
                  // Add better styling for special rows like prior year adjustments
                  className={row.isTotal ? "bg-muted/30 font-semibold" : ""}
                />
              );
            }
          })}
        </FooterSection>
      </>
    );
  };
  
  return (
    <TooltipProvider>
      <div className="container py-4 ml-12">
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
            caption="Statement of Cash Flows"
            ariaLabel="Cash flow statement table"
          >
            <FinancialTableHeader 
              columns={[
                { key: 'description', label: 'Description' },
                { key: 'note', label: 'Note' },
                { key: 'fy2024', label: 'FY 2024/2025 (Period ended 31/12/2024) Frw' },
                { key: 'fy2023', label: 'FY 2023/2024 (Period ended June 2024) Frw' },
              ]} 
            />
            
            {renderSections()}
          </FinancialTable>
        </div>
        
        {/* Edit mode indicator */}
        {isEditMode && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md print-hide">
            <h3 className="font-medium text-yellow-800">Edit Mode Active</h3>
            <p className="text-sm text-yellow-700">
              Click on any value or note to edit. Changes in this demo are stored temporarily and will be lost on page refresh.
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}