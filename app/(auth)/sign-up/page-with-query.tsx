"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { useMultiplestepForm } from "@/hooks/use-multiple-step-form";
import { FormWrapper } from "@/components/ui/form-wrapper";
import { FormItems } from "@/constants/form-items";
import { formSteps } from "@/lib/constants/form-steps";
import { validateField } from "@/lib/utils/form-validation";
import SuccessMessage from "@/features/registration/success-message";
import SideBar from "@/features/registration/side-bar";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboarding-store";
import { getDistrictsByProvince, getHospitals } from "@/lib/utils/location-utils";
import { useRegisterForm } from "@/lib/hooks/use-auth";
import { RegisterInput } from "@/lib/db/schema";

const initialValues: FormItems = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  province: "",
  district: "",
  hospital: "",
};

// Define step fields mapping
const stepFields: Record<number, Array<keyof FormItems>> = {
  0: ['name', 'email', 'password', 'confirmPassword'],
  1: ['province', 'district', 'hospital'],
  2: [] // Summary step has no fields to validate
};

export default function RegisterPageWithQuery() {
  const router = useRouter();
  const { register, isLoading: isMutationLoading, reset } = useRegisterForm();
  
  const { 
    name, 
    email, 
    province, 
    district, 
    hospital,
    setOnboardingData 
  } = useOnboardingStore();

  const [formData, setFormData] = useState<FormItems>({
    ...initialValues,
    name,
    email,
    province,
    district,
    hospital,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormItems, string>>>({});
  const [districts, setDistricts] = useState<Array<{ value: string; label: string }>>([]);
  const [hospitals, setHospitals] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const { 
    nextStep, 
    goTo, 
    currentStepIndex, 
    showSuccessMsg,
    isLastStep,
    isFirstStep 
  } = useMultiplestepForm(formSteps.length);

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
        toast.error("Failed to load location data");
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

  function updateForm(fieldToUpdate: Partial<FormItems>) {
    // Update local state
    setFormData(prev => ({ ...prev, ...fieldToUpdate }));
    
    // Update store for location fields
    const locationFields = ['province', 'district', 'hospital'];
    const storeUpdate: Partial<FormItems> = {};
    
    for (const key in fieldToUpdate) {
      const field = key as keyof FormItems;
      if (locationFields.includes(field)) {
        storeUpdate[field] = fieldToUpdate[field];
      }
    }
    
    if (Object.keys(storeUpdate).length > 0) {
      setOnboardingData(storeUpdate);
    }

    // Clear server errors for updated fields and validate
    const newErrors = { ...errors };
    for (const key in fieldToUpdate) {
      const field = key as keyof FormItems;
      const value = fieldToUpdate[field];
      
      // Clear server error for this field
      delete newErrors[field];
      
      if ((field === "name" || field === "email" || field === "password" || field === "confirmPassword") && 
          typeof value === "string") {
        const error = validateField(field, value);
        if (error) {
          newErrors[field] = error;
        }
      }
    }
    setErrors(newErrors);
  }

  const handleSubmit = async () => {
    const currentStepFields = stepFields[currentStepIndex];
    const validationErrors: Partial<Record<keyof FormItems, string>> = {};
  
    // Step-by-step validation
    for (const field of currentStepFields) {
      const value = formData[field];
      if (!value) {
        validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (
        field === "name" ||
        field === "email" ||
        field === "password" ||
        field === "confirmPassword"
      ) {
        const error = validateField(field, value);
        if (error) validationErrors[field] = error;
      }
  
      if (field === "confirmPassword") {
        if (formData.confirmPassword !== formData.password) {
          validationErrors.confirmPassword = "Passwords do not match";
        }
      }
    }
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }
  
    // If not last step, proceed to next
    if (!isLastStep) {
      nextStep();
      return;
    }
  
    // Final submission using TanStack Query
    setRegistrationStatus('loading');
    
    try {
      // Clear previous errors
      setErrors({});
      
      // Prepare data for API call
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registrationData } = formData;
      
      // Ensure all required fields are present and not empty
      const cleanedData = {
        name: registrationData.name.trim(),
        email: registrationData.email.trim().toLowerCase(),
        password: registrationData.password,
        province: registrationData.province.trim(),
        district: registrationData.district.trim(),
        hospital: registrationData.hospital.trim(),
      };
      
      console.log('Submitting registration data:', cleanedData);
      
      const result = await register(cleanedData as RegisterInput);
      
      console.log('Registration result:', result);
      console.log('Result success:', result.success);
      console.log('Result errors:', result.errors);
      console.log('Result serverError:', result.serverError);
      
      if (result.success) {
        setRegistrationStatus('success');
        toast.success("🎉 Registration successful! Redirecting to sign in...");
        
        // Clear the store
        setOnboardingData({
          name: "",
          email: "",
          province: "",
          district: "",
          hospital: "",
        });
        
        // Reset form
        reset();
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      } else {
        setRegistrationStatus('error');
        
        // Handle API errors
        if (result.errors) {
          const formErrors: Partial<Record<keyof FormItems, string>> = {};
          
          // Convert array errors to strings
          Object.entries(result.errors).forEach(([field, errorArray]) => {
            if (Array.isArray(errorArray) && errorArray.length > 0) {
              formErrors[field as keyof FormItems] = errorArray[0];
            }
          });
          
          setErrors(formErrors);
          
          // Show toast for first error
          const firstError = Object.values(formErrors)[0];
          if (firstError) {
            toast.error(firstError);
          }
        } else if (result.serverError) {
          toast.error(result.serverError);
        } else {
          toast.error("Registration failed. Please try again.");
        }
      }
      
    } catch (error) {
      setRegistrationStatus('error');
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const CurrentStepComponent = formSteps[currentStepIndex].component;

  // Pass props to current step component
  const stepProps = {
    formData,
    updateForm,
    errors,
    goTo,
    isSubmitting: isMutationLoading || registrationStatus === 'loading',
    ...(currentStepIndex === 1 && { districts, hospitals, isLoading })
  };

  return (
    <div
      className={cn(
        "flex justify-between w-11/12 max-w-4xl relative m-1 rounded-lg bg-card dark:bg-transparent p-4",
        currentStepIndex === 1 ? "h-[600px] md:h-[500px]" : "h-[500px]"
      )}
    >
      {!showSuccessMsg && (
        <SideBar 
          currentStepIndex={currentStepIndex} 
          goTo={goTo}
          items={formSteps.map(step => ({
            id: step.id,
            label: step.label,
            step: formSteps.findIndex(s => s.id === step.id) + 1
          }))}
        />
      )}
      <main className={cn(
        showSuccessMsg ? "w-full" : "w-full md:mt-5 md:w-[65%]"
      )}>
        {showSuccessMsg ? (
          <AnimatePresence mode="wait">
            <SuccessMessage />
          </AnimatePresence>
        ) : (
          <FormWrapper
            isSubmitting={isMutationLoading || registrationStatus === 'loading'}
            onSubmit={handleSubmit}
            onBack={() => goTo(currentStepIndex - 1)}
            canGoBack={!isFirstStep}
            buttonLabel={
              isLastStep 
                ? (isMutationLoading || registrationStatus === 'loading')
                  ? "Registering..." 
                  : "Confirm"
                : "Next Step"
            }
            buttonClassName={cn(
              "transition-colors",
              isLastStep ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700",
              (isMutationLoading || registrationStatus === 'loading') && "opacity-50 cursor-not-allowed"
            )}
          >
            <AnimatePresence mode="wait">
              <CurrentStepComponent
                key={`step-${currentStepIndex}`}
                {...stepProps}
              />
            </AnimatePresence>
          </FormWrapper>
        )}
      </main>
    </div>
  );
} 