import { z } from "zod"


// Constants for projects
export const PROJECTS = [
  "HIV NSP BUDGET SUPPORT",
  "MALARIA CONTROL",
  "TB PROGRAM",
] as const

export const PROJECT_DISPLAY_NAMES: Record<string, string> = {
  "HIV NSP BUDGET SUPPORT": "HIV NSP BUDGET SUPPORT",
  "MALARIA CONTROL": "MALARIA CONTROL",
  "TB PROGRAM": "TB PROGRAM",
}

// Constants for reporting periods
export const REPORTING_PERIODS = [
  "JULY - SEPTEMBER / 2023",
  "OCTOBER - DECEMBER / 2023",
  "JANUARY - MARCH / 2024",
  "APRIL - JUNE / 2024",
] as const

export const PERIOD_END_DATES: Record<string, string> = {
  "JULY - SEPTEMBER / 2023": "30/09/2023",
  "OCTOBER - DECEMBER / 2023": "31/12/2023",
  "JANUARY - MARCH / 2024": "31/03/2024",
  "APRIL - JUNE / 2024": "30/06/2024",
}

// Define the financial row type before defining the schema
export type FinancialRow = {
  id: string
  title: string
  q1?: number
  q2?: number
  q3?: number
  q4?: number
  cumulativeBalance?: number
  comments?: string
  isCategory?: boolean
  children?: FinancialRow[]
  isEditable?: boolean
}

// Schema for a financial row item - can have children for hierarchical structure
export const financialRowSchema: z.ZodType<FinancialRow> = z.lazy(() => 
  z.object({
    id: z.string(),
    title: z.string(),
    q1: z.number().optional(),
    q2: z.number().optional(),
    q3: z.number().optional(),
    q4: z.number().optional(),
    cumulativeBalance: z.number().optional(),
    comments: z.string().optional(),
    isCategory: z.boolean().optional(),
    children: z.array(financialRowSchema).optional(),
    isEditable: z.boolean().optional().default(true),
  })
)

// Retain the old line item schema for compatibility
export const financialLineItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(), // 1, 2, or 3 depending on hierarchy
  parentId: z.string().optional(), // Reference to parent item for hierarchy
  q1: z.number().optional(),
  q2: z.number().optional(),
  q3: z.number().optional(),
  q4: z.number().optional(),
  cumulative: z.number().optional(), // Can be calculated
  comments: z.string().optional(),
  isCalculated: z.boolean().optional(), // If true, sum of child items
  isEditable: z.boolean().optional(), // If false, calculated or header row
})

export type FinancialLineItem = z.infer<typeof financialLineItemSchema>

// Constants for the financial report structure
export const REPORT_SECTIONS = {
  RECEIPTS: 'A',
  EXPENDITURES: 'B',
  SURPLUS_DEFICIT: 'C',
  FINANCIAL_ASSETS: 'D',
  FINANCIAL_LIABILITIES: 'E',
  NET_FINANCIAL_ASSETS: 'F',
  CLOSING_BALANCES: 'G',
}

// Expenditure subsections
export const EXPENDITURE_SUBSECTIONS = {
  HUMAN_RESOURCES: '01',
  MONITORING_EVALUATION: '02',
  LIVING_SUPPORT: '03',
  OVERHEADS: '04',
  TRANSFERS: '05',
}

