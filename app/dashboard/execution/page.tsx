'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Activity,
  AlertTriangle,
  Clock,
  PlayCircle,
  FileText,
  Download,
  Eye,
  Edit,
} from 'lucide-react';

// Types
interface ApprovedPlan {
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
  status: 'approved';
  createdBy: string;
  submittedBy: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  canExecute: boolean;
  hasActiveExecution: boolean;
  activitiesCount: number;
  lastExecutionDate: string | null;
}

interface ExecutedActivity {
  id: string;
  executionId: string;
  planId: string;
  facilityName: string;
  facilityType: string;
  district: string;
  province: string;
  period: string;
  program: string;
  isHospital: boolean;
  plannedBudget: string;
  executedBudget: string;
  variance: string;
  variancePercentage: number;
  status: 'completed' | 'in-progress' | 'pending-review';
  executedBy: string;
  executedAt: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  activitiesCount: number;
  completedActivities: number;
}

// API functions
const fetchApprovedPlans = async (filters: {
  facilityType?: string;
  district?: string;
  province?: string;
  program?: string;
  period?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: ApprovedPlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const url = `/api/execution?${searchParams.toString()}`;
  console.log('🌐 Fetching approved plans from:', url);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch approved plans'}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API returned error');
    }
    
    return result;
  } catch (error) {
    console.error('💥 Fetch error:', error);
    throw error;
  }
};

const fetchExecutedActivities = async (filters: {
  facilityType?: string;
  district?: string;
  province?: string;
  program?: string;
  period?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: ExecutedActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const searchParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const url = `/api/execution/executed?${searchParams.toString()}`;
  console.log('🌐 Fetching executed activities from:', url);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch executed activities'}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'API returned error');
    }
    
    return result;
  } catch (error) {
    console.error('💥 Fetch error:', error);
    throw error;
  }
};

