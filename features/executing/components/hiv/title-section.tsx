"use client"

import { useMemo } from "react"

// Import shared constants
import { 
  PROJECT_DISPLAY_NAMES,
  PERIOD_END_DATES
} from "@/features/executing/schema/financial-report"

// Type for the component props
export type ReportTitleProps = {
  reportType?: string
  reportingPeriod: string
  healthCenter: string
  district: string
  project: string
  customDate?: string
  facilityType?: string
}

/**
 * Extracts the end date from a reporting period string
 */
const getEndOfQuarter = (period: string): string => {
  return PERIOD_END_DATES[period] || "Unknown"
}

/**
 * Report title component that displays the report type and date
 */
export function ReportTitle({ 
  reportType,
  // reportType = "FINANCIAL REPORT", 
  reportingPeriod,
  healthCenter,
  district,
  project,
  customDate,
  facilityType = "Health Center"
}: ReportTitleProps) {
  // Calculate the report date based on the reporting period or use the custom date
  const reportDate = useMemo(() => {
    if (customDate) return customDate
    return getEndOfQuarter(reportingPeriod)
  }, [reportingPeriod, customDate])

  // Normalize the project name for consistent display
  const displayProjectName = useMemo(() => {
    console.log("Raw project name received:", project)
    
    // Look for exact match first
    if (project in PROJECT_DISPLAY_NAMES) {
      return PROJECT_DISPLAY_NAMES[project]
    }
    
    // Try case-insensitive match
    for (const key of Object.keys(PROJECT_DISPLAY_NAMES)) {
      if (key.toLowerCase() === project.toLowerCase()) {
        return PROJECT_DISPLAY_NAMES[key]
      }
    }
    
    // Default to the original if no match found
    return project
  }, [project])

  return (
    <div className="pb-4 text-center border-b border-gray-200">
      {/* <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wide mb-4">
        {reportType} AS AT {reportDate}
      </h2> */}
      
      <div className="flex flex-col justify-start items-start">
        <div className="">
          <span className="font-bold">{facilityType}:</span> {healthCenter}
        </div>
        <div className="">
          <span className="font-bold">District:</span> {district}
        </div>
      </div>
      
      <div className="flex flex-col justify-start items-start">
        <div className="">
          <span className="font-bold">Project:</span> {displayProjectName}
        </div>
        <div className="">
          <span className="font-bold">Reporting Period:</span> {reportingPeriod}
        </div>
      </div>
    </div>
  )
}

/**
 * Standalone function to get end date of a reporting period
 * Can be used outside of the component
 */
export { getEndOfQuarter }
