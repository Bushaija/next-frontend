"use client";

import { ReactNode, useMemo } from "react";
import { AuthProvider, useRequireAuth, User } from "@/lib/context/auth-context";
import { Toaster } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AuthLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

// Loading component for auth state
function AuthLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Error component for unauthorized access
function UnauthorizedPage({ message = "You are not authorized to access this page." }: { message?: string }) {
  const router = useRouter();
  
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Alert variant="destructive" className="w-[400px]">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push("/sign-in")}
        >
          Return to Sign In
        </Button>
      </Alert>
    </div>
  );
}

// Role-based access control check
function hasRequiredRole(user: User | null, allowedRoles?: string[]): boolean {
  if (!allowedRoles?.length) return true;
  if (!user) return false;
  
  // Add role check based on your user model
  // For now, we'll use is_superuser as an example
  return user.is_superuser || allowedRoles.includes("user");
}

// Protected content wrapper with role-based access
function ProtectedContent({ 
  children, 
  // allowedRoles 
}: { 
  children: ReactNode;
  allowedRoles?: string[];
}) {
  const { user, isLoading, isAuthenticated } = useRequireAuth();
  const router = useRouter();

  // Handle loading state
  if (isLoading) {
    return <AuthLoading />;
  }

  // Handle unauthenticated state
  if (!isAuthenticated) {
    router.push("/sign-in");
    return <AuthLoading />;
  }

  // Handle unauthorized role
  // if (!hasRequiredRole(user, allowedRoles)) {
  //   return (
  //     <UnauthorizedPage 
  //       message="You don't have the required permissions to access this page." 
  //     />
  //   );
  // }

  // Handle unexpected error state
  if (!user) {
    return (
      <UnauthorizedPage 
        message="There was an error loading your user data. Please try signing in again." 
      />
    );
  }

  return <>{children}</>;
}

export function AuthLayout({ 
  children, 
  requireAuth = true,
  allowedRoles 
}: AuthLayoutProps) {
  // Memoize the content to prevent unnecessary re-renders
  const content = useMemo(() => {
    if (!requireAuth) return children;
    
    return (
      <ProtectedContent allowedRoles={allowedRoles}>
        {children}
      </ProtectedContent>
    );
  }, [children, requireAuth, allowedRoles]);

  return (
    <AuthProvider>
      <Toaster position="top-right" />
      {content}
    </AuthProvider>
  );
}

// Optional: Export a simpler wrapper for non-protected routes
export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      {children}
    </AuthProvider>
  );
} 