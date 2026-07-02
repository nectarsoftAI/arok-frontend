import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../api/types';

interface User {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: User | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (res: AuthResponse) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (res) =>
        set({
          token: res.access_token,
          refreshToken: res.refresh_token,
          expiresAt: res.expires_at,
          user: {
            id: res.user.id,
            email: res.user.email,
            displayName: res.user.user_metadata.display_name ?? '',
          },
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          expiresAt: null,
          user: null,
          isAuthenticated: false,
        }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'auth-storage',
      // hasHydrated는 런타임 플래그이므로 persist 대상에서 제외
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
