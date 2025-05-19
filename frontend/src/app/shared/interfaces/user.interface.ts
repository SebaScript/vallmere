export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'client';
  profilePicture?: string;
  shippingAddress?: string;
  billingAddress?: string;
  token?: string; // JWT token for authentication
}
