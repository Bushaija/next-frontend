import { useEffect } from 'react';
import { useReportStore } from '@/store/reportStore';
import { FinancialReportSection } from './useReportData';

/**
 * Custom hook to handle cash flow calculations and update the store
 * Extracts the calculation logic from the Cash Flow page component
 */
export function useCashFlowCalculations(
  sections: FinancialReportSection[],
  loading: boolean
) {
  const { 
    summary,
    setNetAssets: setCashFlowNetChange,
    setTotalAssets: setCashFromOperations,
    setTotalLiabilities: setCashFromInvesting,
    setTotalCurrentAssets: setCashFromFinancing,
    setTotalNonCurrentAssets: setOpeningBalance,
    setTotalCurrentLiabilities: setClosingBalance,
  } = useReportStore();
  
  useEffect(() => {
    if (!loading && sections.length > 0) {
      // Find the operating, investing, and financing sections
      const operatingSection = sections.find(s => s.key === 'operating-activities');
      const investingSection = sections.find(s => s.key === 'investing-activities');
      const financingSection = sections.find(s => s.key === 'financing-activities');
      
      // Calculate the net operating cash flow (revenues - expenses + adjustments)
      let operatingCash = 0;
      const revenuesSubsection = operatingSection?.subsections?.find(s => s.key === 'revenues');
      const expensesSubsection = operatingSection?.subsections?.find(s => s.key === 'expenses');
      const adjustmentsSubsection = operatingSection?.subsections?.find(s => s.key === 'adjustments');
      
      const revenuesTotal = revenuesSubsection?.rows.find(row => row.isTotal)?.fy2024Value as number || 0;
      const expensesTotal = expensesSubsection?.rows.find(row => row.isTotal)?.fy2024Value as number || 0;
      const adjustmentsTotal = adjustmentsSubsection?.rows.find(row => row.isTotal)?.fy2024Value as number || 0;
      
      operatingCash = revenuesTotal + expensesTotal + adjustmentsTotal;
      
      // Calculate investing cash flow from the investing activities total
      const investingActivitiesTotal = investingSection?.subsections?.[0].rows.find(
        row => row.isTotal
      )?.fy2024Value as number || 0;
      
      // Calculate financing cash flow from the financing activities total
      const financingActivitiesTotal = financingSection?.subsections?.[0].rows.find(
        row => row.isTotal
      )?.fy2024Value as number || 0;
      
      // Find the beginning balance from the last section
      const beginningEndSection = sections.find(s => s.key === 'beginning-end');
      const openingBalanceRow = beginningEndSection?.rows.find(
        row => row.label === "Cash and cash equivalents at beginning of period"
      );
      
      const openingBalanceValue = openingBalanceRow?.fy2024Value as number || 0;
      
      // Find the net change row which should already be in the data
      const netChangeRow = beginningEndSection?.rows.find(
        row => row.label.includes("Net increase/(decrease)")
      );
      const calculatedNetChange = netChangeRow?.fy2024Value as number || 
                                (operatingCash + investingActivitiesTotal + financingActivitiesTotal);
      
      // Update the store with all values
      setCashFromOperations(operatingCash);
      setCashFromInvesting(investingActivitiesTotal);
      setCashFromFinancing(financingActivitiesTotal);
      setOpeningBalance(openingBalanceValue);
      setCashFlowNetChange(calculatedNetChange);
      
      // Calculate closing balance (may already be in the data)
      const endBalanceRow = beginningEndSection?.rows.find(
        row => row.label === "Cash and cash equivalents at end of period"
      );
      const closingBalanceValue = endBalanceRow?.fy2024Value as number || 
                                (openingBalanceValue + calculatedNetChange);
      
      setClosingBalance(closingBalanceValue);
    }
  }, [
    loading, 
    sections, 
    setCashFromOperations, 
    setCashFromInvesting, 
    setCashFromFinancing,
    setOpeningBalance, 
    setClosingBalance, 
    setCashFlowNetChange
  ]);
  
  return summary;
} 