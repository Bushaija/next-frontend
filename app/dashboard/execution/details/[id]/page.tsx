"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Edit, FileText, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import executingData from "@/constants/executing-data.json"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

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

// Create a fixed-length array for skeleton rows
const SKELETON_ROWS = Array.from({ length: 5 });

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
      
      {/* Tabs Skeleton */}
      <Skeleton className="h-9 w-64 rounded-md" aria-hidden="true" />
      
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

const ExecutionReportDetails = () => {
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
  
  // Retry loading data
  const retryLoading = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the effect by changing its dependency
    setReport(null);
  };
  
  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, label: string }> = {
      'approved': { color: 'bg-green-100 text-green-800', label: 'Approved' },
      'pending_approval': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
      'submitted': { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
      'draft': { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <Badge className={`${statusInfo.color} border-0`}>
        {statusInfo.label}
      </Badge>
    );
  };
  
  // Calculate totals
  const calculateTotals = (data: FinancialRow[]) => {
    // Find receipt and expenditure categories
    const receiptsRow = data.find(row => row.id === 'a');
    const expendituresRow = data.find(row => row.id === 'b');
    
    const totalReceipts = receiptsRow?.cumulativeBalance || 0;
    const totalExpenditures = expendituresRow?.cumulativeBalance || 0;
    const balance = totalReceipts - totalExpenditures;
    
    return {
      totalReceipts,
      totalExpenditures,
      balance,
      utilizationRate: totalReceipts > 0 ? (totalExpenditures / totalReceipts) * 100 : 0
    };
  };
  
  // Generate detailed rows for table display
  const generateDetailedRows = (rows: FinancialRow[] = [], level = 0): React.ReactNode[] => {
    return rows.flatMap(row => {
      const hasChildren = row.children && row.children.length > 0;
      
      const currentRow = (
        <TableRow key={row.id} className={row.isCategory ? 'bg-muted/50 font-medium' : ''}>
          <TableCell className="px-4" style={{ paddingLeft: `${level * 20 + 16}px` }}>
            {row.title}
          </TableCell>
          <TableCell className="text-right">{formatCurrency(row.q1)}</TableCell>
          <TableCell className="text-right">{formatCurrency(row.q2)}</TableCell>
          <TableCell className="text-right">{formatCurrency(row.q3)}</TableCell>
          <TableCell className="text-right">{formatCurrency(row.q4)}</TableCell>
          <TableCell className="text-right font-medium">{formatCurrency(row.cumulativeBalance)}</TableCell>
        </TableRow>
      );
      
      if (hasChildren) {
        return [currentRow, ...generateDetailedRows(row.children, level + 1)];
      }
      
      return currentRow;
    });
  };
  
  // Generate report title
  const reportTitle = report 
    ? `${report.program} Financial Report - ${report.facilityName}`
    : 'Financial Report Details';
    
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
    
    // Calculate financial totals
    const totals = calculateTotals(report.financialData.tableData);
    
    return (
      <div className="space-y-6">
        {/* Report Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Facility Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Facility Name:</dt>
                  <dd>{report.facilityName}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Facility Type:</dt>
                  <dd>{report.facilityType}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">District:</dt>
                  <dd>{report.facilityDistrict}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Province:</dt>
                  <dd>{report.province}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Program:</dt>
                  <dd>{report.program}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Report Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-2 text-sm">
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Report Status:</dt>
                  <dd>{getStatusBadge(report.status)}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Reporting Period:</dt>
                  <dd>{report.reportingPeriod}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Fiscal Year:</dt>
                  <dd>{report.fiscalYear}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Last Updated:</dt>
                  <dd>{formatDate(report.updatedAt)}</dd>
                </div>
                <div className="grid grid-cols-2">
                  <dt className="font-medium">Project Name:</dt>
                  <dd>{report.projectName}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
        
        {/* Financial Summary */}
        <Card className="bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Overview of receipts, expenditures and balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardDescription>Total Receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(totals.totalReceipts)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardDescription>Total Expenditures</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(totals.totalExpenditures)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardDescription>Current Balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totals.balance)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-4">
                  <CardDescription>Utilization Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {totals.utilizationRate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Financial Report */}
        <Tabs defaultValue="statements" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="statements">Financial Statements</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="statements" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Detailed Financial Statement</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of all financial activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%]">Item</TableHead>
                        <TableHead className="text-right">Q1</TableHead>
                        <TableHead className="text-right">Q2</TableHead>
                        <TableHead className="text-right">Q3</TableHead>
                        <TableHead className="text-right">Q4</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generateDetailedRows(report.financialData.tableData)}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={5}>Balance</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(totals.balance)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="quarterly" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Quarterly Analysis</CardTitle>
                <CardDescription>
                  Breakdown of receipts and expenditures by quarter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Q1</TableHead>
                        <TableHead className="text-right">Q2</TableHead>
                        <TableHead className="text-right">Q3</TableHead>
                        <TableHead className="text-right">Q4</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.financialData.tableData.filter(row => row.isCategory).map(category => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.title}</TableCell>
                          <TableCell className="text-right">{formatCurrency(category.q1)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(category.q2)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(category.q3)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(category.q4)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(category.cumulativeBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell>Net Balance</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((report.financialData.tableData[0]?.q1 || 0) - (report.financialData.tableData[1]?.q1 || 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((report.financialData.tableData[0]?.q2 || 0) - (report.financialData.tableData[1]?.q2 || 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((report.financialData.tableData[0]?.q3 || 0) - (report.financialData.tableData[1]?.q3 || 0))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency((report.financialData.tableData[0]?.q4 || 0) - (report.financialData.tableData[1]?.q4 || 0))}
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(totals.balance)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-0">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/execution')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Execution Reports
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => alert('Export to PDF functionality would go here')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Export as PDF
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => router.push(`/dashboard/execution/edit/${reportId}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Report
          </Button>
        </div>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">{reportTitle}</h1>
      
      <div className="space-y-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default ExecutionReportDetails;