export default function ExecutionDashboard() {
  const router = useRouter();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('planned');
  
  // Filters state for planned activities
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('FY 2027');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filters state for executed activities
  const [executedProgramFilter, setExecutedProgramFilter] = useState<string>('all');
  const [executedFacilityTypeFilter, setExecutedFacilityTypeFilter] = useState<string>('all');
  const [executedPeriodFilter, setExecutedPeriodFilter] = useState<string>('FY 2027');
  const [executedDistrictFilter, setExecutedDistrictFilter] = useState<string>('all');
  const [executedStatusFilter, setExecutedStatusFilter] = useState<string>('all');
  const [executedSearchTerm, setExecutedSearchTerm] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [executedCurrentPage, setExecutedCurrentPage] = useState(1);
  const pageSize = 10;

  // Build filters for API calls
  const apiFilters = {
    ...(programFilter !== 'all' && { program: programFilter }),
    ...(facilityTypeFilter !== 'all' && { facilityType: facilityTypeFilter }),
    ...(periodFilter !== 'all' && { period: periodFilter }),
    ...(districtFilter !== 'all' && { district: districtFilter }),
    page: currentPage,
    limit: pageSize,
  };

  const executedApiFilters = {
    ...(executedProgramFilter !== 'all' && { program: executedProgramFilter }),
    ...(executedFacilityTypeFilter !== 'all' && { facilityType: executedFacilityTypeFilter }),
    ...(executedPeriodFilter !== 'all' && { period: executedPeriodFilter }),
    ...(executedDistrictFilter !== 'all' && { district: executedDistrictFilter }),
    ...(executedStatusFilter !== 'all' && { status: executedStatusFilter }),
    page: executedCurrentPage,
    limit: pageSize,
  };

  // Fetch approved plans
  const {
    data: plansResponse,
    isLoading: isLoadingPlans,
    error: plansError,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ['approved-plans', apiFilters],
    queryFn: () => fetchApprovedPlans(apiFilters),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch executed activities
  const {
    data: executedResponse,
    isLoading: isLoadingExecuted,
    error: executedError,
    refetch: refetchExecuted,
  } = useQuery({
    queryKey: ['executed-activities', executedApiFilters],
    queryFn: () => fetchExecutedActivities(executedApiFilters),
    staleTime: 2 * 60 * 1000,
    enabled: activeTab === 'executed',
  });

  // Filter plans by search term
  const filteredPlans = plansResponse?.data?.filter((plan) =>
    plan.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.planId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.program.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Filter executed activities by search term
  const filteredExecuted = executedResponse?.data?.filter((activity) =>
    activity.facilityName.toLowerCase().includes(executedSearchTerm.toLowerCase()) ||
    activity.planId.toLowerCase().includes(executedSearchTerm.toLowerCase()) ||
    activity.program.toLowerCase().includes(executedSearchTerm.toLowerCase())
  ) || [];

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

  const getVarianceColor = (percentage: number) => {
    if (percentage > 10) return 'text-red-600';
    if (percentage > 5) return 'text-amber-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case 'pending-review':
        return <Badge className="bg-amber-100 text-amber-700">Pending Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSelectPlan = (plan: ApprovedPlan) => {
    if (!plan.canExecute) {
      toast.error('This plan already has an active execution');
      return;
    }

    router.push(`/dashboard/execution/new/${plan.id}`);
  };

  const handleViewExecution = (execution: ExecutedActivity) => {
    router.push(`/dashboard/execution/view/${execution.executionId}`);
  };

  const handleEditExecution = (execution: ExecutedActivity) => {
    router.push(`/dashboard/execution/edit/${execution.executionId}`);
  };

  const handleExportReport = (execution: ExecutedActivity) => {
    // TODO: Implement export functionality
    toast.success('Export functionality coming soon');
  };

  const resetPlannedFilters = () => {
    setProgramFilter('all');
    setFacilityTypeFilter('all');
    setPeriodFilter('FY 2027');
    setDistrictFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const resetExecutedFilters = () => {
    setExecutedProgramFilter('all');
    setExecutedFacilityTypeFilter('all');
    setExecutedPeriodFilter('FY 2027');
    setExecutedDistrictFilter('all');
    setExecutedStatusFilter('all');
    setExecutedSearchTerm('');
    setExecutedCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Execution Management</h1>
            <p className="text-muted-foreground">
              Manage planned activities and track executed activities
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="planned" className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Planned Activities
          </TabsTrigger>
          <TabsTrigger value="executed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Executed Activities
          </TabsTrigger>
        </TabsList>

        {/* Planned Activities Tab */}
        <TabsContent value="planned" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => refetchPlans()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={resetPlannedFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>

          {/* Filters for Planned Activities */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filter Approved Plans</CardTitle>
              <CardDescription>
                Filter plans by program, facility type, and location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    <SelectItem value="HIV">HIV</SelectItem>
                    <SelectItem value="TB">TB</SelectItem>
                    <SelectItem value="Malaria">Malaria</SelectItem>
                    <SelectItem value="Maternal Health">Maternal Health</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={facilityTypeFilter} onValueChange={setFacilityTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Facility type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hospital">Hospitals</SelectItem>
                    <SelectItem value="health-center">Health Centers</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fiscal period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="FY 2027">FY 2027</SelectItem>
                    <SelectItem value="FY 2026">FY 2026</SelectItem>
                    <SelectItem value="FY 2025">FY 2025</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={districtFilter} onValueChange={setDistrictFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Kigali">Kigali</SelectItem>
                    <SelectItem value="Kayonza">Kayonza</SelectItem>
                    <SelectItem value="Burera">Burera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by facility name, plan ID, or program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Planned Activities Results */}
          {isLoadingPlans ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <Skeleton className="h-8 w-[100px]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : plansError ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load approved plans: {plansError instanceof Error ? plansError.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <PlayCircle className="mr-2 h-5 w-5 text-blue-500" />
                  Approved Plans Available for Execution
                </CardTitle>
                <CardDescription>
                  {filteredPlans.length} of {plansResponse?.pagination.total || 0} approved plans shown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredPlans.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <PlayCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No approved plans found</h3>
                    <p>Try adjusting your filters or check back later for new approved plans.</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan Details</TableHead>
                          <TableHead>Facility</TableHead>
                          <TableHead>Program & Period</TableHead>
                          <TableHead>Budget</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPlans.map((plan) => (
                          <TableRow key={plan.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{plan.planId}</div>
                                <div className="text-sm text-muted-foreground">
                                  Submitted {formatDate(plan.submittedAt)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {plan.isHospital ? (
                                  <Building2 className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <MapPin className="h-4 w-4 text-green-500" />
                                )}
                                <div>
                                  <div className="font-medium">{plan.facilityName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {plan.district}, {plan.province}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  {plan.program}
                                </Badge>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {plan.period}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4 text-green-500" />
                                <span className="font-medium">
                                  {formatCurrency(plan.generalTotalBudget)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center mt-1">
                                <Activity className="mr-1 h-3 w-3" />
                                {plan.activitiesCount} activities
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge className="bg-green-100 text-green-700">
                                  Approved
                                </Badge>
                                {plan.hasActiveExecution && (
                                  <div className="flex items-center text-amber-600">
                                    <Clock className="mr-1 h-3 w-3" />
                                    <span className="text-xs">Has execution</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => handleSelectPlan(plan)}
                                disabled={!plan.canExecute}
                              >
                                Select
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Executed Activities Tab */}
        <TabsContent value="executed" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => refetchExecuted()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={resetExecutedFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>

          {/* Filters for Executed Activities */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Filter Executed Activities</CardTitle>
              <CardDescription>
                Filter executed activities by program, facility type, location, and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <Select value={executedProgramFilter} onValueChange={setExecutedProgramFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    <SelectItem value="HIV">HIV</SelectItem>
                    <SelectItem value="TB">TB</SelectItem>
                    <SelectItem value="Malaria">Malaria</SelectItem>
                    <SelectItem value="Maternal Health">Maternal Health</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={executedFacilityTypeFilter} onValueChange={setExecutedFacilityTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Facility type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hospital">Hospitals</SelectItem>
                    <SelectItem value="health-center">Health Centers</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={executedPeriodFilter} onValueChange={setExecutedPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Fiscal period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="FY 2027">FY 2027</SelectItem>
                    <SelectItem value="FY 2026">FY 2026</SelectItem>
                    <SelectItem value="FY 2025">FY 2025</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={executedDistrictFilter} onValueChange={setExecutedDistrictFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    <SelectItem value="Kigali">Kigali</SelectItem>
                    <SelectItem value="Kayonza">Kayonza</SelectItem>
                    <SelectItem value="Burera">Burera</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={executedStatusFilter} onValueChange={setExecutedStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending-review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by facility name, execution ID, or program..."
                  value={executedSearchTerm}
                  onChange={(e) => setExecutedSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Executed Activities Results */}
          {isLoadingExecuted ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <Skeleton className="h-8 w-[100px]" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : executedError ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load executed activities: {executedError instanceof Error ? executedError.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  Executed Activities
                </CardTitle>
                <CardDescription>
                  {filteredExecuted.length} of {executedResponse?.pagination.total || 0} executed activities shown
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredExecuted.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No executed activities found</h3>
                    <p>Try adjusting your filters or check back later for executed activities.</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Execution Details</TableHead>
                          <TableHead>Facility</TableHead>
                          <TableHead>Program & Period</TableHead>
                          <TableHead>Budget Performance</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExecuted.map((execution) => (
                          <TableRow key={execution.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium">{execution.executionId}</div>
                                <div className="text-sm text-muted-foreground">
                                  Plan: {execution.planId}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Executed {formatDate(execution.executedAt)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {execution.isHospital ? (
                                  <Building2 className="h-4 w-4 text-blue-500" />
                                ) : (
                                  <MapPin className="h-4 w-4 text-green-500" />
                                )}
                                <div>
                                  <div className="font-medium">{execution.facilityName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {execution.district}, {execution.province}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  {execution.program}
                                </Badge>
                                <div className="text-sm text-muted-foreground flex items-center">
                                  <Calendar className="mr-1 h-3 w-3" />
                                  {execution.period}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Planned:</span> {formatCurrency(execution.plannedBudget)}
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Executed:</span> {formatCurrency(execution.executedBudget)}
                                </div>
                                <div className={`text-sm font-medium ${getVarianceColor(execution.variancePercentage)}`}>
                                  {execution.variancePercentage > 0 ? '+' : ''}{execution.variancePercentage.toFixed(1)}% variance
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Activity className="mr-1 h-3 w-3" />
                                  {execution.completedActivities}/{execution.activitiesCount} activities
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {((execution.completedActivities / execution.activitiesCount) * 100).toFixed(0)}% complete
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(execution.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewExecution(execution)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditExecution(execution)}
                                  disabled={execution.status === 'completed'}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExportReport(execution)}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 