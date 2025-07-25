// ===========================================
// AUTHENTICATION TYPES & INTERFACES
// ===========================================

// ---------------- LOGIN ----------------
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data?: {
    id: string;
    username: string;
    email: string;
    role: string;
    phone_number: string;
    institution: string;
    address: string;
    city: string;
    province: string;
    points: number;
    balance: number;
    location: {
      latitude: number;
      longitude: number;
    };
    is_email_verified: boolean;
    access_token: string;
    refresh_token: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

// ---------------- REGISTER ----------------
export interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  username: string;
  phone_number: string;
  institution: string;
  institution_id: string;
  address: string;
  city: string;
  province: string;
  location: {
    latitude: number;
    longitude: number;
  };
  is_accepting_customer: boolean; // Indicates if the user accepts customer requests
}

export interface RegisterFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSubmit: (submitData: FormData) => Promise<void>;
  loading: boolean;
  error: string;
}

export interface RegisterResponse {
  data?: {
    id: string;
    email: string;
    role: string;
    username: string;
    phone_number: string;
    institution?: string;
    address: string;
    city: string;
    province: string;
    points: number;
    balance: number;
    location?: {
      latitude: number;
      longitude: number;
    };
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

// ---------------- SHARED ----------------
export interface User {
  id: string;
  email: string;
  role: string;
  username?: string;
  phone_number?: string;
  institution?: string;
  address?: string;
  city?: string;
  province?: string;
  points?: number;
  balance?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  is_email_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}
