import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

export interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (user: User, token: string) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// Real API call for authentication
const loginAPI = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });

    if (response.data.status !== "success") {
      throw new Error(response.data.message || "Login failed");
    }

    const { token, user: apiUser } = response.data.data;

    // Transform API user to match our interface
    const user: User = {
      id: apiUser.id,
      uuid: `user-${apiUser.id}`, // Generate UUID from ID for compatibility
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role,
      isActive: true,
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { user, token };
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "Login failed");
  }
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      loginWithCredentials: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const { user, token } = await loginAPI(email, password);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || "Login failed",
            user: null,
            token: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "beyblade-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
