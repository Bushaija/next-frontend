import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types for plan checking
export interface CheckPlanRequest {
  facilityName: string;
  facilityType: string;
  program: string;
  fiscalYear: string;
}

export interface CheckPlanResponse {
  exists: boolean;
  message: string;
}

// API function to check existing plans
const checkExistingPlan = async (data: CheckPlanRequest): Promise<CheckPlanResponse> => {
  const response = await fetch('/api/plans/check-existing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to check existing plan');
  }

  return response.json();
};

// Hook for checking existing plans
export const useCheckExistingPlan = () => {
  return useMutation({
    mutationFn: checkExistingPlan,
    onSuccess: (data) => {
      console.log('✅ Plan check completed:', data);
    },
    onError: (error) => {
      console.error('❌ Plan check failed:', error);
    },
  });
};

// Types for user plans API
interface UserPlansRequest {
  facilityName: string;
  facilityType: string;
  district: string;
  province: string;
}

interface UserPlansResponse {
  success: boolean;
  data: any[];
  message: string;
}

// API function to fetch user plans
const fetchUserPlans = async (userData: UserPlansRequest): Promise<UserPlansResponse> => {
  const response = await fetch('/api/plans/user-plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user plans');
  }

  return response.json();
};

// Hook to fetch user plans with React Query
export const useUserPlans = (
  userData: UserPlansRequest | null,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['userPlans', userData],
    queryFn: () => {
      if (!userData) {
        throw new Error('User data is required');
      }
      return fetchUserPlans(userData);
    },
    enabled: enabled && !!userData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    onError: (error: Error) => {
      console.error('Error fetching user plans:', error);
      toast.error(`Failed to fetch plans: ${error.message}`);
    },
    onSuccess: (data: UserPlansResponse) => {
      console.log('Successfully fetched user plans:', data);
    },
  });
}; 