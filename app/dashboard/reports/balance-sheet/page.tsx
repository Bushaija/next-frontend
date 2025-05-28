"use client";

import { useEffect, useState } from "react";
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
import { useReportStore } from "@/store/reportStore";
import React from "react";
import { ExportButton } from "@/components/financial/export-button";
import { EditModeButton } from "@/components/financial/edit-mode-button";

export default function BalanceSheetPage() {
  // Group all useState hooks together at the top
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  
  // Then use custom hooks - combine both useReportStore calls
  const { title, sections, loading, error } = useReportData('balance-sheet');
  const { 
    calculateNetAssets, 
    setTotalAssets, 
    setTotalLiabilities,
    summary: { totalAssets, totalLiabilities, netAssets }
  } = useReportStore();
  
  // Calculate and update store values when data changes
  useEffect(() => {
    if (!loading && sections.length > 0) {
      // Find total assets and liabilities
      const assetsSection = sections.find(s => s.key === 'assets');
      const liabilitiesSection = sections.find(s => s.key === 'liabilities');
      
      // Calculate totals
      const totalAssets = assetsSection?.subsections?.reduce((sum, subsection) => {
        const total = subsection.rows.find(row => row.isTotal);
        return sum + (total?.fy2024Value as number || 0);
      }, 0) || 0;
      
      const totalLiabilities = liabilitiesSection?.subsections?.reduce((sum, subsection) => {
        const total = subsection.rows.find(row => row.isTotal);
        return sum + (total?.fy2024Value as number || 0);
      }, 0) || 0;
      
      // Update store
      setTotalAssets(totalAssets);
      setTotalLiabilities(totalLiabilities);
      calculateNetAssets();
    }
  }, [loading, sections, calculateNetAssets, setTotalAssets, setTotalLiabilities]);
  
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
        <FinancialTableSkeleton rowCount={12} />
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
  
  // Handle value changes from editable rows
  const handleValueChange = (rowId: string, data: { field: string, value: string | number }) => {
    setEditedValues(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        [data.field]: data.value
      }
    }));
    
    // In a real app, you would update the data source or API
    console.log(`Updated ${rowId} ${data.field} to:`, data.value);
  };
  
  // Get value for a field, checking edited values first
  const getValue = (rowId: string, field: string, original: any) => {
    return editedValues[rowId]?.[field] !== undefined 
      ? editedValues[rowId][field] 
      : original;
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
            caption="Statement of Financial Assets and Liabilities"
            ariaLabel="Financial assets and liabilities statement table"
          >
            <FinancialTableHeader 
              columns={[
                { key: 'description', label: 'Description' },
                { key: 'note', label: 'Note' },
                { key: 'fy2024', label: 'FY 2024/2025 (Period ended 31/12/2024) Frw' },
                { key: 'fy2023', label: 'FY 2023/2024 (Period ended June 2024) Frw' },
              ]} 
            />
            
            {/* Dynamically render sections */}
            {sections.map((section) => (
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
                          />
                        );
                      })}
                    </FinancialSubsectionGroup>
                    <SeparatorRow />
                  </React.Fragment>
                ))}
                
                {section.key === 'assets' && (
                  <FinancialSummaryRow 
                    label="TOTAL ASSETS (A)" 
                    fy2024Value={totalAssets}
                  />
                )}
                
                {section.key === 'liabilities' && (
                  <FinancialSummaryRow 
                    label="TOTAL LIABILITIES (B)" 
                    fy2024Value={totalLiabilities}
                  />
                )}
                <SeparatorRow />
              </FinancialSectionGroup>
            ))}
            
            {/* Net Assets Section */}
            <FooterSection>
              <FinancialSummaryRow 
                label="NET ASSETS (C)" 
                formulaHint="= (A - B)"
                fy2024Value={netAssets}
              />
              
              {/* Additional static rows for net assets breakdown */}
              <FinancialRow 
                label="Accumulated surplus/(deficits)" 
                indentLevel={1}
                fy2024Value={netAssets} // Using the same value for demo
                editable={isEditMode}
                onValueChange={(data) => handleValueChange("net-assets-surplus", data)}
              />
              <FinancialRow 
                label="Prior year adjustments" 
                indentLevel={1}
                editable={isEditMode}
                onValueChange={(data) => handleValueChange("net-assets-adjustments", data)}
              />
              <FinancialRow 
                label="Surplus/deficit of the period" 
                indentLevel={1}
                editable={isEditMode}
                onValueChange={(data) => handleValueChange("net-assets-period", data)}
              />
            </FooterSection>
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