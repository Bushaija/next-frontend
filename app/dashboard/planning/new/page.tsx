'use client';

import React, { useState } from 'react';
import { useSearchParams } from "next/navigation"
import { PlanTable } from '@/features/planning/components/hiv/PlanTable';
import { usePlanningMetadataStore } from '@/store/planning-metadata';
import { useOnboardingStore } from '@/store/onboarding-store';
import { Plan } from '@/features/planning/schema/hiv/schemas';

export default function HIVNewPlan() {
  const searchParams = useSearchParams();
  const { selectedProgram, selectedFiscalYear, facilityName, facilityDistrict, facilityType } = usePlanningMetadataStore();
  const { province, email } = useOnboardingStore();
  
  // Get values from query params, fallback to store values
  const queryFacilityType = searchParams.get('facilityType');
  const isHospital = queryFacilityType === 'hospital';
  
  // Prepare metadata for the plan
  const planMetadata = {
    facilityName: facilityName || searchParams.get('facilityName') || '',
    facilityType: facilityType || queryFacilityType || '',
    district: facilityDistrict || searchParams.get('district') || '',
    province: province || '',
    period: selectedFiscalYear || searchParams.get('fiscalYear') || '',
    program: selectedProgram || searchParams.get('program') || 'HIV Program',
    submittedBy: email || 'Not specified',
    status: 'draft' as 'draft' | 'pending' | 'approved' | 'rejected'
  };
  
  // Track when plan data has been saved
  const [planSaved, setPlanSaved] = useState(false);

  // Handler for when the plan is successfully submitted
  const handlePlanSubmitSuccess = (plan: Plan) => {
    // Here you could save the complete data to your backend if needed
    console.log('Plan saved successfully:', plan);
    setPlanSaved(true);
  };

  if (!queryFacilityType && !facilityType) {
    return (
      <div className="p-6">
        <p className="text-red-500">Facility not specified. Please provide a facility parameter.</p>
      </div>
    );
  }

  return (
    <div>
      {planSaved && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <p className="text-green-700">
            Your plan has been saved successfully. You can continue editing or return to the planning dashboard.
          </p>
        </div>
      )}
      
      <PlanTable 
        isHospital={isHospital} 
        isEdit={false}
        onSubmitSuccess={handlePlanSubmitSuccess}
        metadata={planMetadata}
      />
    </div>
  );
}