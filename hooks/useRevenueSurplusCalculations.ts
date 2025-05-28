import { useMemo } from 'react';
import { FinancialReportSection } from './useReportData';

/**
 * Calculate surplus or deficit for revenue and expenditure report
 * @param sections Report sections containing revenue and expense data
 * @param loading Loading state from the report data
 * @returns Object containing calculated surplus values
 */
export function useRevenueSurplusCalculations(
  sections: FinancialReportSection[],
  loading: boolean
) {
  // Calculate surplus for FY2024 and FY2023
  const { surplus, surplusPreviousYear } = useMemo(() => {
    if (loading || !sections.length) return { surplus: undefined, surplusPreviousYear: undefined };
    
    // Find total revenue
    const revenueSection = sections.find(section => 
      section.title.toLowerCase().includes('revenue') || section.key === 'revenues');
    
    // Find total expenses
    const expenseSection = sections.find(section => 
      section.title.toLowerCase().includes('expense') || section.key === 'expenses');
    
    if (!revenueSection || !expenseSection) {
      console.warn('Could not find revenue or expense section');
      return { surplus: undefined, surplusPreviousYear: undefined };
    }
    
    // Find the total revenue row
    const totalRevenueRow = revenueSection.rows?.find(row => 
      row.isTotal && row.label.toLowerCase().includes('total revenue'));
      
    // Find the total expense row
    const totalExpenseRow = expenseSection.rows?.find(row => 
      row.isTotal && row.label.toLowerCase().includes('total expense'));
    
    if (!totalRevenueRow || !totalExpenseRow) {
      console.warn('Could not find total revenue or expense row');
      return { surplus: undefined, surplusPreviousYear: undefined };
    }
    
    // Calculate surplus for FY2024
    const revenue2024 = safeParseNumber(totalRevenueRow.fy2024Value);
    const expense2024 = safeParseNumber(totalExpenseRow.fy2024Value);
    const surplus = revenue2024 !== null && expense2024 !== null
      ? revenue2024 - expense2024
      : undefined;
    
    // Calculate surplus for FY2023
    const revenue2023 = safeParseNumber(totalRevenueRow.fy2023Value);
    const expense2023 = safeParseNumber(totalExpenseRow.fy2023Value);
    const surplusPreviousYear = revenue2023 !== null && expense2023 !== null
      ? revenue2023 - expense2023
      : undefined;
    
    return { surplus, surplusPreviousYear };
  }, [sections, loading]);
  
  return { surplus, surplusPreviousYear };
}

/**
 * Safely parses a value to a number, handling various input types
 * @param value The value to parse
 * @returns Parsed number or null if parsing fails
 */
function safeParseNumber(value: any): number | null {
  if (value === undefined || value === null) return null;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    // Remove any currency symbols, commas, etc.
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
} 