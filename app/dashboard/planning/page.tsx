'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { 
  CheckCircle2, 
  Clock, 
  Edit, 
  Eye, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  RefreshCw, 
  Search,
  Trash2,
  AlertCircle,
  Building2,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import facilitiesData from '@/constants/facilities-data.json';

// Types for our data
interface Plan {
  id: string;
  planId: string;
  facilityName: string;
  facilityType: string;
  district: string;
  province: string;
  period: string;
  program: string;
  generalTotalBudget: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  submittedBy?: string;
}

interface FacilityStatus {
  facilityName: string;
  facilityType: 'hospital' | 'health-center';
  hasCurrentPlan: boolean;
  currentPlan?: Plan;
  lastPlanDate?: string;
  status: 'planned' | 'awaiting' | 'overdue';
  district: string;
  province: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  province: string;
  district: string;
  hospital: string;
}

// Simulated user data - in real app this would come from auth context
const getCurrentUser = (): User | null => {
  try {
    if (typeof window === 'undefined') return null;
    const userDataString = localStorage.getItem('user');
    if (!userDataString) return null;
    return JSON.parse(userDataString) as User;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// API functions
const fetchPlans = async (filters: {
  facilityType?: string;
  district?: string;
  province?: string;
  period?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: Plan[];
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

  const url = `/api/plan?${searchParams.toString()}`;
  console.log('🌐 Fetching plans from:', url);
  console.log('🔍 Filters being sent:', filters);

  try {
    const response = await fetch(url);
    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error text:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('✅ Response data:', result);
    
    if (!result.success) {
      console.error('❌ API returned error:', result.message);
      throw new Error(result.message || 'API returned error');
    }
    
    console.log('📊 Plans fetched successfully:', result.data.length, 'plans');
    return result;
  } catch (error) {
    console.error('💥 Fetch error:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check if the server is running.');
    }
    throw error;
  }
};

const deletePlan = async (planId: string): Promise<void> => {
  const response = await fetch(`/api/plan/${planId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete plan');
  }
};

export default function PlanningPage() {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState('FY 2027');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Set user on mount
  React.useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/sign-in');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  // Fetch plans with filters
  const {
    data: plansResponse,
    isLoading: isLoadingPlans,
    error: plansError,
    refetch: refetchPlans
  } = useQuery({
    queryKey: ['plans', { 
      province: currentUser?.province,
      district: currentUser?.district,
      period: currentPeriod,
      status: statusFilter === 'all' ? undefined : statusFilter,
      facilityType: facilityTypeFilter === 'all' ? undefined : facilityTypeFilter,
      page: 1,
      limit: 10
    }],
    queryFn: () => fetchPlans({
      province: currentUser?.province,
      district: currentUser?.district,
      period: currentPeriod,
      status: statusFilter === 'all' ? undefined : statusFilter,
      facilityType: facilityTypeFilter === 'all' ? undefined : facilityTypeFilter,
      page: 1,
      limit: 10
    }),
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get all facilities in user's area
  const allFacilities = useMemo(() => {
    if (!currentUser) return [];
    
    const userHospital = currentUser.hospital.toLowerCase().trim();
    const facilities: FacilityStatus[] = [];
    
    facilitiesData.forEach((facilityGroup: { hospitals: string[]; 'health-centers': string[] }) => {
      const hospitalExists = facilityGroup.hospitals.some(
        (h: string) => h.toLowerCase().trim() === userHospital
      );
      
      if (hospitalExists) {
        // Add the hospital itself
        facilities.push({
          facilityName: currentUser.hospital,
          facilityType: 'hospital',
          hasCurrentPlan: false,
          status: 'awaiting',
          district: currentUser.district,
          province: currentUser.province,
        });
        
        // Add health centers
        facilityGroup['health-centers'].forEach((center: string) => {
          facilities.push({
            facilityName: center,
            facilityType: 'health-center',
            hasCurrentPlan: false,
            status: 'awaiting',
            district: currentUser.district,
            province: currentUser.province,
          });
        });
      }
    });
    
    return facilities;
  }, [currentUser]);

  // Merge facilities with plan data
  const facilitiesWithStatus = useMemo(() => {
    if (!allFacilities.length || !plansResponse) return [];
    
    const plansByFacility = new Map<string, Plan>();
    plansResponse.data.forEach(plan => {
      const facilityKey = plan.facilityName.toLowerCase().trim();
      plansByFacility.set(facilityKey, plan);
    });
    
    return allFacilities.map(facility => {
      const facilityKey = facility.facilityName.toLowerCase().trim();
      const plan = plansByFacility.get(facilityKey);
      
      if (plan) {
        return {
          ...facility,
          hasCurrentPlan: true,
          currentPlan: plan,
          lastPlanDate: plan.updatedAt,
          status: 'planned' as const,
        };
      }
      
      return facility;
    }).filter(facility => {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!facility.facilityName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      // Apply facility type filter
      if (facilityTypeFilter !== 'all') {
        if (facility.facilityType !== facilityTypeFilter) {
          return false;
        }
      }
      
      return true;
    });
  }, [allFacilities, plansResponse, searchTerm, facilityTypeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = facilitiesWithStatus.length;
    const planned = facilitiesWithStatus.filter(f => f.hasCurrentPlan).length;
    const awaiting = total - planned;
    const hospitals = facilitiesWithStatus.filter(f => f.facilityType === 'hospital').length;
    const healthCenters = facilitiesWithStatus.filter(f => f.facilityType === 'health-center').length;
    
    return { total, planned, awaiting, hospitals, healthCenters };
  }, [facilitiesWithStatus]);

  // Handle delete action
  const handleDelete = async (planId: string, facilityName: string) => {
    if (!confirm(`Are you sure you want to delete the plan for ${facilityName}?`)) {
      return;
    }
    
    try {
      await deletePlan(planId);
      toast.success('Plan deleted successfully');
      refetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete plan');
    }
  };

  // Status badge component
  const StatusBadge = ({ hasCurrentPlan }: { 
    hasCurrentPlan: boolean;
  }) => {
    if (!hasCurrentPlan) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
          <Clock className="mr-1 h-3 w-3" />
          Awaiting Plan
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="bg-green-100 text-green-700">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Plan Created
      </Badge>
    );
  };

  // Plan status badge
  const PlanStatusBadge = ({ status }: { status: Plan['status'] }) => {
    const variants = {
      draft: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-700' },
      pending: { variant: 'default' as const, className: 'bg-yellow-100 text-yellow-700' },
      approved: { variant: 'default' as const, className: 'bg-green-100 text-green-700' },
      rejected: { variant: 'destructive' as const, className: 'bg-red-100 text-red-700' },
    };
    
    return (
      <Badge {...variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Table columns
  const columns: ColumnDef<FacilityStatus>[] = [
    {
      accessorKey: 'facilityName',
      header: 'Facility',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {row.original.facilityType === 'hospital' ? (
              <Building2 className="h-5 w-5 text-blue-500" />
            ) : (
              <MapPin className="h-5 w-5 text-green-500" />
            )}
          </div>
        <div>
          <div className="font-medium">{row.original.facilityName}</div>
            <div className="text-sm text-muted-foreground capitalize">
              {row.original.facilityType.replace('-', ' ')}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'district',
      header: 'Location',
      cell: ({ row }) => (
        <div>
          <div>{row.original.district}</div>
          <div className="text-sm text-muted-foreground">{row.original.province}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Planning Status',
      cell: ({ row }) => (
        <StatusBadge 
          hasCurrentPlan={row.original.hasCurrentPlan}
        />
      ),
    },
    {
      accessorKey: 'currentPlan',
      header: 'Current Plan',
      cell: ({ row }) => {
        const plan = row.original.currentPlan;
        if (!plan) {
          return <span className="text-muted-foreground">No plan</span>;
        }
        
        return (
          <div>
            <div className="font-medium">{plan.planId}</div>
            <div className="flex items-center space-x-2 mt-1">
              <PlanStatusBadge status={plan.status} />
              <span className="text-sm text-muted-foreground">
                {new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            maximumFractionDigits: 0,
                }).format(Number(plan.generalTotalBudget || 0))}
              </span>
            </div>
        </div>
        );
      },
    },
    {
      accessorKey: 'lastPlanDate',
      header: 'Last Updated',
      cell: ({ row }) => {
        const date = row.original.lastPlanDate;
        if (!date) return <span className="text-muted-foreground">-</span>;
        
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const facility = row.original;
        const plan = facility.currentPlan;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {plan ? (
                <>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/planning/view/${plan.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                    View Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/planning/edit/${plan.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                    Edit Plan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600" 
                    onClick={() => handleDelete(plan.id, facility.facilityName)}
                  >
                <Trash2 className="mr-2 h-4 w-4" />
                    Delete Plan
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem 
                  onClick={() => router.push(`/dashboard/planning/new?facility=${encodeURIComponent(facility.facilityName)}&type=${facility.facilityType}`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Plan
              </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: facilitiesWithStatus,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  if (!currentUser) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
    <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Planning</h1>
          <p className="text-muted-foreground">
            Manage activity plans for health facilities in {currentUser.district}, {currentUser.province}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/planning/new')} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create New Plan
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facilities</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Plans</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.planned}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.planned / stats.total) * 100) : 0}% coverage
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Plans</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.awaiting}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hospitals}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Centers</CardTitle>
            <MapPin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.healthCenters}</div>
          </CardContent>
        </Card>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                  placeholder="Search facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={currentPeriod} onValueChange={setCurrentPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FY 2027">FY 2027</SelectItem>
                <SelectItem value="FY 2024-2025">FY 2024-2025</SelectItem>
                <SelectItem value="FY 2023-2024">FY 2023-2024</SelectItem>
                <SelectItem value="FY 2025-2026">FY 2025-2026</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={facilityTypeFilter} onValueChange={setFacilityTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Facility type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hospital">Hospitals</SelectItem>
                <SelectItem value="health-center">Health Centers</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetchPlans()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Facilities Planning Status</CardTitle>
          <CardDescription>
            Overview of all health facilities and their current planning status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && plansResponse && (
            <Alert className="mb-4 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Debug Info:</strong> Found {plansResponse.data.length} plans in API response. 
                Current filters: Province={currentUser?.province}, District={currentUser?.district}, 
                Period={currentPeriod}, Status={statusFilter}, Type={facilityTypeFilter}
                {plansResponse.data.length > 0 && (
                  <div className="mt-2">
                    <strong>Plans found for:</strong> {plansResponse.data.map(p => `${p.facilityName} (${p.status})`).join(', ')}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {plansError && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load plans: {plansError instanceof Error ? plansError.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoadingPlans ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                          No facilities found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
                  Showing {facilitiesWithStatus.length} of {stats.total} facilities
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
      </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}