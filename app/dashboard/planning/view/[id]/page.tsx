'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Edit,
  Calendar,
  MapPin,
  Building2,
  DollarSign,
  Activity,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
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
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdBy: string;
  submittedBy: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
  statusHistory: StatusHistory[];
}

interface Activity {
  id: string;
  planId: string;
  activityCategory: string;
  typeOfActivity: string;
  activity: string;
  frequency: number;
  unitCost: string;
  countQ1: number;
  countQ2: number;
  countQ3: number;
  countQ4: number;
  amountQ1: string;
  amountQ2: string;
  amountQ3: string;
  amountQ4: string;
  totalBudget: string;
  comment: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface StatusHistory {
  id: string;
  planId: string;
  previousStatus: string | null;
  newStatus: string;
  description: string;
  createdAt: string;
}

// API function
const fetchPlan = async (planId: string): Promise<Plan> => {
  console.log('🔍 Fetching plan:', planId);
  
  const response = await fetch(`/api/plan/${planId}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to fetch plan:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch plan'}`);
  }
  
  const result = await response.json();
  
  if (!result.success) {
    console.error('❌ API returned error:', result.message);
    throw new Error(result.message || 'Failed to fetch plan');
  }
  
  console.log('✅ Plan fetched successfully:', result.data);
  return result.data;
};

