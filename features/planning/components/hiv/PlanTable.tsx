'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useForm, FormProvider, SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter,
  TableRow, 
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlanActivityRow } from './PlanActivityRow';
import { PlanGeneralTotalRow } from './PlanGeneralTotalRow';
import { 
  Activity, 
  Plan, 
  generateDefaultActivities,
  planSchema,
  createEmptyActivity
} from '../../schema/hiv/schemas';
import { HEALTH_CENTER_ACTIVITIES } from '@/constants/hiv-data/healthCenterActivities';
import { HOSPITAL_ACTIVITIES } from '@/constants/hiv-data/hospitalActivities';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';

interface PlanTableProps {
  isHospital?: boolean;
  initialActivities?: Activity[];
  isEdit?: boolean;
  planId?: string;
  onSubmitSuccess?: (plan: Plan) => void;
  metadata?: {
    facilityName?: string;
    facilityType?: string;
    district?: string;
    province?: string;
    period?: string;
    program?: string;
    submittedBy?: string;
    createdBy?: string;
    status?: 'draft' | 'pending' | 'approved' | 'rejected';
  };
}

export function PlanTable({ 
  isHospital = false, 
  initialActivities,
  isEdit = false,
  planId,
  onSubmitSuccess,
  metadata = {}
}: PlanTableProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activityCategories = isHospital ? HOSPITAL_ACTIVITIES : HEALTH_CENTER_ACTIVITIES;
  
  // Default metadata values
  const {
    facilityName = isHospital ? "Hospital" : "Health Center",
    facilityType = isHospital ? "Hospital" : "Health Center",
    district = "District",
    province = "Province",
    period = "Current Period",
    program = "HIV Program",
    submittedBy = "Not specified",
    createdBy = "Not specified",
    status = "draft"
  } = metadata;
  
  // Track expanded/collapsed categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    // Initialize all categories as expanded by default
    const expanded: Record<string, boolean> = {};
    Object.keys(activityCategories).forEach(category => {
      expanded[category] = true;
    });
    return expanded;
  });
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const form = useForm<Plan>({
    resolver: zodResolver(planSchema) as Resolver<Plan>,
    defaultValues: {
      activities: initialActivities || generateDefaultActivities(isHospital),
      generalTotalBudget: 0
    }
  });
  
  const { watch, handleSubmit, formState: { errors }, setValue } = form;
  const activities = watch('activities');
  
  // Update generalTotalBudget whenever activities change
  useEffect(() => {
    const total = activities.reduce((sum, activity) => sum + (activity.totalBudget || 0), 0);
    setValue('generalTotalBudget', total);
  }, [activities, setValue]);
  
  // Memoize categorized activities to prevent recalculation on every render
  const categorizedActivities = useMemo(() => {
    const result: Record<string, Activity[]> = {};
    
    activities.forEach(activity => {
      const category = activity.activityCategory;
      if (!result[category]) {
        result[category] = [];
      }
      result[category].push(activity);
    });
    
    return result;
  }, [activities]);
  
  // Create an efficient index map for activity lookup
  const activityIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach((activity, index) => {
      const key = `${activity.activityCategory}-${activity.typeOfActivity}-${activity.activity || ''}`;
      map.set(key, index);
    });
    return map;
  }, [activities]);
  
  
  // More efficient activity index lookup
  const getActivityIndex = (activity: Activity) => {
    const key = `${activity.activityCategory}-${activity.typeOfActivity}-${activity.activity || ''}`;
    return activityIndexMap.get(key) ?? -1;
  };
  
  const onSubmit: SubmitHandler<Plan> = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Calculate general total budget from all activities
      const generalTotalBudget = activities.reduce((sum, activity) => sum + (activity.totalBudget || 0), 0);
      
      // Filter out empty or invalid activities (activities with no meaningful data)
      const validActivities = data.activities.filter(activity => {
        // Keep activities that have at least some data entry
        const hasFrequency = activity.frequency && activity.frequency > 0;
        const hasUnitCost = activity.unitCost && activity.unitCost > 0;
        const hasCounts = (activity.countQ1 || 0) > 0 || (activity.countQ2 || 0) > 0 || 
                         (activity.countQ3 || 0) > 0 || (activity.countQ4 || 0) > 0;
        
        return hasFrequency && hasUnitCost && hasCounts;
      });

      console.log(`📊 Filtered ${validActivities.length} valid activities from ${data.activities.length} total activities`);
      
      // Validate that we have at least one valid activity
      if (validActivities.length === 0) {
        throw new Error('Please fill in at least one activity with frequency, unit cost, and quarterly counts.');
      }
      
      // Prepare clean data for backend - match the insertPlanSchema structure
      const cleanData = {
        // Top-level fields as expected by the backend schema
        facilityName,
        facilityType,
        district,
        province,
        period,
        program,
        isHospital,
        createdBy,
        submittedBy,
        activities: validActivities.map((activity, index) => ({
          activityCategory: activity.activityCategory,
          typeOfActivity: activity.typeOfActivity,
          activity: activity.activity || "",
          frequency: Number(activity.frequency) || 1,
          unitCost: Number(activity.unitCost) || 0,
          countQ1: Number(activity.countQ1) || 0,
          countQ2: Number(activity.countQ2) || 0,
          countQ3: Number(activity.countQ3) || 0,
          countQ4: Number(activity.countQ4) || 0,
          comment: activity.comment || "",
          sortOrder: index
        }))
      };
      
      // Log the exact data being sent
      console.log('📄 Form submitted data:', JSON.stringify(cleanData, null, 2));
      
      // Send data to the backend
      const response = await fetch('/api/plan', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cleanData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('❌ API Error Response:', errorData);
        
        // Show detailed validation errors if available
        if (errorData?.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        
        throw new Error(errorData?.message || `HTTP ${response.status}: Failed to save plan`);
      }
      
      const responseData = await response.json();
      console.log('✅ Success Response:', responseData);
      
      // Success handling
      if (onSubmitSuccess) {
        onSubmitSuccess(responseData.data || cleanData);
      } else {
        alert('Plan saved successfully!');
      }
      
      // If we're editing an existing plan, redirect back to the planning list
      if (isEdit) {
        router.push('/planning');
      }
    } catch (error) {
      console.error('💥 Error saving plan:', error);
      alert(`Failed to save plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if there are validation errors
  const hasErrors = Object.keys(errors).length > 0;
  
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit((data) => onSubmit(data as Plan))} className="space-y-6">
        {/* Plan Metadata Header */}
        <div>
          <div className="px-4">
            <div>
              <div>
                <h2 className="text-xl font-semibold mb-2 capitalize">{program} NSP detailed plan of action</h2>
                <div className="space-y-0">
                  <div className="flex">
                    <span className="font-semibold w-16">Facility:</span>
                    <span>{facilityName} ({facilityType})</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-16">District:</span>
                    <span>{district}, {province}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-16">Period:</span>
                    <span>{period}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="space-y-2">
                  
                  <div className="flex">
                    <span className="font-semibold w-32">Status:</span>
                    <span className="capitalize">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : status === 'rejected' 
                            ? 'bg-red-100 text-red-800' 
                            : status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-gray-100 text-gray-800'
                      }`}>
                        {status}
                      </span>
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Created by:</span>
                    <span>{createdBy}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Summary Totals */}
            {/* <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                <h3 className="font-semibold">Budget Summary</h3>
                <div className="font-semibold">
                  Total Budget: {formatCurrency(grandTotals.totalBudget)}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mt-2">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-500">Q1</div>
                  <div className="font-medium">{formatCurrency(grandTotals.amountQ1)}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-500">Q2</div>
                  <div className="font-medium">{formatCurrency(grandTotals.amountQ2)}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-500">Q3</div>
                  <div className="font-medium">{formatCurrency(grandTotals.amountQ3)}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-sm text-gray-500">Q4</div>
                  <div className="font-medium">{formatCurrency(grandTotals.amountQ4)}</div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
        
        {hasErrors && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <p className="text-red-600 font-medium">Please fix the following errors:</p>
            <ul className="list-disc ml-5 mt-2 text-red-600">
              {errors.activities && (
                <>
                  {Array.isArray(errors.activities) ? (
                    errors.activities.map((error, index) => (
                      <li key={index}>
                        Activity {index + 1}: {error?.message || 'Invalid data'}
                      </li>
                    ))
                  ) : (
                    <li>{errors.activities.message || 'Activity data is incomplete or invalid'}</li>
                  )}
                </>
              )}
              {errors.generalTotalBudget && (
                <li>General Total Budget: {errors.generalTotalBudget.message}</li>
              )}
              {Object.entries(errors).map(([field, error]) => {
                if (field !== 'activities' && field !== 'generalTotalBudget' && error?.message) {
                  return (
                    <li key={field}>
                      {field}: {error.message}
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        )}
        
        {/* Table with fixed header and scrollable body */}
        <div className="rounded-md border shadow">
          <div className="overflow-auto max-h-[70vh]">
            <Table className="min-w-max relative">
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-[160px] sticky left-0 z-20 bg-background">Activity Category</TableHead>
                  <TableHead className="w-[200px]">Type of Activity</TableHead>
                  <TableHead className="w-[80px]">Frequency</TableHead>
                  <TableHead className="w-[80px]">Unit Cost</TableHead>
                  <TableHead className="w-[80px]">Count Q1<br/>(Jul-Sep)</TableHead>
                  <TableHead className="w-[80px]">Count Q2<br/>(Oct-Dec)</TableHead>
                  <TableHead className="w-[80px]">Count Q3<br/>(Jan-Mar)</TableHead>
                  <TableHead className="w-[80px]">Count Q4<br/>(Apr-Jun)</TableHead>
                  <TableHead className="w-[80px]">Amount<br/>Q1</TableHead>
                  <TableHead className="w-[80px]">Amount<br/>Q2</TableHead>
                  <TableHead className="w-[80px]">Amount<br/>Q3</TableHead>
                  <TableHead className="w-[80px]">Amount<br/>Q4</TableHead>
                  <TableHead className="w-[100px]">Total Budget</TableHead>
                  <TableHead className="w-[160px]">Comment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(activityCategories).map(([category, entries]) => {
                  // Get activities for this category
                  const categoryActivities = categorizedActivities[category] || [];
                  
                  // Calculate category totals
                  const categoryTotals = {
                    activityCategory: category,
                    typeOfActivity: '',
                    activity: '',
                    frequency: 0,
                    unitCost: 0,
                    countQ1: 0,
                    countQ2: 0,
                    countQ3: 0,
                    countQ4: 0,
                    amountQ1: categoryActivities.reduce((sum, act) => sum + (act.amountQ1 || 0), 0),
                    amountQ2: categoryActivities.reduce((sum, act) => sum + (act.amountQ2 || 0), 0),
                    amountQ3: categoryActivities.reduce((sum, act) => sum + (act.amountQ3 || 0), 0),
                    amountQ4: categoryActivities.reduce((sum, act) => sum + (act.amountQ4 || 0), 0),
                    totalBudget: categoryActivities.reduce((sum, act) => sum + (act.totalBudget || 0), 0),
                    comment: ''
                  };
                  
                  const isExpanded = expandedCategories[category];
                  
                  return (
                    <React.Fragment key={category}>
                      {/* Category Row with toggle button */}
                      <TableRow 
                        className="bg-muted/50 font-semibold cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => toggleCategory(category)}
                      >
                        <TableCell className="w-[160px] sticky left-0 bg-muted/50">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            {category}
                          </div>
                        </TableCell>
                        <TableCell className="w-[200px]">-</TableCell>
                        <TableCell className="w-[80px]">-</TableCell>
                        <TableCell className="w-[80px]">-</TableCell>
                        <TableCell className="w-[80px]">-</TableCell>
                        <TableCell className="w-[80px]">-</TableCell>
                        <TableCell className="w-[80px]">-</TableCell>
                        <TableCell className="w-[80px]">-</TableCell>
                        <TableCell className="w-[80px]">
                          {formatCurrency(categoryTotals.amountQ1)}
                        </TableCell>
                        <TableCell className="w-[80px]">
                          {formatCurrency(categoryTotals.amountQ2)}
                        </TableCell>
                        <TableCell className="w-[80px]">
                          {formatCurrency(categoryTotals.amountQ3)}
                        </TableCell>
                        <TableCell className="w-[80px]">
                          {formatCurrency(categoryTotals.amountQ4)}
                        </TableCell>
                        <TableCell className="w-[100px] font-semibold">
                          {formatCurrency(categoryTotals.totalBudget)}
                        </TableCell>
                        <TableCell className="w-[160px]">-</TableCell>
                      </TableRow>
                      
                      {/* Activity Rows - only show if expanded */}
                      {isExpanded && entries.map((entry, entryIndex) => {
                        const activity = categoryActivities.find(
                          a => a.typeOfActivity === entry.typeOfActivity && a.activity === entry.activity
                        ) || createEmptyActivity(category, entry.typeOfActivity, entry.activity);
                        
                        return (
                          <PlanActivityRow
                            key={`${category}-${entry.typeOfActivity}-${entryIndex}`}
                            activity={activity}
                            index={getActivityIndex(activity)}
                            form={form}
                            isSubCategory={true}
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </TableBody>
              <TableFooter className="sticky bottom-0 bg-background">
                <PlanGeneralTotalRow activities={activities} />
              </TableFooter>
            </Table>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-semibold">Note:</span> Budget totals must match annual allocations
          </div>
          <div className="flex space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/planning')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Plan' : 'Save Plan'}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
} 