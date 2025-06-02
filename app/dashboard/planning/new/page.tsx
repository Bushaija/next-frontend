'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/navigation"
import { PlanTable } from '@/features/planning/components/hiv/PlanTable';
import { usePlanningMetadataStore } from '@/store/planning-metadata';
import { Plan } from '@/features/planning/schema/hiv/schemas';
import { Card } from '@/components/ui/card';

// Define user type based on login response
type User = {
  id: string;
  name: string;
  email: string;
  province: string;
  district: string;
  hospital: string;
  createdAt: string;
};

export default function HIVNewPlan() {
  const router = useRouter();
  const { selectedProgram, selectedFiscalYear } = usePlanningMetadataStore();
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planSaved, setPlanSaved] = useState(false);

  // Function to get current user from localStorage
  const getCurrentUser = useCallback((): User | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.warn('No user data found in localStorage with key "user"');
        return null;
      }
      
      const user = JSON.parse(userStr) as User;
      console.log('📋 Current user data for planning:', {
        name: user.name,
        email: user.email,
        province: user.province,
        district: user.district,
        hospital: user.hospital
      });
      
      return user;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  }, []);

  // Load user data
  useEffect(() => {
    const initializeUserData = () => {
      console.log('🚀 Initializing planning page with user data...');
      
      const user = getCurrentUser();
      
      if (!user) {
        console.error('❌ No user data available, redirecting to sign-in');
        router.push('/sign-in');
        return;
      }
      
      setCurrentUser(user);
      setIsLoading(false);
      
      console.log('✅ User data loaded for planning');
      console.log('📊 Planning store data:', {
        selectedProgram,
        selectedFiscalYear
      });
    };

    initializeUserData();
  }, [getCurrentUser, router, selectedProgram, selectedFiscalYear]);

  // Auto-complete metadata from user profile and planning selections
  const planMetadata = React.useMemo(() => {
    if (!currentUser) return null;

    return {
      // Facility information from user profile
      facilityName: currentUser.hospital,
      facilityType: 'Hospital', // Assuming user's primary facility is always a hospital
      district: currentUser.district,
      province: currentUser.province,
      
      // Planning information from store (selected during plan initiation)
      program: selectedProgram || 'HIV',
      period: selectedFiscalYear || 'FY 2024',
      
      // Auto-completed fields
      status: 'draft' as const,
      createdBy: currentUser.name,
      createdByEmail: currentUser.email,
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [currentUser, selectedProgram, selectedFiscalYear]);

  // Determine if this is a hospital (always true for user's primary facility)
  const isHospital = true;

  // Handler for when the plan is successfully submitted
  const handlePlanSubmitSuccess = (plan: Plan) => {
    console.log('✅ Plan saved successfully:', plan);
    console.log('📋 Plan metadata used:', planMetadata);
    setPlanSaved(true);
    
    // TODO: Here you could save the complete data to your backend
    // await savePlanToDatabase({ ...plan, metadata: planMetadata });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg">Loading planning workspace...</p>
        </div>
      </div>
    );
  }

  // Error state - no user or missing required data
  if (!currentUser || !planMetadata) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Planning Data Missing</h2>
          <p className="text-muted-foreground mb-4">
            Required planning information is missing. Please start from the dashboard.
          </p>
          <button 
            onClick={() => router.push('/dashboard/home')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </Card>
      </div>
    );
  }

  // Validation - ensure we have required program and fiscal year
  if (!selectedProgram || !selectedFiscalYear) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Missing Plan Details</h2>
          <p className="text-muted-foreground mb-4">
            Program and fiscal year must be selected before creating a plan.
          </p>
          <button 
            onClick={() => router.push('/dashboard/home')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Select Program & Fiscal Year
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Success message */}
      {planSaved && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <p className="text-green-700">
            Your plan has been saved successfully. You can continue editing or return to the planning dashboard.
          </p>
        </div>
      )}
      
      {/* Main plan table */}
      <PlanTable 
        isHospital={isHospital} 
        isEdit={false}
        onSubmitSuccess={handlePlanSubmitSuccess}
        metadata={planMetadata}
      />
    </div>
  );
}