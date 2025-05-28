"use client";

import React, { useMemo } from "react";
import {
  FinancialSectionGroup,
  FinancialSubsectionGroup,
  FinancialTable,
  FinancialTableHeader,
  FinancialTableSkeleton,
  FinancialRow,
  FinancialSummaryRow,
  ReportTitle,
  SeparatorRow
} from "@/components/financial";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useReportData } from "@/hooks/useReportData";
import { useRevenueSurplusCalculations } from "@/hooks/useRevenueSurplusCalculations";
import { FinancialReportSection } from "@/hooks/useReportData";

// Define columns for the revenue expenditure table
const FALLBACK_POSITION = 999; // Fallback position for sections not in the expected order
const EXPECTED_SECTION_ORDER = ['revenues', 'expenses']; // Expected section order

export default function RevenueExpenditurePage() {
  // Get report data from the hook
  const { title, sections, loading, error } = useReportData('revenue-expenditure');
  
  // Use the custom hook for calculations
  const { surplus, surplusPreviousYear } = useRevenueSurplusCalculations(sections, loading);
  
  // Memoize revenue columns for consistency
  const revenueColumns = useMemo(() => [
    { key: 'description', label: 'Description' },
    { key: 'notes', label: 'Notes' },
    { key: 'fy2024', label: 'FY 2024/2025 (Frw) (Period ended 31/12/2024)' },
    { key: 'fy2023', label: 'FY 2023/2024 (Frw) (Period ended 30/06/2024)' },
  ], []);
  
  // Handle print action
  const handlePrint = () => window.print();
  
  // Handle refetch action
  const handleRefetch = () => {
    // In a real implementation, we would integrate with a data fetching library
    // such as SWR or React Query that provides a refetch function.
    // For now, we'll reload the page.
    window.location.reload();
  };
  
  // Handle full page reload
  const handleReload = () => window.location.reload();
  
  // Helper function to check if a section should display summary
  const isValidSummarySection = (section: FinancialReportSection) => 
    section.isSummarySection && 
    surplus !== undefined && 
    surplusPreviousYear !== undefined;
  
  // Memoize sorted sections for performance
  const sortedSections = useMemo(() => {
    if (!sections?.length) return [];
    
    return [...sections]
      .sort((a, b) => {
        // Provide fallbacks if keys aren't in expectedSectionOrder
        const indexA = EXPECTED_SECTION_ORDER.indexOf(a.key);
        const indexB = EXPECTED_SECTION_ORDER.indexOf(b.key);
        const orderA = indexA === -1 ? FALLBACK_POSITION : indexA;
        const orderB = indexB === -1 ? FALLBACK_POSITION : indexB;
        
        // First sort by expected order, then alphabetically for stability
        return orderA - orderB || a.key.localeCompare(b.key);
      })
      // Filter out empty sections
      .filter(section => 
        (section.subsections?.some(s => s.rows?.length > 0) || 
         section.rows?.length > 0 || 
         section.isSummarySection)
      );
  }, [sections]);
  
  // If loading, show skeleton
  if (loading) {
    return (
      <div className="container mx-auto py-8 print:py-0" role="status" aria-live="polite">
        <FinancialTableSkeleton />
      </div>
    );
  }
  
  // If error, show error message with retry option
  if (error) {
    return (
      <div className="container mx-auto py-8 print:hidden" role="alert" aria-live="assertive">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <div className="flex space-x-2">
            <button
              onClick={handleRefetch}
              className="px-4 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm"
            >
              Retry (Soft Refresh)
            </button>
            <button
              onClick={handleReload}
              className="px-4 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="container py-4 print:py-4 w-full ml-12">
        <div className="flex justify-end space-x-2 mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-muted hover:bg-muted/80 rounded transition-colors"
            aria-label="Print or save as PDF"
          >
            Print / Save as PDF
          </button>
        </div>
        
        <ReportTitle 
          governmentBody={title?.governmentBody || "Government of Rwanda"}
          program={title?.program || "Budget Support"}
          reportType={title?.reportType || "Financial Statement"}
          statement={title?.statement || "Statement of Revenue and Expenditure"}
        />
        
        <div className="mt-4 financial-table print-include" id="printableArea">
          <FinancialTable 
            className="print-include w-full" 
            caption="Statement of Revenue and Expenditure"
            ariaLabel="Revenue and Expenditure table"
          >
            <FinancialTableHeader columns={revenueColumns} />
            
            {/* Dynamically render sections */}
            {sortedSections.map((section) => (
              <FinancialSectionGroup 
                key={section.key} 
                title={section.title}
                className={section.isSummarySection ? "summary-section" : ""}
              >
                {/* Render subsections using flatMap for cleaner rendering */}
                {section.subsections?.flatMap((subsection) =>
                  subsection.rows?.length > 0 ? [
                    <FinancialSubsectionGroup 
                      key={subsection.key} 
                      title={subsection.title}
                      className="pl-4"
                    >
                      {subsection.rows.map((row, index) => (
                        <FinancialRow
                          key={row.id ?? `${subsection.key}-${index}`}
                          label={row.label}
                          note={row.note}
                          fy2024Value={row.fy2024Value}
                          fy2023Value={row.fy2023Value}
                          isTotal={row.isTotal}
                          indentLevel={row.indentLevel}
                          className={index === 0 ? "first-row" : ""}
                        />
                      ))}
                    </FinancialSubsectionGroup>,
                    <SeparatorRow key={`${subsection.key}-sep`} />
                  ] : []
                )}
                
                {/* Show non-subsectioned rows */}
                {section.rows?.length > 0 && (
                  <React.Fragment key={`${section.key}-direct-rows`}>
                    {section.rows.map((row, index) => (
                      <FinancialRow
                        key={row.id ?? `${section.key}-${index}`}
                        label={row.label}
                        note={row.note}
                        fy2024Value={row.fy2024Value}
                        fy2023Value={row.fy2023Value}
                        isTotal={row.isTotal}
                        indentLevel={row.indentLevel}
                        className={row.isTotal ? "total-row" : ""}
                      />
                    ))}
                    <SeparatorRow />
                  </React.Fragment>
                )}
                
                {/* Use helper function for cleaner conditional summary display */}
                {isValidSummarySection(section) && (
                  <FinancialSummaryRow 
                    label={section.summaryLabel || "SURPLUS / (DEFICIT) FOR THE PERIOD"} 
                    formulaHint={section.formulaHint || "Total Revenue - Total Expenses"}
                    fy2024Value={surplus}
                    fy2023Value={surplusPreviousYear}
                    isHighlighted={true}
                    className="summary-row"
                  />
                )}
              </FinancialSectionGroup>
            ))}
          </FinancialTable>
        </div>
      </div>
    </TooltipProvider>
  );
}
