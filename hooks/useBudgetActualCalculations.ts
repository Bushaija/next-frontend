import { useEffect } from 'react';
import { useReportStore } from '@/store/reportStore';
import { FinancialReportSection } from './useReportData';

/**
 * Custom hook to handle budget vs actual calculations and update the store
 * Processes budget data and calculates performance metrics
 */
export function useBudgetActualCalculations(
  sections: FinancialReportSection[],
  loading: boolean
) {
  // Get values from the store
  const { 
    summary: { 
      totalAssets: totalReceipts,
      totalLiabilities: totalPayments,
      netAssets: netBalance
    },
    setTotalAssets,
    setTotalLiabilities,
    calculateNetAssets
  } = useReportStore();
  
  useEffect(() => {
    if (!loading && sections.length > 0) {
      let calculatedTotalReceipts = 0;
      let calculatedTotalPayments = 0;
      
      // Process each section
      sections.forEach(section => {
        if (section.key === 'receipts') {
          // Calculate total receipts
          section.rows.forEach(row => {
            if (row.isTotal) {
              calculatedTotalReceipts += Number(row.actualBudget) || 0;
            }
          });
          
          // Also check subsections if any
          section.subsections?.forEach(subsection => {
            subsection.rows.forEach(row => {
              if (row.isTotal) {
                calculatedTotalReceipts += Number(row.actualBudget) || 0;
              }
            });
          });
        } 
        else if (section.key === 'expenditures') {
          // Calculate total payments
          section.rows.forEach(row => {
            if (row.isTotal) {
              calculatedTotalPayments += Number(row.actualBudget) || 0;
            }
          });
          
          // Also check subsections if any
          section.subsections?.forEach(subsection => {
            subsection.rows.forEach(row => {
              if (row.isTotal) {
                calculatedTotalPayments += Number(row.actualBudget) || 0;
              }
            });
          });
        }
      });
      
      // Update the store with calculated values
      setTotalAssets(calculatedTotalReceipts);
      setTotalLiabilities(calculatedTotalPayments);
      
      // This will trigger the calculation of netAssets (receipts - payments)
      calculateNetAssets();
    }
  }, [loading, sections, setTotalAssets, setTotalLiabilities, calculateNetAssets]);
  
  return {
    totalReceipts,
    totalPayments,
    netBalance
  };
} 