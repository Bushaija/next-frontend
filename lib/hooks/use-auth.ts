import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { 
  authApi, 
  RegisterResponse, 
  LoginResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  ApiError,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput 
} from '@/lib/api/auth';
import { ApiRegisterInput } from '@/lib/db/schema';

// Registration mutation hook
export function useRegisterMutation(): UseMutationResult<
  RegisterResponse,
  ApiError,
  ApiRegisterInput,
  unknown
> {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      console.log('Registration successful:', data);
    },
    onError: (error: ApiError) => {
      console.error('Registration failed:', error);
    },
  });
}

// Login mutation hook
export function useLoginMutation(): UseMutationResult<
  LoginResponse,
  ApiError,
  LoginInput,
  unknown
> {
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log('Login successful:', data);
      // Store token in localStorage/cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    },
    onError: (error: ApiError) => {
      console.error('Login failed:', error);
    },
  });
}

// Forgot password mutation hook
export function useForgotPasswordMutation(): UseMutationResult<
  ForgotPasswordResponse,
  ApiError,
  ForgotPasswordInput,
  unknown
> {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (data) => {
      console.log('Forgot password email sent:', data);
    },
    onError: (error: ApiError) => {
      console.error('Forgot password failed:', error);
    },
  });
}

// Reset password mutation hook
export function useResetPasswordMutation(): UseMutationResult<
  ResetPasswordResponse,
  ApiError,
  ResetPasswordInput,
  unknown
> {
  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: (data) => {
      console.log('Password reset successful:', data);
    },
    onError: (error: ApiError) => {
      console.error('Password reset failed:', error);
    },
  });
}

// Type for form errors compatible with your existing form
export interface FormErrors {
  name?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
  province?: string[];
  district?: string[];
  hospital?: string[];
  token?: string[];
}

// Helper function to convert API error to form errors
export function convertApiErrorToFormErrors(error: ApiError): FormErrors {
  if (error.details) {
    return error.details;
  }
  
  // Handle specific error cases
  if (error.status === 400 && error.message.includes('User already exists')) {
    return {
      email: ['An account with this email already exists'],
    };
  }
  
  if (error.status === 401) {
    return {
      email: ['Invalid email or password'],
      password: ['Invalid email or password'],
    };
  }
  
  return {};
}

// Enhanced hook with form integration for registration
export function useRegisterForm() {
  const mutation = useRegisterMutation();
  
  const register = async (data: ApiRegisterInput) => {
    try {
      console.log('🚀 Starting registration with data:', data);
      const result = await mutation.mutateAsync(data);
      console.log('✅ Registration API success:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Registration API error:', error);
      
      if (error instanceof ApiError) {
        console.log('📝 API Error details:', {
          message: error.message,
          status: error.status,
          details: error.details
        });
        return {
          success: false,
          errors: convertApiErrorToFormErrors(error),
          serverError: error.message,
        };
      }
      
      // Log unknown errors
      console.error('🔥 Unknown error type:', error);
      
      return {
        success: false,
        serverError: 'An unexpected error occurred',
      };
    }
  };
  
  return {
    register,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// Enhanced hook with form integration for login
export function useLoginForm() {
  const mutation = useLoginMutation();
  
  const login = async (data: LoginInput) => {
    try {
      console.log('🚀 Starting login with email:', data.email);
      const result = await mutation.mutateAsync(data);
      console.log('✅ Login API success:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Login API error:', error);
      
      if (error instanceof ApiError) {
        console.log('📝 Login API Error details:', {
          message: error.message,
          status: error.status,
          details: error.details
        });
        return {
          success: false,
          errors: convertApiErrorToFormErrors(error),
          serverError: error.message,
        };
      }
      
      return {
        success: false,
        serverError: 'An unexpected error occurred',
      };
    }
  };
  
  return {
    login,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// Enhanced hook with form integration for forgot password
export function useForgotPasswordForm() {
  const mutation = useForgotPasswordMutation();
  
  const forgotPassword = async (data: ForgotPasswordInput) => {
    try {
      console.log('🚀 Starting forgot password for email:', data.email);
      const result = await mutation.mutateAsync(data);
      console.log('✅ Forgot password API success:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Forgot password API error:', error);
      
      if (error instanceof ApiError) {
        console.log('📝 Forgot password API Error details:', {
          message: error.message,
          status: error.status,
          details: error.details
        });
        return {
          success: false,
          errors: convertApiErrorToFormErrors(error),
          serverError: error.message,
        };
      }
      
      return {
        success: false,
        serverError: 'An unexpected error occurred',
      };
    }
  };
  
  return {
    forgotPassword,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// Enhanced hook with form integration for reset password
export function useResetPasswordForm() {
  const mutation = useResetPasswordMutation();
  
  const resetPassword = async (data: ResetPasswordInput) => {
    try {
      console.log('🚀 Starting password reset');
      const result = await mutation.mutateAsync(data);
      console.log('✅ Password reset API success:', result);
      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Password reset API error:', error);
      
      if (error instanceof ApiError) {
        console.log('📝 Password reset API Error details:', {
          message: error.message,
          status: error.status,
          details: error.details
        });
        return {
          success: false,
          errors: convertApiErrorToFormErrors(error),
          serverError: error.message,
        };
      }
      
      return {
        success: false,
        serverError: 'An unexpected error occurred',
      };
    }
  };
  
  return {
    resetPassword,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
} 