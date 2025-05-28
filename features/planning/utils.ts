// Format currency for display
export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === 0) return "-";
  
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate sum of a specific quarter across all activities
export const calculateQuarterTotal = (
  activities: Array<any>,
  quarterKey: 'amountQ1' | 'amountQ2' | 'amountQ3' | 'amountQ4'
): number => {
  return activities.reduce((sum, activity) => {
    return sum + (activity[quarterKey] || 0);
  }, 0);
};

// Calculate grand total of all quarterly budgets
export const calculateGrandTotal = (activities: Array<any>): number => {
  return activities.reduce((sum, activity) => {
    return sum + (activity.totalBudget || 0);
  }, 0);
}; 