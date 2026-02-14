import { create } from 'zustand';
import type { AwsCredentials } from '@/lib/cognito';

interface User {
  username: string;
  email: string;
  groups: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  canRead: boolean;
  canWrite: boolean;
  canModify: boolean;
  credentials: AwsCredentials | null;
  idToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setCredentials: (creds: AwsCredentials) => void;
  setTokens: (idToken: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  canRead: false,
  canWrite: false,
  canModify: false,
  credentials: null,
  idToken: null,
  refreshToken: null,
  setUser: (user) => set({
    user,
    isAuthenticated: !!user,
    canRead: !!user,
    canWrite: user?.groups?.some(g => ['Creator', 'Admin'].includes(g)) ?? false,
    canModify: user?.groups?.includes('Admin') ?? false,
  }),
  setCredentials: (credentials) => set({ credentials }),
  setTokens: (idToken, refreshToken) => set({ idToken, refreshToken }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({
    user: null, isAuthenticated: false, credentials: null,
    idToken: null, refreshToken: null,
    canRead: false, canWrite: false, canModify: false,
  }),
}));
