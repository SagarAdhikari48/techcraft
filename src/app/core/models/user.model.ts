/**
 * User roles available in the merchant payments portal.
 * - SALES: creates and edits merchant applications
 * - REVIEWER: reviews assigned applications and records risk decisions
 * - ADMIN: views all applications and manages reviewer assignments
 */
export type UserRole = 'SALES' | 'REVIEWER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
}
