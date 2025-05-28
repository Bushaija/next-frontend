"use server";
import { redirect } from "next/navigation";
import { registerUser } from "@/app/openapi-client/sdk.gen";
import { getErrorMessage } from "@/lib/utils";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  province: z.string().min(1, "Province is required"),
  district: z.string().min(1, "District is required"),
  hospital: z.string().min(1, "Hospital is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function register(prevState: unknown, formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    province: formData.get("province") as string,
    district: formData.get("district") as string,
    hospital: formData.get("hospital") as string,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    name,
    email,
    password,
    confirmPassword,
    province,
    district,
    hospital,
  } = validatedFields.data;

  try {
    const response = await registerUser({
      body: {
        name,
        email,
        password,
        confirmPassword,
        province,
        district,
        hospital,
      },
    });

    // Check if registration was successful
    if (!response.data) {
      return { 
        server_validation_error: "Registration failed. Please try again." 
      };
    }

    console.log("User registered successfully:", response.data);
    
  } catch (err: any) {
    console.error("Registration error:", err);
    
    // Handle specific API errors
    if (err?.response?.status === 400) {
      const errorDetail = err.response.data?.detail;
      
      if (errorDetail === "The user with this email already exists in the system") {
        return {
          errors: {
            email: ["An account with this email already exists"]
          }
        };
      }
      
      if (errorDetail === "Password and confirm password do not match") {
        return {
          errors: {
            confirmPassword: ["Passwords do not match"]
          }
        };
      }
      
      // Handle other validation errors from the server
      if (typeof errorDetail === "string") {
        return { 
          server_validation_error: errorDetail 
        };
      }
    }
    
    if (err?.response?.status === 422) {
      // Handle validation errors from FastAPI
      const validationErrors = err.response.data?.detail;
      if (Array.isArray(validationErrors)) {
        const fieldErrors: Record<string, string[]> = {};
        validationErrors.forEach((error: any) => {
          const field = error.loc?.[error.loc.length - 1];
          if (field) {
            fieldErrors[field] = fieldErrors[field] || [];
            fieldErrors[field].push(error.msg);
          }
        });
        return { errors: fieldErrors };
      }
    }

    return {
      server_error: "An unexpected error occurred. Please try again later.",
    };
  }

  redirect(`/sign-in`);
}