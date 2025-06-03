"use client"

import { useRouter, useParams } from "next/navigation"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { useQuery } from "@tanstack/react-query"
import { useUserSession } from "@/lib/session-store";
import { Skeleton } from "@/components/ui/skeleton"
import { useFinancialReport } from "@/lib/hooks/use-financial-report";
import { AlertCircle, RefreshCw, ArrowLeft, FileText, Building2, MapPin, Calendar, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

// Types for plan data
interface Plan {
  id: string;
  planId: string;
  facilityName: string;
  facilityType: string;
  district: string;
  province: string;
  period: string;
  program: string;
  isHospital: boolean;
  generalTotalBudget: string;
  status: string;
  createdBy: string;
  submittedBy: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

// API function to fetch plan details
const fetchPlanDetails = async (planId: string): Promise<Plan> => {
  console.log('🔍 Fetching plan details for execution:', planId);
  
  try {
    const response = await fetch(`/api/plan/${planId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch plan details'}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API returned error');
    }
    
    return result.data;
  } catch (error) {
    console.error('💥 Fetch plan details error:', error);
    throw error;
  }
};

// Loading skeleton component
const FinancialReportSkeleton = () => {
  return (
    <div className="space-y-6" role="status" aria-label="Loading execution form">
      {/* Header Skeleton */}
      <div className="border-b pb-4">
        <div className="flex flex-col space-y-4">
          <Skeleton className="h-8 w-3/4" aria-hidden="true" />
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
      
      {/* Table Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/4" aria-hidden="true" />
        {SKELETON_ROWS.map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 py-2 border-b">
            <Skeleton className="h-4 col-span-2" aria-hidden="true" />
            <Skeleton className="h-4" aria-hidden="true" />
            <Skeleton className="h-4" aria-hidden="true" />
            <Skeleton className="h-4" aria-hidden="true" />
          </div>
        ))}
      </div>
      
      <div className="sr-only" aria-live="polite">
        Loading execution form, please wait...
      </div>
    </div>
  )
}

// Error component
const ExecutionError = ({ message, onRetry, onGoBack }: { message: string, onRetry: () => void, onGoBack: () => void }) => {
  return (
    <div 
      className="p-6 border border-red-200 bg-red-50 rounded-md" 
      role="alert" 
      aria-live="assertive"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800">Failed to load execution form</h3>
          <p className="text-red-700 mt-1">{message}</p>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={onRetry} 
              className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label="Try loading execution form again"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
            <Button variant="outline" onClick={onGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExecutionReport = () => {
  const router = useRouter();
  const params = useParams();
  const planId = params.planId as string;
  const { hospital, district, program: defaultProgram, facilities = [] } = useUserSession();

  // Fetch plan details for execution
  const {
    data: plan,
    isLoading: isLoadingPlan,
    error: planError,
    refetch: refetchPlan,
  } = useQuery({
    queryKey: ['plan-details', planId],
    queryFn: () => fetchPlanDetails(planId),
    enabled: !!planId,
  });

  // Use the custom financial report hook with plan data
  const {
    financialData,
    loadingState,
    error,
    healthCenterOptions,
    reportMetadata,
    setSelectedHealthCenter,
    handleSaveFinancialData,
    retry
  } = useFinancialReport({
    programName: plan?.program || defaultProgram || "HIV",
    facilities: Array.isArray(facilities) ? facilities.filter(f => typeof f === 'string') as string[] : [],
    hospital: plan?.facilityName || hospital,
    district: plan?.district || district
  });

  // Helper functions
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(numAmount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle facility selection change
  const handleFacilityChange = (value: string) => {
    setSelectedHealthCenter(value);
  };

  // Handle going back to plan selection
  const handleGoBack = () => {
    router.push('/dashboard/execution');
  };

  // Loading state for plan
  if (isLoadingPlan) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <FinancialReportSkeleton />
      </div>
    );
  }

  // Error state for plan
  if (planError || !plan) {
    return (
      <div className="p-6">
        <ExecutionError 
          message={planError instanceof Error ? planError.message : 'Plan not found'} 
          onRetry={refetchPlan}
          onGoBack={handleGoBack}
        />
      </div>
    );
  }

  // Generate report title
  const reportTitle = plan ? `${plan.program} Execution - ${plan.facilityName} (${plan.period})` : 'Execution Tracking';

  // Render the financial tracking form
  const renderContent = () => {
    switch (loadingState) {
      case 'loading':
      case 'idle':
        return <FinancialReportSkeleton />;
      case 'error':
        return (
          <ExecutionError 
            message={error?.message || "An unexpected error occurred."} 
            onRetry={retry}
            onGoBack={handleGoBack}
          />
        );
      case 'success':
        return (
          <Suspense fallback={<FinancialReportSkeleton />}>
            <FinancialTable 
              data={financialData}
              fiscalYear={plan.period}
              onSave={handleSaveFinancialData}
              reportMetadata={{
                ...reportMetadata,
                program: plan.program,
                fiscalYear: plan.period,
                healthCenter: plan.facilityName,
                district: plan.district,
                project: reportMetadata?.project || plan.planId
              }}
              healthCenters={healthCenterOptions}
              selectedHealthCenter={plan.facilityName ?? ''}
              isHospitalMode={plan.isHospital ?? false}
              onHealthCenterChange={handleFacilityChange}
              programName={plan.program}
            />
          </Suspense>
        );
      default:
        return <FinancialReportSkeleton />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Execution Tracking</h1>
            <p className="text-muted-foreground">
              Record actual financial transactions for plan execution
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {reportTitle}
            </p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700">
          {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
        </Badge>
      </div>

      {/* Financial Tracking Form with Integrated Plan Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Financial Transaction Recording
          </CardTitle>
          <CardDescription>
            Record actual receipts and expenditures to track execution against planned budget
          </CardDescription>
          
          {/* Integrated Plan Context */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                {plan.isHospital ? (
                  <Building2 className="h-4 w-4 text-blue-500" />
                ) : (
                  <MapPin className="h-4 w-4 text-green-500" />
                )}
                <div>
                  <p className="text-muted-foreground">Facility</p>
                  <p className="font-medium">{plan.facilityName}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.district}, {plan.province}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-muted-foreground">Program & Period</p>
                  <p className="font-medium">{plan.program}</p>
                  <p className="text-xs text-muted-foreground">{plan.period}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-muted-foreground">Planned Budget</p>
                  <p className="font-medium">{formatCurrency(plan.generalTotalBudget)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-muted-foreground">Plan ID</p>
                  <p className="font-medium">{plan.planId}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDate(plan.submittedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}

export default ExecutionReport