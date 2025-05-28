// app/login/actions.ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginForFrontend } from "@/app/openapi-client/sdk.gen"; 
import { getErrorMessage } from "@/lib/utils";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function login(prevState: unknown, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const response = await loginForFrontend({
      body: {
        email,
        password,
      },
    });

    // Check if the response was successful
    if (!response.data?.access_token) {
      return { 
        errors: {
          email: ["Invalid credentials"],
          password: ["Invalid credentials"]
        }
      };
    }

    const { access_token, user } = response.data;

    // Set HTTP-only cookie for secure server operations
    const cookieStore = await cookies();
    cookieStore.set("accessToken", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Set regular cookie for client-side access
    cookieStore.set("client_token", access_token, {
      // Not HTTP-only - we need client access
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    // Optionally store user info in cookie as well
    cookieStore.set("user_info", JSON.stringify({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_active: user.is_active,
      is_superuser: user.is_superuser
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    redirect("/dashboard/home");
  } catch (err: any) {
    if ((err as Error).message === "NEXT_REDIRECT") {
      // Let Next.js handle the redirect silently
      throw err;
    }
    
    console.error("Login error:", err);
    
    // Handle specific API errors
    if (err?.response?.status === 401) {
      return {
        errors: {
          email: ["Invalid email or password"],
          password: ["Invalid email or password"]
        }
      };
    }
    
    if (err?.response?.data?.detail) {
      return {
        errors: {
          email: [err.response.data.detail],
          password: [err.response.data.detail]
        }
      };
    }

    return {
      errors: {
        email: ["An unexpected error occurred. Please try again."],
        password: ["An unexpected error occurred. Please try again."]
      }
    };
  }
}