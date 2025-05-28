import { z } from "zod"

// Metadata schema for the financial report header
export const metadataSchema = z.object({
  healthCenter: z.string({
    required_error: "Please select a health center",
  }),
  district: z.string(),
  project: z.string({
    required_error: "Please select a project",
  }),
  reportingPeriod: z.string({
    required_error: "Please select a reporting period",
  }),
})

export type MetadataFormValues = z.infer<typeof metadataSchema>

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

// Define the financial report schema with the hierarchical structure
export const financialReportSchema = z.object({
  metadata: metadataSchema,
  rows: z.array(financialRowSchema),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  submittedAt: z.date().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
})

export type FinancialReportData = z.infer<typeof financialReportSchema>

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
        { id: "a1", title: "Opening Balances" },
        { id: "a2", title: "Transfers from SPIU/RBC" },
      ],
    },
    {
      id: "b",
      title: "B. Expenditures (GF approved activities)",
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
  ]
} 