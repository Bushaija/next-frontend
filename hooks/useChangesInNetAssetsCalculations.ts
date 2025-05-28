import { useEffect } from 'react';
import { useReportStore } from '@/store/reportStore';
import { FinancialReportSection } from './useReportData';

/**
 * Custom hook to handle changes in net assets calculations and update the store
 * Extracts the calculation logic from the Changes in Net Assets page component
 */
export function useChangesInNetAssetsCalculations(
  sections: FinancialReportSection[],
  loading: boolean
) {
  const { 
    summary: { netAssets },
    setNetAssets
  } = useReportStore();
  
  useEffect(() => {
    if (!loading && sections.length > 0) {
      // Find the final balance section
      const finalBalanceSection = sections.find(s => s.key === 'final-balance' || s.isSummarySection);
      
      if (finalBalanceSection?.rows.length > 0) {
        // Get the final balance row
        const finalRow = finalBalanceSection.rows.find(row => row.isTotal);
        
        if (finalRow) {
          // Use the total field if available, otherwise fall back to fy2024Value
          const netAssetsValue = finalRow.total ?? finalRow.fy2024Value;
          
          // Update the store with the net assets value
          setNetAssets(typeof netAssetsValue === 'number' ? netAssetsValue : 0);
        }
      }
    }
  }, [loading, sections, setNetAssets]);
  
  return netAssets;
} 