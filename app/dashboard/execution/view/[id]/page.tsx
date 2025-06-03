'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Pause, 
  Square,
  Building2,
  Target,
  FileText,
  BarChart3,
  Activity
} from 'lucide-react';

// Types
interface ExecutionData {
  id: string;
  plan_id: string;
  plan_name: string;
  facility_name: string;
  status: 'draft' | 'in_progress' | 'paused' | 'completed' | 'cancelled';
  progress: number;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  financial_data: {
    allocated_budget: number;
    spent_amount: number;
    remaining_budget: number;
    quarterly_breakdown: Array<{
      quarter: string;
      budgeted: number;
      spent: number;
      remaining: number;
    }>;
  };
  activities: Array<{
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    budget: number;
    spent: number;
    progress: number;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    due_date: string;
    status: 'pending' | 'completed' | 'overdue';
    completion_date: string | null;
  }>;
}

// API Functions
const fetchExecutionDetails = async (id: string): Promise<ExecutionData> => {
  console.log('Fetching execution details for ID:', id);
  
  const response = await fetch(`/api/execution/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch execution details');
  }

  const result = await response.json();
  console.log('Execution details fetched successfully:', result.data);
  return result.data;
};

const updateExecutionStatus = async ({ 
  id, 
  status, 
  progress, 
  notes 
}: { 
  id: string; 
  status: string; 
  progress?: number; 
  notes?: string; 
}) => {
  console.log('Updating execution status:', { id, status, progress, notes });
  
  const response = await fetch(`/api/execution/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, progress, notes }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update execution status');
  }

  const result = await response.json();
  console.log('Execution status updated successfully:', result);
  return result.data;
};

// Helper Functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    draft: { variant: 'secondary', icon: FileText, color: 'text-gray-500' },
    in_progress: { variant: 'default', icon: Play, color: 'text-blue-500' },
    paused: { variant: 'warning', icon: Pause, color: 'text-yellow-500' },
    completed: { variant: 'success', icon: CheckCircle2, color: 'text-green-500' },
    cancelled: { variant: 'destructive', icon: Square, color: 'text-red-500' },
    pending: { variant: 'secondary', icon: Clock, color: 'text-gray-500' },
    overdue: { variant: 'destructive', icon: AlertCircle, color: 'text-red-500' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant as any} className="capitalize">
      <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
      {status.replace('_', ' ')}
    </Badge>
  );
};

export default function ExecutionViewPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const executionId = params.id as string;

  // Fetch execution details
  const { 
    data: execution, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['execution', executionId],
    queryFn: () => fetchExecutionDetails(executionId),
    enabled: !!executionId,
  });

  // Update execution status mutation
  const updateStatusMutation = useMutation({
    mutationFn: updateExecutionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution', executionId] });
      queryClient.invalidateQueries({ queryKey: ['executions'] });
    },
  });

  const handleStatusUpdate = (status: string, progress?: number) => {
    updateStatusMutation.mutate({
      id: executionId,
      status,
      progress,
      notes: `Status updated to ${status}`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading execution details: {error.message}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => refetch()} 
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="container mx-auto py-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Execution not found.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{execution.plan_name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {execution.facility_name} • Execution #{execution.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(execution.status)}
          <div className="flex gap-2">
            {execution.status === 'draft' && (
              <Button 
                onClick={() => handleStatusUpdate('in_progress', 0)}
                disabled={updateStatusMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Execution
              </Button>
            )}
            {execution.status === 'in_progress' && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => handleStatusUpdate('paused', execution.progress)}
                  disabled={updateStatusMutation.isPending}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button 
                  onClick={() => handleStatusUpdate('completed', 100)}
                  disabled={updateStatusMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              </>
            )}
            {execution.status === 'paused' && (
              <Button 
                onClick={() => handleStatusUpdate('in_progress', execution.progress)}
                disabled={updateStatusMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{execution.progress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={execution.progress} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">{formatCurrency(execution.total_budget)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Spent Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(execution.financial_data.spent_amount)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((execution.financial_data.spent_amount / execution.total_budget) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">{formatCurrency(execution.financial_data.remaining_budget)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="financial">Financial Breakdown</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Activity Progress
              </CardTitle>
              <CardDescription>
                Track the progress of individual activities within this execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {execution.activities.map((activity) => (
                  <div key={activity.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{activity.name}</h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-medium">{formatCurrency(activity.budget)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Spent</p>
                        <p className="font-medium">{formatCurrency(activity.spent)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="font-medium">{activity.progress}%</p>
                      </div>
                    </div>
                    <Progress value={activity.progress} className="mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(activity.budget - activity.spent)} remaining
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Quarterly Financial Breakdown
              </CardTitle>
              <CardDescription>
                View budget allocation and spending by quarter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {execution.financial_data.quarterly_breakdown.map((quarter) => (
                  <Card key={quarter.quarter} className="bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-center mb-3">{quarter.quarter}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Budgeted:</span>
                          <span className="text-sm font-medium">{formatCurrency(quarter.budgeted)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Spent:</span>
                          <span className="text-sm font-medium">{formatCurrency(quarter.spent)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Remaining:</span>
                          <span className="text-sm font-medium">{formatCurrency(quarter.remaining)}</span>
                        </div>
                        <Progress 
                          value={(quarter.spent / quarter.budgeted) * 100} 
                          className="mt-2" 
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Project Milestones
              </CardTitle>
              <CardDescription>
                Track key milestones and deliverables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {execution.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : milestone.status === 'overdue' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <h4 className="font-medium">{milestone.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Due: {formatDate(milestone.due_date)}
                          {milestone.completion_date && (
                            <span> • Completed: {formatDate(milestone.completion_date)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(milestone.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Execution Timeline
              </CardTitle>
              <CardDescription>
                View execution schedule and important dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Execution Period</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span>{formatDate(execution.start_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <span>{formatDate(execution.end_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{formatDate(execution.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{formatDate(execution.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Progress Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm">Execution Started - {formatDate(execution.start_date)}</span>
                      </div>
                      {execution.progress > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm">Progress: {execution.progress}% - {formatDate(execution.updated_at)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                        <span className="text-sm text-muted-foreground">
                          Target Completion - {formatDate(execution.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 