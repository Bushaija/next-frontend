"use client"

import { useMemo } from "react"
import { FinancialTableProps } from "./types"
import { FinancialTable } from "./FinancialTable"
import { 
  generateEmptyFinancialTemplate, 
  calculateHierarchicalTotals 
} from "./schema/financial-report"
import { ReportTitleProps } from "./title-section"
import { expandAllNodes } from "./utils"

// Generate table with expanded sample data for preview/report
export function FinancialReportTable({ 
  data,
  fiscalYear = "2023",
  reportMetadata,
  healthCenters,
  selectedHealthCenter,
  isHospitalMode,
  onHealthCenterChange
}: Omit<FinancialTableProps, 'onSave'> & { reportMetadata?: ReportTitleProps }) {
  // Generate initial data if not provided
  const initialData = useMemo(() => {
    if (data) return data
    return calculateHierarchicalTotals(generateEmptyFinancialTemplate())
  }, [data])
  
  // Pre-expand all nodes for the report view
  const allExpandedRows = useMemo(() => expandAllNodes(initialData), [initialData])
  
  return (
    <FinancialTable 
      data={initialData} 
      fiscalYear={fiscalYear} 
      readOnly={true} 
      expandedRowIds={Array.from(allExpandedRows)}
      reportMetadata={reportMetadata}
      healthCenters={healthCenters}
      selectedHealthCenter={selectedHealthCenter}
      isHospitalMode={isHospitalMode}
      onHealthCenterChange={onHealthCenterChange}
    />
  )
} 