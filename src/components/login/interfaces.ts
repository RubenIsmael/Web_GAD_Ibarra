// components/login/interfaces.ts

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: User;
}

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number; 
}

export interface LoginPageProps {
  onLogin: (success: boolean, token?: string) => void;
}

export type ServerStatus = 'checking' | 'connected' | 'disconnected';