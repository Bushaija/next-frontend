import { FinancialRow } from "./schema/financial-report"

// Helper function to expand all nodes in a financial report
export function expandAllNodes(data: FinancialRow[]): Set<string> {
  const result = new Set<string>()
  
  // Recursively collect all node IDs
  const collectIds = (rows: FinancialRow[]) => {
    for (const row of rows) {
      if (row.children && row.children.length > 0) {
        result.add(row.id)
        collectIds(row.children)
      }
    }
  }
  
  collectIds(data)
  return result
} 