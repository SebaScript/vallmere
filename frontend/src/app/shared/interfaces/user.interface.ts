export interface User {
  userId?: number;
  name: string;
  email: string;
  password?: string;
  role?: 'admin' | 'client';
  carts?: any[];
  orders?: any[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'client';
}