// Helper function to calculate totals for a hierarchical financial structure
export function calculateHierarchicalTotals(rows: FinancialRow[]): FinancialRow[] {
  const result = [...rows]
  
  // First pass: Calculate child sums and cumulative balances for each row
  const calculateRowTotals = (row: FinancialRow): FinancialRow => {
    const newRow = { ...row }
    
    // If the row has children, calculate their totals first
    if (newRow.children && newRow.children.length > 0) {
      newRow.children = newRow.children.map((child: FinancialRow) => calculateRowTotals(child))
      
      // Initialize quarter sums
      let q1Sum = 0
      let q2Sum = 0
      let q3Sum = 0
      let q4Sum = 0
      
      // Sum up child values
      for (const child of newRow.children) {
        q1Sum += child.q1 || 0
        q2Sum += child.q2 || 0
        q3Sum += child.q3 || 0
        q4Sum += child.q4 || 0
      }
      
      // Only set values for category rows that should be calculated
      if (newRow.isCategory) {
        newRow.q1 = q1Sum || undefined
        newRow.q2 = q2Sum || undefined
        newRow.q3 = q3Sum || undefined
        newRow.q4 = q4Sum || undefined
      }
    }
    
    // Calculate cumulative balance for all rows (Formula 1)
    const quarters = [newRow.q1 || 0, newRow.q2 || 0, newRow.q3 || 0, newRow.q4 || 0]
    const sum = quarters.reduce((acc, val) => acc + val, 0)
    newRow.cumulativeBalance = sum > 0 ? sum : undefined
    
    return newRow
  }
  
  // First pass: Calculate regular totals (child sums and cumulative balances)
  const calculatedRows = result.map(row => calculateRowTotals(row))
  
  // Second pass: Apply special formulas for specific sections
  // Find the main section rows by ID
  const findRowById = (id: string): FinancialRow | undefined => 
    calculatedRows.find(row => row.id === id)
  
  const receiptRow = findRowById('a')
  const expenditureRow = findRowById('b')
  const surplusRow = findRowById('c')
  const finAssetsRow = findRowById('d')
  const finLiabilitiesRow = findRowById('e')
  const netAssetsRow = findRowById('f')
  const closingBalanceRow = findRowById('g')
  
  // Formula 3: Calculate Surplus/Deficit (A - B)
  if (surplusRow && receiptRow && expenditureRow) {
    surplusRow.q1 = (receiptRow.q1 || 0) - (expenditureRow.q1 || 0)
    surplusRow.q2 = (receiptRow.q2 || 0) - (expenditureRow.q2 || 0)
    surplusRow.q3 = (receiptRow.q3 || 0) - (expenditureRow.q3 || 0)
    surplusRow.q4 = (receiptRow.q4 || 0) - (expenditureRow.q4 || 0)
    
    // Recalculate cumulative balance after updating quarters
    surplusRow.cumulativeBalance = (surplusRow.q1 || 0) + (surplusRow.q2 || 0) + 
      (surplusRow.q3 || 0) + (surplusRow.q4 || 0)
    
    // Clear to zero if negative or undefined
    if (!surplusRow.cumulativeBalance || surplusRow.cumulativeBalance <= 0) {
      surplusRow.cumulativeBalance = 0
    }
  }

  
  // Formula 4 & 5: Calculate Net Financial Assets (D - E)
  if (netAssetsRow && finAssetsRow && finLiabilitiesRow) {
    netAssetsRow.q1 = (finAssetsRow.q1 || 0) - (finLiabilitiesRow.q1 || 0)
    netAssetsRow.q2 = (finAssetsRow.q2 || 0) - (finLiabilitiesRow.q2 || 0)
    netAssetsRow.q3 = (finAssetsRow.q3 || 0) - (finLiabilitiesRow.q3 || 0)
    netAssetsRow.q4 = (finAssetsRow.q4 || 0) - (finLiabilitiesRow.q4 || 0)
    
    // Recalculate cumulative balance after updating quarters
    netAssetsRow.cumulativeBalance = (netAssetsRow.q1 || 0) + (netAssetsRow.q2 || 0) + 
      (netAssetsRow.q3 || 0) + (netAssetsRow.q4 || 0)
    
    // Clear to zero if negative or undefined
    if (!netAssetsRow.cumulativeBalance || netAssetsRow.cumulativeBalance <= 0) {
      netAssetsRow.cumulativeBalance = 0
    }
  }

  // Formula 6: Calculate Closing Balance (G1 + G2 + G3)
  if (closingBalanceRow && closingBalanceRow.children) {
    const accumulatedSurplus = closingBalanceRow.children.find(row => row.id === 'g1')
    const priorYearAdjustment = closingBalanceRow.children.find(row => row.id === 'g2')
    const periodSurplus = closingBalanceRow.children.find(row => row.id === 'g3')
    
    // Set the surplus/deficit of the period to match section C
    if (periodSurplus && surplusRow) {
      periodSurplus.q1 = surplusRow.q1
      periodSurplus.q2 = surplusRow.q2
      periodSurplus.q3 = surplusRow.q3
      periodSurplus.q4 = surplusRow.q4
      periodSurplus.cumulativeBalance = surplusRow.cumulativeBalance
    }
    
    // Calculate total closing balance for each quarter
    if (accumulatedSurplus && priorYearAdjustment && periodSurplus) {
      closingBalanceRow.q1 = (accumulatedSurplus.q1 || 0) + (priorYearAdjustment.q1 || 0) + (periodSurplus.q1 || 0)
      closingBalanceRow.q2 = (accumulatedSurplus.q2 || 0) + (priorYearAdjustment.q2 || 0) + (periodSurplus.q2 || 0)
      closingBalanceRow.q3 = (accumulatedSurplus.q3 || 0) + (priorYearAdjustment.q3 || 0) + (periodSurplus.q3 || 0)
      closingBalanceRow.q4 = (accumulatedSurplus.q4 || 0) + (priorYearAdjustment.q4 || 0) + (periodSurplus.q4 || 0)
      
      // Calculate cumulative balance
      closingBalanceRow.cumulativeBalance = (closingBalanceRow.q1 || 0) + 
        (closingBalanceRow.q2 || 0) + 
        (closingBalanceRow.q3 || 0) + 
        (closingBalanceRow.q4 || 0)
    }
  }

  return calculatedRows
}

