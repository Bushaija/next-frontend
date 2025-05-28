// Auto-generated types based on FastAPI models

export interface UserBase {
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  full_name?: string | null;
}

export interface UserPublic extends UserBase {
  id: string; // UUID as string
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserPublic;
}

export interface Message {
  message: string;
}

export interface NewPassword {
  token: string;
  new_password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  province: string;
  district: string;
  hospital: string;
}

export interface UserUpdateMe {
  email?: string;
  full_name?: string;
  password?: string;
}

export interface HospitalResponse {
  id: string; // UUID as string
  name: string;
  district_id: string; // UUID as string
}

export interface ErrorResponse {
  detail: string;
}

// OAuth2 form data for access token endpoint
export interface OAuth2PasswordRequest {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}