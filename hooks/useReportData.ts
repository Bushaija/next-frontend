import { useState, useEffect } from 'react';

// Type for a basic financial row
export interface FinancialReportRow {
  id?: string;
  label: string;
  note?: string;
  fy2024Value?: number | string;
  fy2023Value?: number | string;
  surplus?: number | string;
  adjustments?: number | string;
  total?: number | string;
  originalBudget?: number | string;
  revisedBudget?: number | string;
  actualBudget?: number | string;
  variance?: number | string;
  performance?: number | string;
  isTotal?: boolean;
  indentLevel?: number;
  sectionKey?: string;
}

// Type for grouped sections of financial data
export interface FinancialReportSection {
  title: string;
  key: string;
  rows: FinancialReportRow[];
  subsections?: FinancialReportSection[];
  isSummarySection?: boolean;
  summaryLabel?: string;
  formulaHint?: string;
  fy2023SurplusValue?: number | string;
}

// Type for the entire report
export interface FinancialReport {
  title: {
    governmentBody: string;
    program: string;
    reportType: string;
    statement: string;
  };
  sections: FinancialReportSection[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch and parse financial report data
 * @param reportType The type of report to load (balance-sheet, cash-flow, changes-assets, budget-actual, revenue-expenditure)
 * @returns Financial report data, loading state, and error state
 */
export function useReportData(reportType: string): FinancialReport {
  const [report, setReport] = useState<FinancialReport>({
    title: {
      governmentBody: '',
      program: '',
      reportType: '',
      statement: '',
    },
    sections: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    // In a real implementation, this would fetch and parse the markdown file
    // For now, we'll simulate loading data
    const loadData = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Example data structure - this would come from parsing the markdown in reality
        if (reportType === 'balance-sheet') {
          setReport({
            title: {
              governmentBody: 'Government of Rwanda',
              program: 'HIV/NSP Budget Support of KIGEME District Hospital',
              reportType: 'Financial Statement for the Year Ended 31 December 2024',
              statement: 'Statement of Financial Assets and Liabilities as at 31 December 2024',
            },
            sections: [
              {
                title: '1. ASSETS',
                key: 'assets',
                rows: [],
                subsections: [
                  {
                    title: 'Current Assets',
                    key: 'current-assets',
                    rows: [
                      { label: 'Cash and cash equivalents', fy2024Value: 2500000, fy2023Value: 2250000, indentLevel: 1 },
                      // { label: 'Receivables from exchange transactions', fy2024Value: 1200000, fy2023Value: 980000, indentLevel: 1 },
                      { label: 'Advance payments', fy2024Value: 350000, fy2023Value: 420000, indentLevel: 1 },
                      { label: 'Total Current Assets', fy2024Value: 4050000, fy2023Value: 3650000, isTotal: true },
                    ]
                  },
                  {
                    title: 'Non-current Assets',
                    key: 'non-current-assets',
                    rows: [
                      { label: '', fy2024Value: '-', fy2023Value: '-', indentLevel: 1 },
                      // { label: 'Direct investments', fy2024Value: 5000000, fy2023Value: 4800000, indentLevel: 1 },
                      { label: 'Total Non-current Assets', fy2024Value: 5000000, fy2023Value: 4800000, isTotal: true },
                    ]
                  }
                ]
              },
              {
                title: '2. LIABILITIES',
                key: 'liabilities',
                rows: [],
                subsections: [
                  {
                    title: 'Current Liabilities',
                    key: 'current-liabilities',
                    rows: [
                      { label: 'Payables', fy2024Value: 800000, fy2023Value: 750000, indentLevel: 1 },
                      // { label: 'Payments received in advance', fy2024Value: 200000, fy2023Value: 180000, indentLevel: 1 },
                      // { label: 'Retained performance securities', fy2024Value: 150000, fy2023Value: 120000, indentLevel: 1 },
                      { label: 'Total Current Liabilities', fy2024Value: 1150000, fy2023Value: 1050000, isTotal: true },
                    ]
                  },
                  {
                    title: 'Non-current Liabilities',
                    key: 'non-current-liabilities',
                    rows: [
                      // { label: 'Direct borrowings', fy2024Value: 3000000, fy2023Value: 3500000, indentLevel: 1 },
                      { label: '', fy2024Value: '-', fy2023Value: '-', indentLevel: 1 },
                      { label: 'Total Non-current Liabilities', fy2024Value: 3000000, fy2023Value: 3500000, isTotal: true },
                    ]
                  }
                ]
              },
            ],
            loading: false,
            error: null,
          });
        } else if (reportType === 'cash-flow') {
          setReport({
            title: {
              governmentBody: 'Government of Rwanda',
              program: 'HIV/NSP Budget Support of KIGEME District Hospital',
              reportType: 'Financial Statement for the Year Ended 31 December 2024',
              statement: 'Statement of Cash Flows for the period ended 31 Decemeber 2024',
            },
            sections: [
              {
                title: 'Cash flow from operating activities',
                key: 'operating-activities',
                rows: [],
                subsections: [
                  {
                    title: '1. REVENUES',
                    key: 'revenues',
                    rows: [
                      { label: '1.1 Revenue from Non-exchange', indentLevel: 0, isTotal: false },
                      // { label: 'Tax revenue', fy2024Value: 4200000, fy2023Value: 3800000, indentLevel: 1 },
                      // { label: 'Grants', fy2024Value: 6500000, fy2023Value: 6200000, indentLevel: 1 },
                      // { label: 'Transfers from central treasury', fy2024Value: 2300000, fy2023Value: 2100000, indentLevel: 1 },
                      { label: 'Transfers from public entities', fy2024Value: 1500000, fy2023Value: 1300000, indentLevel: 1 },
                      // { label: 'Fines, penalties, and licenses', fy2024Value: 800000, fy2023Value: 700000, indentLevel: 1 },
                      { label: '1.2 Revenue from Exchange transactions', indentLevel: 0, isTotal: false },
                      { label: '', fy2024Value: '-', fy2023Value: '-', indentLevel: 1 },
                      // { label: 'Property income', fy2024Value: 500000, fy2023Value: 450000, indentLevel: 1 },
                      // { label: 'Sales of goods and services', fy2024Value: 1200000, fy2023Value: 1000000, indentLevel: 1 },
                      // { label: 'Proceeds from sale of capital items', fy2024Value: 0, fy2023Value: 0, indentLevel: 1 },
                      // { label: 'Other revenue', fy2024Value: 300000, fy2023Value: 250000, indentLevel: 1 },
                      { label: 'Total Revenue', fy2024Value: 17300000, fy2023Value: 15800000, isTotal: true },
                    ]
                  },
                  {
                    title: '2. EXPENSES',
                    key: 'expenses',
                    rows: [
                      { label: 'Other expenses', fy2024Value: -500000, fy2023Value: -450000, indentLevel: 1 },
                      { label: 'Compensation of employees', fy2024Value: -4800000, fy2023Value: -4500000, indentLevel: 1 },
                      { label: 'Goods and services', fy2024Value: -3200000, fy2023Value: -2900000, indentLevel: 1 },
                      { label: 'Grants and other transfers', fy2024Value: -1200000, fy2023Value: -1100000, indentLevel: 1 },
                      // { label: 'Subsidies', fy2024Value: -800000, fy2023Value: -700000, indentLevel: 1 },
                      // { label: 'Social assistance', fy2024Value: -1500000, fy2023Value: -1400000, indentLevel: 1 },
                      // { label: 'Finance costs', fy2024Value: -350000, fy2023Value: -320000, indentLevel: 1 },
                      // { label: 'Other expenses', fy2024Value: -700000, fy2023Value: -650000, indentLevel: 1 },
                      { label: 'Total Expenses', fy2024Value: -13050000, fy2023Value: -12020000, isTotal: true },
                    ]
                  },
                  {
                    title: 'Adjusted for:',
                    key: 'adjustments',
                    rows: [
                      { label: 'Changes in receivables', fy2024Value: -200000, fy2023Value: -150000, indentLevel: 1 },
                      { label: 'Changes in payables', fy2024Value: 300000, fy2023Value: 250000, indentLevel: 1 },
                      // { label: 'Prior year adjustments', fy2024Value: -400000, fy2023Value: -300000, indentLevel: 1 },
                      { label: 'Total Adjustments', fy2024Value: -300000, fy2023Value: -200000, isTotal: true },
                    ]
                  }
                ]
              },
              {
                title: 'Cash flows from investing activities',
                key: 'investing-activities',
                rows: [],
                subsections: [
                  {
                    title: 'Investing Activities',
                    key: 'investing-activities-detail',
                    rows: [
                      { label: '', fy2024Value: '-', fy2023Value: '-', indentLevel: 1 },
                      // { label: 'Acquisition of fixed assets', fy2024Value: -2800000, fy2023Value: -2400000, indentLevel: 1 },
                      // { label: 'Proceeds from sale of capital items', fy2024Value: 450000, fy2023Value: 380000, indentLevel: 1 },
                      // { label: 'Purchase of shares', fy2024Value: -500000, fy2023Value: -1200000, indentLevel: 1 },
                      { label: 'Total Investing Activities', fy2024Value: -2850000, fy2023Value: -3220000, isTotal: true },
                    ]
                  }
                ]
              },
              {
                title: 'Cash flows from financing activities',
                key: 'financing-activities',
                rows: [],
                subsections: [
                  {
                    title: 'Financing Activities',
                    key: 'financing-activities-detail',
                    rows: [
                      { label: 'Proceeds from borrowings', fy2024Value: 1500000, fy2023Value: 2000000, indentLevel: 1 },
                      { label: 'Repayment of borrowings', fy2024Value: -1200000, fy2023Value: -1100000, indentLevel: 1 },
                      { label: 'Total Financing Activities', fy2024Value: 300000, fy2023Value: 900000, isTotal: true },
                    ]
                  }
                ]
              },
              {
                title: '',
                key: 'beginning-end',
                rows: [
                  { label: 'Net increase/(decrease) in cash and cash equivalents (A+B+C)', fy2024Value: 1400000, fy2023Value: 1260000, isTotal: true },
                  { label: 'Prior year adjustments', fy2024Value: '-', fy2023Value: '-' },
                  { label: 'Cash and cash equivalents at beginning of period', fy2024Value: 2250000, fy2023Value: 1790000 },
                  { label: 'Cash and cash equivalents at end of period', fy2024Value: 3500000, fy2023Value: 2950000, isTotal: true },
                ],
              }
            ],
            loading: false,
            error: null,
          });
        } else if (reportType === 'changes-assets') {
          setReport({
            title: {
              governmentBody: 'Government of Rwanda',
              program: 'HIV/NSP Budget Support of KIGEME District Hospital',
              reportType: 'Financial Statement for the Year Ended 31 December 2024',
              statement: 'Statement of Changes in Net Assets for the Year Ended 31 December 2024',
            },
            sections: [
              {
                title: 'FY 2022/2023',
                key: 'fy-2022-2023',
                isSummarySection: false,
                rows: [
                  { label: 'Balances as at 01 July 2022', isTotal: true, surplus: 15000000, adjustments: 0, total: 15000000 },
                ],
                subsections: [
                  {
                    title: '1. Prior Year Adjustments',
                    key: 'prior-year-2022',
                    rows: [
                      { label: '', indentLevel: 1, surplus: '', adjustments: '', total: '' },
                      // { label: 'Cash and cash equivalents', indentLevel: 1, surplus: 0, adjustments: 120000, total: 120000 },
                      // { label: 'Receivables and other financial assets', indentLevel: 1, surplus: 0, adjustments: 85000, total: 85000 },
                      // { label: 'Investments', indentLevel: 1, surplus: 0, adjustments: -50000, total: -50000 },
                      // { label: 'Payables and other liabilities', indentLevel: 1, surplus: 0, adjustments: -75000, total: -75000 },
                      // { label: 'Borrowing', indentLevel: 1, surplus: 0, adjustments: -200000, total: -200000 },
                      // { label: 'Net surplus/(deficit) for the year', indentLevel: 1, surplus: 1200000, adjustments: 0, total: 1200000 },
                      // { label: 'Total Adjustments', indentLevel: 0, isTotal: true, surplus: 1200000, adjustments: -120000, total: 1080000 },
                    ]
                  }
                ]
              },
              {
                title: 'Balances as at 30 June 2024',
                key: 'balance-2024-june',
                isSummarySection: false,
                rows: [
                  { label: 'Balances as at 30 June 2024', isTotal: true, surplus: 16200000, adjustments: -120000, total: 16080000 },
                ],
              },
              {
                title: 'FY 2023/2024',
                key: 'fy-2023-2024',
                isSummarySection: false,
                rows: [
                  { label: 'Balances as at 30 July 2023', isTotal: true, surplus: 16200000, adjustments: -120000, total: 16080000 },
                ],
                subsections: [
                  {
                    title: 'Prior Year Adjustments:',
                    key: 'prior-year-2023',
                    rows: [
                      { label: '-', indentLevel: 1, surplus: '-', adjustments: '-', total: '-' },
                      // { label: 'Cash and cash equivalents', indentLevel: 1, surplus: 0, adjustments: 150000, total: 150000 },
                      // { label: 'Receivables and other financial assets', indentLevel: 1, surplus: 0, adjustments: 95000, total: 95000 },
                      // { label: 'Investments', indentLevel: 1, surplus: 0, adjustments: -40000, total: -40000 },
                      // { label: 'Payables and other liabilities', indentLevel: 1, surplus: 0, adjustments: -65000, total: -65000 },
                      // { label: 'Borrowing', indentLevel: 1, surplus: 0, adjustments: -180000, total: -180000 },
                      // { label: 'Net surplus/(deficit) for the year', indentLevel: 1, surplus: 1500000, adjustments: 0, total: 1500000 },
                      // { label: 'Total Adjustments', indentLevel: 0, isTotal: true, surplus: 1500000, adjustments: -40000, total: 1460000 },
                    ]
                  }
                ]
              },
              {
                title: 'BALANCES AS AT 30 September 2024',
                key: 'final-balance',
                isSummarySection: true,
                rows: [
                  { label: 'BALANCES AS AT 30 September 2024', isTotal: true, surplus: 17700000, adjustments: -160000, total: 17540000 },
                ],
              },
            ],
            loading: false,
            error: null
          });
        } else if (reportType === 'budget-actual') {
          setReport({
            title: {
              governmentBody: 'Government of Rwanda',
              program: 'HIV/NSP Budget Support of KIGEME District Hospital',
              reportType: 'Financial Statement for the Year Ended 31 December 2024',
              statement: 'Statement of Budget vs Actual for the Year Ended 31 December 2024',
            },
            sections: [
              {
                title: 'RECEIPTS',
                key: 'receipts',
                rows: [
                  // { 
                  //   label: 'Tax revenue', 
                  //   originalBudget: 4500000, 
                  //   revisedBudget: 4200000, 
                  //   actualBudget: 4250000,
                  //   indentLevel: 1 
                  // },
                  // { 
                  //   label: 'Grants and transfers', 
                  //   originalBudget: 6800000, 
                  //   revisedBudget: 6500000, 
                  //   actualBudget: 6600000,
                  //   indentLevel: 1 
                  // },
                  // { 
                  //   label: 'Other revenue', 
                  //   originalBudget: 350000, 
                  //   revisedBudget: 300000, 
                  //   actualBudget: 280000,
                  //   indentLevel: 1 
                  // },
                  { 
                    label: 'Transfers from public entities', 
                    originalBudget: 1600000, 
                    revisedBudget: 1500000, 
                    actualBudget: 1500000,
                    indentLevel: 1 
                  },
                  { 
                    label: 'Total Receipts', 
                    originalBudget: 13250000, 
                    revisedBudget: 12500000, 
                    actualBudget: 12630000,
                    isTotal: true 
                  },
                ]
              },
              {
                title: 'EXPENDITURES',
                key: 'expenditures',
                rows: [
                  // { 
                  //   label: 'Compensation of employees', 
                  //   originalBudget: 5000000, 
                  //   revisedBudget: 4800000, 
                  //   actualBudget: 4850000,
                  //   indentLevel: 1 
                  // },
                  { 
                    label: 'Goods and services', 
                    originalBudget: 380000, 
                    revisedBudget: 350000, 
                    actualBudget: 345000,
                    indentLevel: 1 
                  },
                  // { 
                  //   label: 'Finance cost', 
                  //   originalBudget: 380000, 
                  //   revisedBudget: 350000, 
                  //   actualBudget: 345000,
                  //   indentLevel: 1 
                  // },
                  // { 
                  //   label: 'Subsidies', 
                  //   originalBudget: 850000, 
                  //   revisedBudget: 800000, 
                  //   actualBudget: 810000,
                  //   indentLevel: 1 
                  // },
                  { 
                    label: 'Grants and other transfers', 
                    originalBudget: 12203, 
                    revisedBudget: '-', 
                    actualBudget: '-',
                    indentLevel: 1 
                  },
                  // { 
                  //   label: 'Social assistance', 
                  //   originalBudget: 1600000, 
                  //   revisedBudget: 1500000, 
                  //   actualBudget: 1520000,
                  //   indentLevel: 1 
                  // },
                  // { 
                  //   label: 'Other expenses', 
                  //   originalBudget: 750000, 
                  //   revisedBudget: 700000, 
                  //   actualBudget: 695000,
                  //   indentLevel: 1 
                  // },
                  { 
                    label: 'Total Payments', 
                    originalBudget: 9880000, 
                    revisedBudget: 9350000, 
                    actualBudget: 9400000,
                    isTotal: true 
                  },
                ]
              },
              {
                title: 'Operating Balance',
                key: 'operating-balance',
                rows: [
                  { 
                    label: 'Operating Balance', 
                    originalBudget: '-', 
                    revisedBudget: '-', 
                    actualBudget: '-',
                    isTotal: true 
                  },
                ]
              },
              {
                title: 'TRANSACTIONS IN NON-FINANCIAL ASSETS',
                key: 'non-financial-assets',
                rows: [
                  // { 
                  //   label: 'Capital expenditure', 
                  //   originalBudget: 3000000, 
                  //   revisedBudget: 2800000, 
                  //   actualBudget: 2750000,
                  //   indentLevel: 1 
                  // },
                  // { 
                  //   label: 'Disposal of tangible fixed assets', 
                  //   originalBudget: 480000, 
                  //   revisedBudget: 450000, 
                  //   actualBudget: 460000,
                  //   indentLevel: 1 
                  // },
                  { 
                    label: 'TOTAL NON-FINANCIAL ASSETS', 
                    originalBudget: '-', 
                    revisedBudget: '-', 
                    actualBudget: '-',
                    isTotal: true 
                  },
                ]
              },
              {
                title: 'Net lending/(borrowing)',
                key: 'net-lending-borrowing',
                // isSummarySection: true,
                rows: [
                  { 
                    label: '55.39%', 
                    originalBudget: '55.39%', 
                    revisedBudget: '55.39%', 
                    actualBudget: '55.39%',
                    isTotal: true 
                  },
                ]
              },
              {
                title: 'Financing',
                key: 'net-lending-borrowing',
                // isSummarySection: true,
                rows: [
                  { 
                    label: '', 
                    originalBudget: '-', 
                    revisedBudget: '-', 
                    actualBudget: '-',
                    isTotal: true 
                  },
                ]
              },
              {
                title: 'Total Net Incurrence of Liabilities',
                key: 'budget-surplus-deficit',
                // isSummarySection: true,
                rows: [
                  { 
                    label: '-', 
                    originalBudget: '-', 
                    revisedBudget: '-', 
                    actualBudget: '-',
                    isTotal: true 
                  },
                ]
              },
            ],
            loading: false,
            error: null,
          });
        } else if (reportType === 'revenue-expenditure') {
          setReport({
            title: {
              governmentBody: 'Government of Rwanda',
              program: 'HIV/NSP Budget Support of KIGEME District Hospital',
              reportType: 'Financial Statement for the Year Ended 31 December 2024',
              statement: 'Statement of Revenue and Expenditure for the period ended 31 December 2024',
            },
            sections: [
              {
                title: '1. REVENUES',
                key: 'revenues',
                rows: [],
                subsections: [
                  {
                    title: '1.1 Revenue from Non-exchange',
                    key: 'non-exchange',
                    rows: [
                      // { label: 'Tax revenue', fy2024Value: 4200000, fy2023Value: 3800000, indentLevel: 1 },
                      // { label: 'Grants', fy2024Value: 6500000, fy2023Value: 6200000, indentLevel: 1 },
                      // { label: 'Transfers from central treasury', fy2024Value: 2300000, fy2023Value: 2100000, indentLevel: 1 },
                      { label: 'Transfers from public entities', fy2024Value: 1500000, fy2023Value: 1300000, indentLevel: 1 },
                      // { label: 'Fines, penalties, and licenses', fy2024Value: 800000, fy2023Value: 700000, indentLevel: 1 },
                    ]
                  },
                  {
                    title: '1.2 Revenue from Exchange transactions',
                    key: 'exchange',
                    rows: [
                      { label: '', fy2024Value: '-', fy2023Value: '-', indentLevel: 1 },
                      // { label: 'Property income', fy2024Value: 500000, fy2023Value: 450000, indentLevel: 1 },
                      // { label: 'Sales of goods and services', fy2024Value: 1200000, fy2023Value: 1000000, indentLevel: 1 },
                      // { label: 'Proceeds from sale of capital items', fy2024Value: 0, fy2023Value: 0, indentLevel: 1 },
                      // { label: 'Other revenue', fy2024Value: 300000, fy2023Value: 250000, indentLevel: 1 },
                    ]
                  },
                  {
                    title: '1.3 Borrowings',
                    key: 'borrowings',
                    rows: [
                      // { label: 'Domestic borrowings', fy2024Value: 1500000, fy2023Value: 1200000, indentLevel: 1 },
                      // { label: 'External borrowings', fy2024Value: 2500000, fy2023Value: 2300000, indentLevel: 1 },
                    ]
                  }
                ],
                rows: [
                  { label: 'TOTAL REVENUE', fy2024Value: 21300000, fy2023Value: 19300000, isTotal: true },
                ],
              },
              {
                title: '2. EXPENSES',
                key: 'expenses',
                rows: [
                  // { label: 'Compensation of employees', fy2024Value: 4800000, fy2023Value: 4500000, indentLevel: 1 },
                  { label: 'Goods and services', fy2024Value: 3200000, fy2023Value: 2900000, indentLevel: 1 },
                  { label: 'Grants and other transfers', fy2024Value: 1200000, fy2023Value: 1100000, indentLevel: 1 },
                  // { label: 'Subsidies', fy2024Value: 800000, fy2023Value: 700000, indentLevel: 1 },
                  // { label: 'Social assistance', fy2024Value: 1500000, fy2023Value: 1400000, indentLevel: 1 },
                  // { label: 'Finance costs', fy2024Value: 350000, fy2023Value: 320000, indentLevel: 1 },
                  // { label: 'Acquisition of fixed assets', fy2024Value: 2800000, fy2023Value: 2600000, indentLevel: 1 },
                  // { label: 'Repayment of borrowings', fy2024Value: 1200000, fy2023Value: 1100000, indentLevel: 1 },
                  // { label: 'Other expenses', fy2024Value: 700000, fy2023Value: 650000, indentLevel: 1 },
                  { label: 'TOTAL EXPENSES', fy2024Value: 16550000, fy2023Value: 15270000, isTotal: true },
                ],
                isSummarySection: true
              }
            ],
            loading: false,
            error: null,
          });
        } else {
          setReport(prev => ({
            ...prev,
            loading: false,
            error: `Unknown report type: ${reportType}`,
          }));
        }
      } catch (error) {
        console.error('Error loading report data:', error);
        setReport(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load report data. Please try again later.',
        }));
      }
    };

    loadData();
  }, [reportType]);

  return report;
} 