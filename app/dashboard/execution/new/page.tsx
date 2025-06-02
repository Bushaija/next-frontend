"use client"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { useUserSession } from "@/lib/session-store";
import { Skeleton } from "@/components/ui/skeleton"
import { useFinancialReport } from "@/lib/hooks/use-financial-report";
import { AlertCircle, RefreshCw } from "lucide-react";

// Lazy load the FinancialTable component
const FinancialTable = dynamic(
  () => import("@/components/data-form/financial-table").then(mod => ({ default: mod.FinancialTable })),
  { 
    ssr: false,
    loading: () => <FinancialReportSkeleton />
  }
)

// Create a fixed-length array for skeleton rows
const SKELETON_ROWS = Array.from({ length: 8 });

// Loading skeleton component
const FinancialReportSkeleton = () => {
  return (
    <div className="space-y-6" role="status" aria-label="Loading financial report">
      {/* Header Skeleton */}
      <div className="border-b pb-4">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-6 w-3/4 mx-auto" aria-hidden="true" />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-full" aria-hidden="true" />
              <Skeleton className="h-4 w-3/4" aria-hidden="true" />
            </div>
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-full" aria-hidden="true" />
              <Skeleton className="h-4 w-3/4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Table Header Skeleton */}
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-5 w-1/4" aria-hidden="true" />
        <Skeleton className="h-5 w-20" aria-hidden="true" />
      </div>
      
      {/* Table Rows Skeleton */}
      {SKELETON_ROWS.map((_, i) => (
        <div key={i} className="grid grid-cols-5 gap-4 py-2 border-b">
          <Skeleton className="h-4 col-span-2" aria-hidden="true" />
          <Skeleton className="h-4" aria-hidden="true" />
          <Skeleton className="h-4" aria-hidden="true" />
          <Skeleton className="h-4" aria-hidden="true" />
        </div>
      ))}
      
      {/* Footer Skeleton */}
      <div className="mt-4 flex justify-end">
        <Skeleton className="h-10 w-32" aria-hidden="true" />
      </div>
      
      <div className="sr-only" aria-live="polite">
        Loading financial report data, please wait...
      </div>
    </div>
  )
}

// Error component
const FinancialReportError = ({ message, onRetry }: { message: string, onRetry: () => void }) => {
  return (
    <div 
      className="p-6 border border-red-200 bg-red-50 rounded-md" 
      role="alert" 
      aria-live="assertive"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800">Failed to load financial report</h3>
          <p className="text-red-700 mt-1">{message}</p>
          <button 
            onClick={onRetry} 
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            aria-label="Try loading financial report again"
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

const ExecutionReport = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hospital, district, program: defaultProgram, facilities = [] } = useUserSession();
  
  // Get all parameters from URL with default values
  const facilityName = searchParams.get('facilityName') || hospital || 'Butaro';
  const facilityType = searchParams.get('facilityType') || 'hospital';
  const facilityDistrict = searchParams.get('district') || district || 'Butaro';
  const programName = searchParams.get('program') || defaultProgram || "HIV";
  const fiscalYear = searchParams.get('fiscalYear') || '2023-2024';
  
  // Function to update URL parameters
  const updateUrlParams = (params: Record<string, string>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    // Update each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });
    
    // Create new URL with updated parameters
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`);
  };
  
  // Use the custom financial report hook
  const {
    financialData,
    loadingState,
    error,
    selectedHealthCenter,
    reportingPeriodOptions,
    healthCenterOptions,
    isHospitalMode,
    reportMetadata,
    setSelectedHealthCenter,
    setReportingPeriod,
    handleSaveFinancialData,
    retry
  } = useFinancialReport({
    programName,
    facilities: Array.isArray(facilities) ? facilities.filter(f => typeof f === 'string') as string[] : [],
    hospital: typeof facilityName === 'string' ? facilityName : undefined,
    district: typeof facilityDistrict === 'string' ? facilityDistrict : undefined
  });
  
  // Handle facility selection change
  const handleFacilityChange = (value: string) => {
    setSelectedHealthCenter(value);
    updateUrlParams({ facilityName: value });
  };
  
  // Handle program change
  const handleProgramChange = (value: string) => {
    updateUrlParams({ program: value });
  };

  // Handle fiscal year change
  const handleFiscalYearChange = (value: string) => {
    updateUrlParams({ fiscalYear: value });
  };
  
  // Generate dynamic report title
  const reportTitle = facilityName && fiscalYear
    ? `${programName} New Execution Report - ${facilityName} ${facilityType} (${fiscalYear})`
    : `${programName} New Execution Report`;

  // Check if we have the required parameters to display the report
  const canShowReport = !!facilityName && !!programName && !!fiscalYear;

  // Render the appropriate UI based on loading state
  const renderContent = () => {
    if (!canShowReport) {
      return (
        <div 
          className="p-4 border border-yellow-400 bg-yellow-50 rounded-md"
          role="alert"
          aria-labelledby="parameters-required"
        >
          <p id="parameters-required">
            Please provide the required parameters (facility name, program, and fiscal year) to view this report.
            You can add them to the URL as query parameters.
          </p>
        </div>
      );
    }

    switch (loadingState) {
      case 'loading':
      case 'idle':
        return <FinancialReportSkeleton />;
      case 'error':
        return (
          <FinancialReportError 
            message={error?.message || "An unexpected error occurred."} 
            onRetry={retry} 
          />
        );
      case 'success':
        return (
          <Suspense fallback={<FinancialReportSkeleton />}>
            <FinancialTable 
              data={financialData}
              onSave={handleSaveFinancialData}
              reportMetadata={{
                ...reportMetadata,
                program: programName,
                fiscalYear,
                healthCenter: facilityName,
                district: facilityDistrict,
                project: reportMetadata?.project || ''
              }}
              healthCenters={healthCenterOptions}
              reportingPeriods={reportingPeriodOptions}
              selectedHealthCenter={selectedHealthCenter}
              selectedReportingPeriod={reportingPeriodOptions[0]?.value}
              isHospitalMode={isHospitalMode}
              onHealthCenterChange={handleFacilityChange}
              onReportingPeriodChange={setReportingPeriod}
              onProgramChange={handleProgramChange}
              onFiscalYearChange={handleFiscalYearChange}
              programName={programName}
              fiscalYear={fiscalYear}
            />
          </Suspense>
        );
      default:
        return <FinancialReportSkeleton />;
    }
  };

  return (
    <div className="container mx-auto py-0">
      <h1 className="text-2xl font-bold mb-2">{reportTitle}</h1>
      <div className="space-y-8">
        {renderContent()}
      </div>
    </div>
  );
}

export default ExecutionReport