'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlanTable } from '@/features/planning/components/hiv/PlanTable';
import { CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePlanningMetadataStore } from '@/store/planning-metadata';
import { useOnboardingStore } from '@/store/onboarding-store';
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

export default function EditPlan() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;
  
  const [plan, setPlan] = useState<PlanningRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get values from stores
  const { province } = useOnboardingStore();
  const { setSelectedProgram, setSelectedFiscalYear, setFacility } = usePlanningMetadataStore();
  
  useEffect(() => {
    // Fetch plan data from the JSON file
    const foundPlan = planningData.find(plan => plan.id === planId);
    
    if (foundPlan) {
      setPlan(foundPlan as PlanningRecord);
      
      // Set the planning metadata store with this plan's data
      setSelectedProgram(foundPlan.program);
      setSelectedFiscalYear(foundPlan.fiscalYear);
      setFacility(foundPlan.facilityName, foundPlan.facilityType, foundPlan.facilityDistrict);
    } else {
      // Handle if plan not found
      alert('Plan not found');
      router.push('/planning');
    }
    
    setIsLoading(false);
  }, [planId, router, setFacility, setSelectedFiscalYear, setSelectedProgram]);
  
  if (isLoading || !plan) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Determine if it's a hospital based on facility type
  const isHospital = plan.facilityType === 'Hospital';

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/planning')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Edit Plan</h1>
      </div>
      
      <section>
        <CardHeader>
          <div className="flex flex-col gap-2 mb-4">
            <p>{plan.facilityType}: {plan.facilityName}</p>
            <p>{"District: "}{" "}{plan.facilityDistrict}{","}{" "}{province || plan.province}</p>
            <p>Period: {plan.fiscalYear}</p>
            <p>Program: {plan.program}{" "}{"Program"}</p>
            <p>Status: {plan.status}</p>
          </div>
          <CardDescription>
            Edit activities and budget allocations across quarters.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto mb-4">
          <PlanTable 
            isHospital={isHospital} 
            initialActivities={plan.activities} 
            isEdit={true}
            planId={plan.id}
          />
        </CardContent>
      </section>
    </div>
  );
}