// Function to generate an empty financial report template with the standard structure
export function generateEmptyFinancialTemplate(): FinancialRow[] {
  return [
    {
      id: "a",
      title: "A. Receipts",
      isCategory: true,
      children: [
        { id: "a1", title: "Other Incomes" },
        { id: "a2", title: "Transfers from SPIU/RBC" },
      ],
    },
    {
      id: "b",
      title: "B. Expenditures",
      isCategory: true,
      children: [
        {
          id: "b01",
          title: "01. Human Resources + BONUS",
          isCategory: true,
          children: [
            { id: "b01-1", title: "Laboratory Technician" },
            { id: "b01-2", title: "Nurse" },
          ],
        },
        {
          id: "b02",
          title: "02. Monitoring & Evaluation",
          isCategory: true,
          children: [
            { id: "b02-1", title: "Supervision CHWs" },
            { id: "b02-2", title: "Support group meetings" },
          ],
        },
        {
          id: "b03",
          title: "03. Living Support to Clients/Target Populations",
          isCategory: true,
          children: [
            { id: "b03-1", title: "Sample transport" },
            { id: "b03-2", title: "Home visit lost to follow up" },
            { id: "b03-3", title: "Transport and travel for survey/surveillance" },
          ],
        },
        {
          id: "b04",
          title: "04. Overheads (22 - Use of goods & services)",
          isCategory: true,
          children: [
            { id: "b04-1", title: "Infrastructure support" },
            { id: "b04-2", title: "Office supplies" },
            { id: "b04-3", title: "Transport and travel (M-Health)" },
            { id: "b04-4", title: "Bank charges" },
          ],
        },
        {
          id: "b05",
          title: "05. Transfer to other reporting entities",
          isCategory: true,
          children: [
            { id: "b05-1", title: "Transfer to RBC" },
          ],
        },
      ],
    },
    {
      id: "c",
      title: "C. SURPLUS / DEFICIT",
      isCategory: true,
      isEditable: false, // This is calculated
    },
    {
      id: "d",
      title: "D. Financial Assets",
      isCategory: true,
      children: [
        { id: "d1", title: "Cash at bank" },
        { id: "d2", title: "Petty cash" },
        { id: "d3", title: "Receivables (VAT refund)" },
        { id: "d4", title: "Other Receivables" },
      ],
    },
    {
      id: "e",
      title: "E. Financial Liabilities",
      isCategory: true,
      children: [
        { id: "e1", title: "Salaries on borrowed funds (BONUS)" },
        { id: "e2", title: "Payable - Maintenance & Repairs" },
        { id: "e3", title: "Payable - Office suppliers" },
        { id: "e4", title: "Payable - Transportation fees" },
        { id: "e5", title: "VAT refund to RBC" },
      ],
    },
    {
      id: "f",
      title: "F. Net Financial Assets",
      isCategory: true,
      isEditable: false, // This is calculated
    },
    {
      id: "g",
      title: "G. Closing Balance",
      isCategory: true,
      isEditable: false, // This is calculated
      children: [
        { 
          id: "g1", 
          title: "Accumulated Surplus/Deficit",
          isEditable: true // This is manually entered
        },
        { 
          id: "g2", 
          title: "Prior Year Adjustment",
          isEditable: true // This is manually entered
        },
        { 
          id: "g3", 
          title: "Surplus/Deficit of the Period",
          isEditable: false // This is calculated from section C
        }
      ]
    }
  ]
}

