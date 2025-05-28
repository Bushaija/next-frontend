'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
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
import planningData from '@/constants/planning-data.json';
import { Activity } from '@/features/planning/schema/hiv/schemas';

interface PlanningRecord {
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
  activities: Activity[];
}

export default function ViewPlan() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  
  const [plan, setPlan] = useState<PlanningRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch plan data from the JSON file
    const foundPlan = planningData.find(plan => plan.id === planId);
    
    if (foundPlan) {
      setPlan(foundPlan as PlanningRecord);
    } else {
      // Handle if plan not found
      alert('Plan not found');
      router.push('/planning');
    }
    
    setIsLoading(false);
  }, [planId, router]);
  
  // Helper functions
  const calculateQuarterTotal = (quarter: 'amountQ1' | 'amountQ2' | 'amountQ3' | 'amountQ4') => {
    return plan?.activities.reduce((sum, activity) => sum + (activity[quarter] || 0), 0) || 0;
  };
  
  const calculateTotalBudget = () => {
    return plan?.activities.reduce((sum, activity) => sum + (activity.totalBudget || 0), 0) || 0;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    const statusText = status.replace('_', ' ');
    switch (status.toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">{statusText}</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800">{statusText}</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">{statusText}</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">{statusText}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{statusText}</Badge>;
    }
  };
  
  if (isLoading || !plan) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/planning')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">View Plan</h1>
        </div>
        <Button onClick={() => router.push(`/dashboard/planning/edit/${plan.id}`)}>
          <Edit className="mr-2 h-4 w-4" /> Edit Plan
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-md flex-1">
          <p><strong>Facility:</strong> {plan.facilityName} {plan.facilityType}</p>
          <p><strong>District:</strong> {plan.facilityDistrict}, {plan.province}</p>
          <p><strong>Program:</strong> {plan.program}</p>
          <p><strong>Fiscal Year:</strong> {plan.fiscalYear}</p>
          <p><strong>Status:</strong> {getStatusBadge(plan.status)}</p>
          <p><strong>Last Updated:</strong> {new Date(plan.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-md flex-1">
          <h2 className="text-lg font-semibold mb-2">Budget Summary</h2>
          <p><strong>Total Budget:</strong> {formatCurrency(calculateTotalBudget())}</p>
          <div className="mt-2 pt-2 border-t">
            <p><strong>Q1:</strong> {formatCurrency(calculateQuarterTotal('amountQ1'))}</p>
            <p><strong>Q2:</strong> {formatCurrency(calculateQuarterTotal('amountQ2'))}</p>
            <p><strong>Q3:</strong> {formatCurrency(calculateQuarterTotal('amountQ3'))}</p>
            <p><strong>Q4:</strong> {formatCurrency(calculateQuarterTotal('amountQ4'))}</p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activities" className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Activity</TableHead>
                  <TableHead className="min-w-[150px]">Category</TableHead>
                  <TableHead className="min-w-[100px]">Frequency</TableHead>
                  <TableHead className="min-w-[150px]">Unit Cost</TableHead>
                  <TableHead className="min-w-[150px]">Total Budget</TableHead>
                  <TableHead className="min-w-[200px]">Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.activity}
                      <div className="text-sm text-muted-foreground">{activity.typeOfActivity}</div>
                    </TableCell>
                    <TableCell>{activity.activityCategory}</TableCell>
                    <TableCell>{activity.frequency}</TableCell>
                    <TableCell>{formatCurrency(activity.unitCost)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(activity.totalBudget)}
                    </TableCell>
                    <TableCell>{activity.comment}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold">
                    Total Budget:
                  </TableCell>
                  <TableCell className="font-bold">
                    {formatCurrency(calculateTotalBudget())}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </TabsContent>
        
        <TabsContent value="quarterly" className="space-y-4">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Activity</TableHead>
                  <TableHead className="min-w-[100px]">Q1 Count</TableHead>
                  <TableHead className="min-w-[100px]">Q1 Amount</TableHead>
                  <TableHead className="min-w-[100px]">Q2 Count</TableHead>
                  <TableHead className="min-w-[100px]">Q2 Amount</TableHead>
                  <TableHead className="min-w-[100px]">Q3 Count</TableHead>
                  <TableHead className="min-w-[100px]">Q3 Amount</TableHead>
                  <TableHead className="min-w-[100px]">Q4 Count</TableHead>
                  <TableHead className="min-w-[100px]">Q4 Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plan.activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      {activity.activity}
                      <div className="text-sm text-muted-foreground">{activity.typeOfActivity}</div>
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
                  <TableCell className="font-bold">Quarter Totals:</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-bold">{formatCurrency(calculateQuarterTotal('amountQ1'))}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-bold">{formatCurrency(calculateQuarterTotal('amountQ2'))}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-bold">{formatCurrency(calculateQuarterTotal('amountQ3'))}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="font-bold">{formatCurrency(calculateQuarterTotal('amountQ4'))}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 