export default function ViewPlan() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  
  const {
    data: plan,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['plan', planId],
    queryFn: () => fetchPlan(planId),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: Plan['status']) => {
    const configs = {
      draft: {
        icon: FileText,
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-700',
        label: 'Draft'
      },
      pending: {
        icon: Clock,
        variant: 'default' as const,
        className: 'bg-yellow-100 text-yellow-700',
        label: 'Pending Review'
      },
      approved: {
        icon: CheckCircle2,
        variant: 'default' as const,
        className: 'bg-green-100 text-green-700',
        label: 'Approved'
      },
      rejected: {
        icon: AlertCircle,
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-700',
        label: 'Rejected'
      },
    };
    return configs[status];
  };

  const calculateQuarterlyTotals = () => {
    if (!plan?.activities) return { q1: 0, q2: 0, q3: 0, q4: 0 };
    
    return plan.activities.reduce(
      (totals, activity) => ({
        q1: totals.q1 + parseFloat(activity.amountQ1 || '0'),
        q2: totals.q2 + parseFloat(activity.amountQ2 || '0'),
        q3: totals.q3 + parseFloat(activity.amountQ3 || '0'),
        q4: totals.q4 + parseFloat(activity.amountQ4 || '0'),
      }),
      { q1: 0, q2: 0, q3: 0, q4: 0 }
    );
  };

  const calculateActivityCount = () => {
    if (!plan?.activities) return 0;
    return plan.activities.length;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/planning')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Plan Details</h1>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load plan: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  const statusConfig = getStatusConfig(plan.status);
  const StatusIcon = statusConfig.icon;
  const quarterlyTotals = calculateQuarterlyTotals();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/planning')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Plan Details</h1>
            <p className="text-muted-foreground">
              {plan.planId} • {plan.facilityName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        <Button onClick={() => router.push(`/dashboard/planning/edit/${plan.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Plan
        </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Facility Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facility</CardTitle>
            {plan.isHospital ? (
              <Building2 className="h-4 w-4 text-blue-500" />
            ) : (
              <MapPin className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.facilityName}</div>
            <p className="text-xs text-muted-foreground">
              {plan.facilityType} • {plan.district}, {plan.province}
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <StatusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <Badge {...statusConfig} className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Updated {formatDate(plan.updatedAt)}
            </p>
          </CardContent>
        </Card>

        {/* Total Budget */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(plan.generalTotalBudget)}
            </div>
            <p className="text-xs text-muted-foreground">
              {calculateActivityCount()} activities
            </p>
          </CardContent>
        </Card>

        {/* Period */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Period</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plan.period}</div>
            <p className="text-xs text-muted-foreground">
              {plan.program} Program
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Plan Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Plan Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Created by:</span>
                <span className="text-sm">{plan.createdBy}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm">{formatDate(plan.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last updated:</span>
                <span className="text-sm">{formatDate(plan.updatedAt)}</span>
              </div>
            </div>
            <div className="space-y-4">
              {plan.submittedBy && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Submitted by:</span>
                  <span className="text-sm">{plan.submittedBy}</span>
                </div>
              )}
              {plan.submittedAt && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Submitted:</span>
                  <span className="text-sm">{formatDate(plan.submittedAt)}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Facility type:</span>
                <span className="text-sm capitalize">{plan.facilityType}</span>
              </div>
        </div>
          </div>
        </CardContent>
      </Card>

      {/* Quarterly Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Quarterly Budget Summary
          </CardTitle>
          <CardDescription>
            Budget allocation across quarters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { quarter: 'Q1', amount: quarterlyTotals.q1, color: 'bg-blue-500' },
              { quarter: 'Q2', amount: quarterlyTotals.q2, color: 'bg-green-500' },
              { quarter: 'Q3', amount: quarterlyTotals.q3, color: 'bg-yellow-500' },
              { quarter: 'Q4', amount: quarterlyTotals.q4, color: 'bg-purple-500' },
            ].map((item) => (
              <div key={item.quarter} className="text-center p-4 border rounded-lg">
                <div className={`w-12 h-12 ${item.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                  {item.quarter}
                </div>
                <div className="text-lg font-semibold">{formatCurrency(item.amount)}</div>
                <div className="text-sm text-muted-foreground">
                  {item.amount > 0 ? Math.round((item.amount / parseFloat(plan.generalTotalBudget)) * 100) : 0}% of total
        </div>
      </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Activities and History */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activities" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Activities ({calculateActivityCount()})
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Quarterly View
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
        
        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown</CardTitle>
              <CardDescription>
                Detailed view of all planned activities
              </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Activity</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Budget</TableHead>
                  <TableHead className="min-w-[200px]">Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.activity}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {activity.activityCategory}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {activity.typeOfActivity}
                    </TableCell>
                    <TableCell>{activity.frequency}</TableCell>
                    <TableCell>{formatCurrency(activity.unitCost)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(activity.totalBudget)}
                    </TableCell>
                        <TableCell className="text-sm">
                          {activity.comment || '-'}
                        </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                      <TableCell colSpan={5} className="text-right font-bold">
                    Total Budget:
                  </TableCell>
                  <TableCell className="font-bold">
                        {formatCurrency(plan.generalTotalBudget)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Quarterly Tab */}
        <TabsContent value="quarterly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quarterly Activity Breakdown</CardTitle>
              <CardDescription>
                Activity counts and amounts by quarter
              </CardDescription>
            </CardHeader>
            <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                      <TableHead className="min-w-[200px]">Activity</TableHead>
                      <TableHead>Q1 Count</TableHead>
                      <TableHead>Q1 Amount</TableHead>
                      <TableHead>Q2 Count</TableHead>
                      <TableHead>Q2 Amount</TableHead>
                      <TableHead>Q3 Count</TableHead>
                      <TableHead>Q3 Amount</TableHead>
                      <TableHead>Q4 Count</TableHead>
                      <TableHead>Q4 Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                          <div>
                            <div className="text-sm">{activity.activity}</div>
                            <div className="text-xs text-muted-foreground">
                              {activity.activityCategory}
                            </div>
                          </div>
                    </TableCell>
                    <TableCell>{activity.countQ1}</TableCell>
                    <TableCell>{formatCurrency(activity.amountQ1)}</TableCell>
                    <TableCell>{activity.countQ2}</TableCell>
                    <TableCell>{formatCurrency(activity.amountQ2)}</TableCell>
                    <TableCell>{activity.countQ3}</TableCell>
                    <TableCell>{formatCurrency(activity.amountQ3)}</TableCell>
                    <TableCell>{activity.countQ4}</TableCell>
                    <TableCell>{formatCurrency(activity.amountQ4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                      <TableCell className="font-bold">Totals:</TableCell>
                      <TableCell className="font-bold">
                        {plan.activities.reduce((sum, activity) => sum + (activity.countQ1 || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(quarterlyTotals.q1)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {plan.activities.reduce((sum, activity) => sum + (activity.countQ2 || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(quarterlyTotals.q2)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {plan.activities.reduce((sum, activity) => sum + (activity.countQ3 || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(quarterlyTotals.q3)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {plan.activities.reduce((sum, activity) => sum + (activity.countQ4 || 0), 0)}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(quarterlyTotals.q4)}
                      </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
              <CardDescription>
                Timeline of plan status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.statusHistory && plan.statusHistory.length > 0 ? (
                  plan.statusHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                        {index < plan.statusHistory.length - 1 && (
                          <div className="w-px h-12 bg-gray-200 ml-1"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          Status changed to {history.newStatus}
                          {history.previousStatus && (
                            <span className="text-muted-foreground">
                              {' '}from {history.previousStatus}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {history.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(history.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No status history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 