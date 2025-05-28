"use client"

import { useParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import executingData from "@/constants/executing-data.json"

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

// Loading skeleton component for the financial report
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
      
      {/* Screen reader text */}
      <div className="sr-only" aria-live="polite">
        Loading financial report data, please wait...
      </div>
    </div>
  )
}

// Error component for displaying financial report errors
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
          <h3 className="font-medium text-red-800">Failed to load execution report</h3>
          <p className="text-red-700 mt-1">{message}</p>
          <button 
            onClick={onRetry} 
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            aria-label="Try loading execution report again"
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

// Type definitions for execution data
type FinancialRow = {
  id: string;
  title: string;
  q1?: number;
  q2?: number;
  q3?: number;
  q4?: number;
  cumulativeBalance?: number;
  comments?: string;
  isCategory?: boolean;
  children?: FinancialRow[];
  isEditable?: boolean;
};

type ExecutionRecord = {
  id: string;
  facilityName: string;
  facilityType: string;
  facilityDistrict: string;
  province: string;
  program: string;
  fiscalYear: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  reportingPeriod: string;
  projectName: string;
  submittedBy?: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  financialData: {
    tableData: FinancialRow[];
    metadata: {
      healthCenter: string;
      district: string;
      project: string;
      reportingPeriod: string;
      fiscalYear: string;
    }
  }
};

const EditExecutionReport = () => {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  const [report, setReport] = useState<ExecutionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch report data based on ID
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For this demo, we'll simulate a network request using setTimeout
        setTimeout(() => {
          const typedExecutingData = executingData as ExecutionRecord[];
          const foundReport = typedExecutingData.find(record => record.id === reportId);
          
          if (!foundReport) {
            throw new Error(`Execution report with ID "${reportId}" not found`);
          }
          
          setReport(foundReport);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load report'));
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [reportId]);
  
  // Handle save data
  const handleSaveFinancialData = (data: any) => {
    // In a real app, this would send the data to an API
    console.log('Saving updated financial data:', data);
    alert('Report updated successfully!');
    router.push('/execution');
  };
  
  // Retry loading data
  const retryLoading = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the effect by changing its dependency
    setReport(null);
  };
  
  // Generate report title
  const reportTitle = report 
    ? `Edit ${report.program} Execution Report - ${report.facilityName}`
    : 'Edit Execution Report';
    
  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      return <FinancialReportSkeleton />;
    }
    
    if (error) {
      return (
        <FinancialReportError 
          message={error.message} 
          onRetry={retryLoading} 
        />
      );
    }
    
    if (!report) {
      return (
        <div className="p-4 border border-yellow-400 bg-yellow-50 rounded-md">
          <p>Report not found. Please check the report ID and try again.</p>
        </div>
      );
    }
    
    // Extract data needed for FinancialTable
    const quarter = report.reportingPeriod.includes("JULY - SEPTEMBER") ? "Q1" :
                    report.reportingPeriod.includes("OCTOBER - DECEMBER") ? "Q2" :
                    report.reportingPeriod.includes("JANUARY - MARCH") ? "Q3" :
                    report.reportingPeriod.includes("APRIL - JUNE") ? "Q4" : "";
    
    // Prepare reporting period options based on the report's fiscal year
    const reportingPeriodOptions = [
      { value: "Q1", label: "Q1 (Jul-Sep)" },
      { value: "Q2", label: "Q2 (Oct-Dec)" },
      { value: "Q3", label: "Q3 (Jan-Mar)" },
      { value: "Q4", label: "Q4 (Apr-Jun)" },
    ];
    
    // For editing, we won't allow changing health center
    const healthCenterOptions = [
      { value: report.facilityName, label: report.facilityName }
    ];
    
    const isHospitalMode = report.facilityType === "Hospital";
    
    return (
      <Suspense fallback={<FinancialReportSkeleton />}>
        <FinancialTable 
          data={report.financialData.tableData}
          fiscalYear={report.fiscalYear}
          onSave={handleSaveFinancialData}
          reportMetadata={report.financialData.metadata}
          healthCenters={healthCenterOptions}
          reportingPeriods={reportingPeriodOptions}
          selectedHealthCenter={report.facilityName}
          selectedReportingPeriod={quarter}
          isHospitalMode={isHospitalMode}
          // For edit mode, we don't want to allow changing these
          onHealthCenterChange={() => {}}
          onReportingPeriodChange={() => {}}
        />
      </Suspense>
    );
  };

  return (
    <div className="container mx-auto py-0">
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/execution')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Execution Reports
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-2">{reportTitle}</h1>
      <div className="space-y-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default EditExecutionReport;