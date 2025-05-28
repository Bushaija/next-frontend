import { ComponentType } from "react";
import { FormItems } from "@/constants/form-items";
import UserInfoForm from "@/features/registration/user-info-form";
import FinalStep from "@/features/registration/final-step";
import LocationForm from "@/features/registration/location-form";

export interface FormStep {
  id: string;
  label: string;
  component: ComponentType<{
    formData: FormItems;
    updateForm: (data: Partial<FormItems>) => void;
    errors: Partial<Record<keyof FormItems, string>>;
    goTo?: (step: number) => void;
  }>;
}

export const formSteps: FormStep[] = [
  {
    id: "info",
    label: "Your info",
    component: UserInfoForm
  },
  {
    id: "plan",
    label: "Select location",
    component: LocationForm
  },
  {
    id: "summary",
    label: "Summary",
    component: FinalStep
  }
]; 