// Schema for a financial item (used in the new format)
export const financialItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  type: z.enum(["category", "line_item"]),
  level: z.number(),
  parentId: z.string().nullable(),
  isEditable: z.boolean().default(true),
  isCalculated: z.boolean().default(false),
  values: z.object({
    q1: z.number().nullable(),
    q2: z.number().nullable(),
    q3: z.number().nullable(),
    q4: z.number().nullable(),
    cumulativeBalance: z.number().nullable(),
    comments: z.string().nullable()
  }),
  metadata: z.object({
    formula: z.string().optional(), // e.g., "A - B" for SURPLUS/DEFICIT
    category: z.enum([
      "receipts",
      "expenditures",
      "surplus_deficit",
      "financial_assets",
      "financial_liabilities",
      "net_assets",
      "closing_balances"
    ]).optional(),
    subCategory: z.string().optional(), // e.g., "human_resources", "monitoring_evaluation"
    sortOrder: z.number().optional()
  })
})

// Schema for the entire financial report (new format)
export const financialReportSchema = z.object({
  id: z.string().optional(), // For database persistence
  version: z.string(), // e.g., "1.0.0"
  fiscalYear: z.string(),
  reportingPeriod: z.string(),
  status: z.enum(["draft", "submitted", "approved", "rejected"]).default("draft"),
  metadata: z.object({
    facility: z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      district: z.string(),
      code: z.string().optional()
    }),
    project: z.object({
      id: z.string(),
      name: z.string(),
      code: z.string().optional()
    }).optional(),
    createdBy: z.string().optional(),
    createdAt: z.string().optional(), // ISO date string
    updatedBy: z.string().optional(),
    updatedAt: z.string().optional(), // ISO date string
    submittedAt: z.string().optional(), // ISO date string
    approvedAt: z.string().optional(), // ISO date string
    approvedBy: z.string().optional()
  }),
  items: z.array(financialItemSchema),
  totals: z.object({
    receipts: z.object({
      q1: z.number(),
      q2: z.number(),
      q3: z.number(),
      q4: z.number(),
      cumulativeBalance: z.number()
    }),
    expenditures: z.object({
      q1: z.number(),
      q2: z.number(),
      q3: z.number(),
      q4: z.number(),
      cumulativeBalance: z.number()
    }),
    surplusDeficit: z.object({
      q1: z.number(),
      q2: z.number(),
      q3: z.number(),
      q4: z.number(),
      cumulativeBalance: z.number()
    }),
    financialAssets: z.object({
      q1: z.number(),
      q2: z.number(),
      q3: z.number(),
      q4: z.number(),
      cumulativeBalance: z.number()
    }),
    financialLiabilities: z.object({
      q1: z.number(),
      q2: z.number(),
      q3: z.number(),
      q4: z.number(),
      cumulativeBalance: z.number()
    }),
    netAssets: z.object({
      q1: z.number(),
      q2: z.number(),
      q3: z.number(),
      q4: z.number(),
      cumulativeBalance: z.number()
    }),
    closingBalances: z.object({
      q1: z.number(),
      q2: z.number(),
      q3: z.number(),
      q4: z.number(),
      cumulativeBalance: z.number()
    })
  }),
  validation: z.object({
    isBalanced: z.boolean(),
    errors: z.array(z.object({
      code: z.string(),
      message: z.string(),
      itemId: z.string().optional(),
      severity: z.enum(["error", "warning", "info"])
    })).optional(),
    lastValidatedAt: z.string().optional() // ISO date string
  }).optional()
})

// Type definitions
export type FinancialItem = z.infer<typeof financialItemSchema>
export type FinancialReport = z.infer<typeof financialReportSchema>
export type FinancialReportData = FinancialReport // Alias for backward compatibility

