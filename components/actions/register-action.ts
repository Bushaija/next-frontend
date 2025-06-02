"use server";

import { redirect } from "next/navigation";
import { registerSchema } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";

// Enhanced server action that works seamlessly with TanStack Query
export async function registerWithQuery(prevState: unknown, formData: FormData) {
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

  // Instead of calling the API directly, we'll return a success state
  // and let the client-side code handle the API call via TanStack Query
  return {
    success: true,
    data: validatedFields.data,
  };
}

// Alternative: Direct API integration for server actions
export async function registerDirect(prevState: unknown, formData: FormData) {
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

  try {
    // Make API call to our Next.js API route
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    const result = await response.json();

    if (!response.ok) {
      if (result.details) {
        return {
          errors: result.details,
        };
      }
      
      return {
        server_error: result.error || 'Registration failed. Please try again.',
      };
    }

    // Revalidate the path to clear any cached data
    revalidatePath('/');
    
    console.log("User registered successfully:", result.user);
    
  } catch (error) {
    console.error("Registration error:", error);
    return {
      server_error: "An unexpected error occurred. Please try again later.",
    };
  }

  redirect(`/sign-in`);
} 