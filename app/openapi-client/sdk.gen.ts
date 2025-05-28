// This file is auto-generated based on FastAPI routes
import {
  createClient,
  createConfig,
  type OptionsLegacyParser,
} from "@hey-api/client-axios";
import type {
  LoginRequest,
  LoginResponse,
  Token,
  UserPublic,
  Message,
  NewPassword,
  OAuth2PasswordRequest,
  SignupRequest,
  UserUpdateMe,
  HospitalResponse,
  ErrorResponse,
} from "./types.gen";

export const client = createClient(createConfig({
  baseURL: 'http://localhost:8000'
}));

export const usersCurrentUser = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<void, ThrowOnError>,
) => {
  return (options?.client ?? client).get<
    UserPublic,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    url: "/api/v1/users/me",
  });
};

/**
 * POST /api/v1/login/access-token
 * OAuth2 compatible token login, get an access token for future requests
 */
export const loginAccessToken = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<OAuth2PasswordRequest, ThrowOnError>,
) => {
  // Convert to form data for OAuth2 endpoint
  const formData = new FormData();
  if (options.body) {
    formData.append('username', options.body.username);
    formData.append('password', options.body.password);
    if (options.body.grant_type) formData.append('grant_type', options.body.grant_type);
    if (options.body.scope) formData.append('scope', options.body.scope);
    if (options.body.client_id) formData.append('client_id', options.body.client_id);
    if (options.body.client_secret) formData.append('client_secret', options.body.client_secret);
  }

  return (options?.client ?? client).post<
    Token,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...options?.headers,
    },
    url: "/api/v1/login/access-token",
  });
};

/**
 * POST /api/v1/login
 * JSON-based login for frontend applications
 * Returns access token and user information
 */
export const loginForFrontend = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<LoginRequest, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    LoginResponse,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/api/v1/login",
  });
};

/**
 * POST /api/v1/login/test-token
 * Test access token
 */
export const testToken = <ThrowOnError extends boolean = false>(
  options?: OptionsLegacyParser<void, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    UserPublic,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Authorization": `Bearer ${options?.headers?.Authorization || ''}`,
      ...options?.headers,
    },
    url: "/api/v1/login/test-token",
  });
};

/**
 * POST /api/v1/logout
 * Logout current user
 * Note: Stateless JWT tokens cannot be invalidated server-side.
 * Client should discard the token.
 */
export const logout = <ThrowOnError extends boolean = false>(
  options?: OptionsLegacyParser<void, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    Message,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Authorization": `Bearer ${options?.headers?.Authorization || ''}`,
      ...options?.headers,
    },
    url: "/api/v1/logout",
  });
};

/**
 * POST /api/v1/password-recovery/{email}
 * Password Recovery
 */
export const recoverPassword = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<{ email: string }, ThrowOnError>,
) => {
  const { email } = options.body || {};
  return (options?.client ?? client).post<
    Message,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    body: undefined, // Email is in URL path, not body
    url: `/api/v1/password-recovery/${encodeURIComponent(email || '')}`,
  });
};

/**
 * POST /api/v1/reset-password/
 * Reset password
 */
export const resetPassword = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<NewPassword, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    Message,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/api/v1/reset-password/",
  });
};

/**
 * POST /api/v1/password-recovery-html-content/{email}
 * HTML Content for Password Recovery (Superuser only)
 */
export const recoverPasswordHtmlContent = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<{ email: string }, ThrowOnError>,
) => {
  const { email } = options.body || {};
  return (options?.client ?? client).post<
    string, // HTML content
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    body: undefined, // Email is in URL path, not body
    headers: {
      "Authorization": `Bearer ${options?.headers?.Authorization || ''}`,
      ...options?.headers,
    },
    url: `/api/v1/password-recovery-html-content/${encodeURIComponent(email || '')}`,
  });
};

// Helper function to set authorization header for authenticated requests
export const setAuthToken = (token: string) => {
  client.setConfig({
    ...client.getConfig(),
    headers: {
      ...client.getConfig().headers,
      Authorization: `Bearer ${token}`,
    }
  });
};

// Helper function to clear authorization header
export const clearAuthToken = () => {
  const config = client.getConfig();
  if (config.headers) {
    delete config.headers.Authorization;
  }
  client.setConfig(config);
};

/**
 * POST /api/v1/users/signup
 * Create new user without the need to be logged in.
 * Handles frontend signup format with province/district/hospital names.
 */
export const registerUser = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<SignupRequest, ThrowOnError>,
) => {
  return (options?.client ?? client).post<
    UserPublic,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    url: "/api/v1/users/signup",
  });
};

/**
 * PATCH /api/v1/users/me
 * Update own user.
 */
export const updateUserMe = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<UserUpdateMe, ThrowOnError>,
) => {
  return (options?.client ?? client).patch<
    UserPublic,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${options?.headers?.Authorization || ''}`,
      ...options?.headers,
    },
    url: "/api/v1/users/me",
  });
};

/**
 * GET /api/v1/hospitals/{hospital_id}
 * Get hospital by hospital_id.
 */
export const getHospitalById = <ThrowOnError extends boolean = false>(
  options: OptionsLegacyParser<{ hospital_id: string }, ThrowOnError>,
) => {
  const { hospital_id } = options.body || {};
  return (options?.client ?? client).get<
    HospitalResponse,
    ErrorResponse,
    ThrowOnError
  >({
    ...options,
    body: undefined, // ID is in URL path, not body
    url: `/api/v1/hospitals/${encodeURIComponent(hospital_id || '')}`,
  });
};

// Legacy export for backward compatibility
export const authJwtLogin = loginForFrontend;