// Helper function to convert the old format to the new format
export function normalizeFinancialData(oldData: any): FinancialReport {
  const items: FinancialItem[] = [];
  const reportTotals = {
    receipts: { q1: 0, q2: 0, q3: 0, q4: 0, cumulativeBalance: 0 },
    expenditures: { q1: 0, q2: 0, q3: 0, q4: 0, cumulativeBalance: 0 },
    surplusDeficit: { q1: 0, q2: 0, q3: 0, q4: 0, cumulativeBalance: 0 },
    financialAssets: { q1: 0, q2: 0, q3: 0, q4: 0, cumulativeBalance: 0 },
    financialLiabilities: { q1: 0, q2: 0, q3: 0, q4: 0, cumulativeBalance: 0 },
    netAssets: { q1: 0, q2: 0, q3: 0, q4: 0, cumulativeBalance: 0 },
    closingBalances: { q1: 0, q2: 0, q3: 0, q4: 0, cumulativeBalance: 0 }
  };

  // Helper function to process items recursively
  function processItem(item: any, level: number, parentId: string | null = null): void {
    const category = getCategoryFromId(item.id);
    const normalizedItem: FinancialItem = {
      id: item.id,
      code: item.id, // Using id as code for now
      title: item.title,
      type: item.isCategory ? "category" : "line_item",
      level,
      parentId,
      isEditable: item.isEditable !== false,
      isCalculated: ["c", "f", "g"].includes(item.id), // SURPLUS/DEFICIT, NET ASSETS, CLOSING BALANCES
      values: {
        q1: item.q1 ?? null,
        q2: item.q2 ?? null,
        q3: item.q3 ?? null,
        q4: item.q4 ?? null,
        cumulativeBalance: item.cumulativeBalance ?? null,
        comments: item.comments ?? null
      },
      metadata: {
        category,
        subCategory: getSubCategoryFromId(item.id),
        sortOrder: getSortOrderFromId(item.id)
      }
    };

    items.push(normalizedItem);

    // Update totals based on category
    if (item.isCategory && category) {
      updateTotals(item, category, reportTotals);
    }

    // Process children recursively
    if (item.children) {
      item.children.forEach((child: any) => processItem(child, level + 1, item.id));
    }
  }

  // Process all top-level items
  oldData.tableData.forEach((item: any) => processItem(item, 1));

  // Create the normalized report
  const normalizedReport: FinancialReport = {
    version: "1.0.0",
    fiscalYear: oldData.metadata.fiscalYear,
    reportingPeriod: oldData.metadata.reportingPeriod,
    status: "draft",
    metadata: {
      facility: {
        id: "temp-id", // This should come from your backend
        name: oldData.metadata.healthCenter,
        type: "health_center", // This should come from your backend
        district: oldData.metadata.district,
        code: oldData.metadata.healthCenter.toUpperCase().replace(/\s+/g, '_')
      },
      project: oldData.metadata.project ? {
        id: "temp-project-id", // This should come from your backend
        name: oldData.metadata.project,
        code: oldData.metadata.project.toUpperCase().replace(/\s+/g, '_')
      } : undefined
    },
    items,
    totals: reportTotals,
    validation: {
      isBalanced: true, // This should be calculated
      errors: []
    }
  };

  return normalizedReport;
}

// Helper functions for metadata
function getCategoryFromId(id: string): FinancialItem["metadata"]["category"] {
  const categoryMap: Record<string, FinancialItem["metadata"]["category"]> = {
    "a": "receipts",
    "b": "expenditures",
    "c": "surplus_deficit",
    "d": "financial_assets",
    "e": "financial_liabilities",
    "f": "net_assets",
    "g": "closing_balances"
  };
  return categoryMap[id.charAt(0)] || undefined;
}

function getSubCategoryFromId(id: string): string | undefined {
  if (id.length <= 1) return undefined;
  const subCategoryMap: Record<string, string> = {
    "b01": "human_resources",
    "b02": "monitoring_evaluation",
    "b03": "living_support",
    "b04": "overheads",
    "b05": "transfers"
  };
  return subCategoryMap[id.substring(0, 3)] || undefined;
}

function getSortOrderFromId(id: string): number {
  const baseOrder = id.charCodeAt(0) - 97; // 'a' -> 0, 'b' -> 1, etc.
  if (id.length === 1) return baseOrder * 1000;
  
  const subOrder = parseInt(id.substring(1).replace(/\D/g, '')) || 0;
  return baseOrder * 1000 + subOrder;
}

function updateTotals(
  item: any, 
  category: NonNullable<FinancialItem["metadata"]["category"]>,
  totals: FinancialReport["totals"]
): void {
  const target = category === "receipts" ? "receipts" :
                category === "expenditures" ? "expenditures" :
                category === "surplus_deficit" ? "surplusDeficit" :
                category === "financial_assets" ? "financialAssets" :
                category === "financial_liabilities" ? "financialLiabilities" :
                category === "net_assets" ? "netAssets" :
                "closingBalances";

  totals[target].q1 += item.q1 || 0;
  totals[target].q2 += item.q2 || 0;
  totals[target].q3 += item.q3 || 0;
  totals[target].q4 += item.q4 || 0;
  totals[target].cumulativeBalance += item.cumulativeBalance || 0;
}

// Remove the grouped export since we already have individual exports
// export { financialItemSchema, financialReportSchema }; 