import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingFormSchema, type OnboardingFormData, type OnboardingFormErrors } from "@/lib/schemas/onboarding-schema";
import { getDistrictsByProvince, getHospitals } from "@/lib/utils/location-utils";

export function useOnboardingForm() {
  const router = useRouter();
  const { 
    name, 
    email, 
    province, 
    district, 
    hospital,
    setOnboardingData,
    completeOnboarding,
  } = useOnboardingStore();

  const [formData, setFormData] = useState<OnboardingFormData>({
    name,
    email,
    province,
    district,
    hospital,
  });

  const [errors, setErrors] = useState<OnboardingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districts, setDistricts] = useState<Array<{ value: string; label: string }>>([]);
  const [hospitals, setHospitals] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [hospitalsData] = await Promise.all([
          getHospitals(),
        ]);
        setHospitals(hospitalsData);
        
        if (province) {
          setDistricts(getDistrictsByProvince(province));
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        // TODO: Add error handling
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, [province]);

  // Update districts when province changes
  useEffect(() => {
    if (formData.province) {
      setDistricts(getDistrictsByProvince(formData.province));
      if (formData.province !== province) {
        setFormData(prev => ({ ...prev, district: "", hospital: "" }));
        setOnboardingData({ district: "", hospital: "" });
      }
    }
  }, [formData.province, province, setOnboardingData]);

  const handleInputChange = (field: keyof OnboardingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setOnboardingData({ [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      onboardingFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error) {
        const fieldErrors: OnboardingFormErrors = {};
        if ('errors' in error) {
          (error as any).errors.forEach((err: any) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as keyof OnboardingFormErrors] = err.message;
            }
          });
        }
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log("Form data to be sent:", formData);
      
      // Mark onboarding as complete
      completeOnboarding();
      
      // Navigate to dashboard
      router.push("/dashboard/home");
    } catch (error) {
      console.error("Error submitting form:", error);
      // TODO: Add error handling and user notification
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    isLoading,
    districts,
    hospitals,
    handleInputChange,
    handleSubmit,
  };
} 