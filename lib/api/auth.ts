import { ApiRegisterInput } from '@/lib/db/schema';

// Base URL for API calls
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-domain.com' 
  : typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}` 
    : 'http://localhost:3000';

// API Response types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: Record<string, string[]>;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    province: string;
    district: string;
    hospital: string;
    createdAt: string;
  };
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    province: string;
    district: string;
    hospital: string;
    createdAt: string;
  };
  token: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface LogoutResponse {
  message: string;
}

// Input types
export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API client
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  console.log('🌐 Making API call to:', url);
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  console.log('📡 Response status:', response.status);
  
  const data = await response.json();
  console.log('📄 Response data:', data);

  if (!response.ok) {
    console.log('❌ API call failed with status:', response.status);
    throw new ApiError(
      data.error || 'An error occurred',
      response.status,
      data.details
    );
  }

  return data;
}

// Auth API functions
export const authApi = {
  register: async (userData: ApiRegisterInput): Promise<RegisterResponse> => {
    return apiClient<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: LoginInput): Promise<LoginResponse> => {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<LogoutResponse> => {
    return apiClient<LogoutResponse>('/auth/logout', {
      method: 'POST',
    });
  },

  forgotPassword: async (data: ForgotPasswordInput): Promise<ForgotPasswordResponse> => {
    return apiClient<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resetPassword: async (data: ResetPasswordInput): Promise<ResetPasswordResponse> => {
    return apiClient<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
}; 