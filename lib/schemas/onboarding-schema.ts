import { z } from "zod";

export const onboardingFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  province: z.string()
    .min(1, "Please select a province"),
  district: z.string()
    .min(1, "Please select a district"),
  hospital: z.string()
    .min(1, "Please select a hospital")
});

export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;
export type OnboardingFormErrors = Partial<Record<keyof OnboardingFormData, string>>;

export const formFields = [
  {
    id: "province",
    label: "Work Province",
    type: "select" as const,
    required: true,
    placeholder: "Select a province"
  },
  {
    id: "district",
    label: "Work District",
    type: "select" as const,
    required: true,
    placeholder: "Select a district"
  },
  {
    id: "hospital",
    label: "Hospital",
    type: "select" as const,
    required: true,
    placeholder: "Select a hospital"
  }
] as const; 