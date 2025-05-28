"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usersCurrentUser } from "@/app/clientService";
import Cookies from "js-cookie";

// Auth-related cookie names
const AUTH_COOKIES = {
  ACCESS_TOKEN: "client_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

// Debug logging utility with proper types
const debugLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log("[AuthContext]", ...args);
  }
};

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility to clear all auth-related cookies
const clearAuthCookies = () => {
  Object.values(AUTH_COOKIES).forEach(cookieName => {
    Cookies.remove(cookieName, { path: "/" });
  });
  debugLog("Cleared auth cookies");
};

// Utility to check if a token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // If we can't parse the token, consider it expired
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to fetch current user data with token validation
  const fetchUser = async () => {
    const accessToken = Cookies.get(AUTH_COOKIES.ACCESS_TOKEN);
    console.log("Access token:", accessToken);
    
    if (!accessToken) {
      debugLog("No access token found");
      setUser(null);
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      debugLog("Access token expired");
      clearAuthCookies();
      setUser(null);
      router.push("/sign-in");
      return null;
    }

    try {
      const userData = await usersCurrentUser({
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setUser(userData);
      debugLog("User data fetched successfully", userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      
      // Handle specific error cases
      if (error instanceof Response && error.status === 401) {
        debugLog("Unauthorized - clearing auth state");
        clearAuthCookies();
        setUser(null);
        router.push("/sign-in");
      } else {
        toast.error("Failed to fetch user data");
      }
      
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Initial user fetch
  useEffect(() => {
    fetchUser();
  }, []);

  // Login function with refresh token support
  const login = async (accessToken: string, refreshToken?: string) => {
    try {
      // Set tokens in cookies with secure options
      Cookies.set(AUTH_COOKIES.ACCESS_TOKEN, accessToken, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
      });

      if (refreshToken) {
        Cookies.set(AUTH_COOKIES.REFRESH_TOKEN, refreshToken, {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict"
        });
      }
      
      debugLog("Auth tokens set");
      
      // Fetch user data
      const userData = await fetchUser();
      
      if (userData) {
        toast.success("Logged in successfully");
        router.push("/dashboard/home");
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Login error:", error);
      clearAuthCookies();
      toast.error("Login failed");
      throw error;
    }
  };

  // Logout function with complete cleanup
  const logout = async () => {
    try {
      // Clear all auth-related cookies
      clearAuthCookies();
      
      // Clear user state
      setUser(null);
      
      debugLog("User logged out");
      toast.success("Logged out successfully");
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
      throw error;
    }
  };

  // Refresh user data with token validation
  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const accessToken = Cookies.get(AUTH_COOKIES.ACCESS_TOKEN);
      
      if (!accessToken || isTokenExpired(accessToken)) {
        debugLog("Token expired during refresh");
        await logout();
        return;
      }

      await fetchUser();
    } catch (error) {
      console.error("Error refreshing user:", error);
      toast.error("Failed to refresh user data");
    } finally {
      setIsLoading(false);
    }
  };

  // Periodic token validation
  useEffect(() => {
    const validateToken = () => {
      const accessToken = Cookies.get(AUTH_COOKIES.ACCESS_TOKEN);
      if (accessToken && isTokenExpired(accessToken)) {
        debugLog("Token expired during periodic check");
        logout();
      }
    };

    // Check token every 5 minutes
    const interval = setInterval(validateToken, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  debugLog("AuthContext state:", { 
    isAuthenticated: !!user, 
    isLoading,
    userId: user?.id 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Custom hook for protected routes with automatic refresh
export function useRequireAuth() {
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      debugLog("Unauthenticated access attempt");
      toast.error("Please sign in to access this page");
      router.push("/sign-in");
    }
  }, [isLoading, isAuthenticated, router]);

  // Refresh user data periodically while on protected routes
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(refreshUser, 15 * 60 * 1000); // Refresh every 15 minutes
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshUser]);

  return { user, isLoading, isAuthenticated };
} 