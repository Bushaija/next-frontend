import { z } from "zod";
import { FormItems } from "@/constants/form-items";

// Define the fields we want to validate
type ValidatedFields = "name" | "email" | "password" | "confirmPassword";

const fieldSchemas = {
  name: z.string()
    .min(3, "Name should be at least 3 characters long")
    .max(50, "Name should be no longer than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string()
    .min(8, "Password must be at least 8 characters long")
};

export const formSchema = z.object(fieldSchemas).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type FormErrors = Partial<Record<ValidatedFields, string>>;

export function validateField(field: ValidatedFields, value: string): string {
  try {
    fieldSchemas[field].parse(value);
    return "";
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0].message;
    }
    return "Invalid value";
  }
}

export function validateForm(data: Partial<Pick<FormItems, ValidatedFields>>): FormErrors {
  try {
    formSchema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.reduce((acc, err) => {
        const path = err.path[0] as ValidatedFields;
        acc[path] = err.message;
        return acc;
      }, {} as FormErrors);
    }
    return {};
  }
} 