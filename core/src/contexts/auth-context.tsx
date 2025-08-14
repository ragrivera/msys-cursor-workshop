import React, { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { initializeAuth } from "@/lib/auth-initialization";
import { AuthContext, type AuthContextType } from "./auth-context-definition";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, user, login, logout, setError } = useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize authentication state on app load
  useEffect(() => {
    async function runAuthInit() {
      await initializeAuth(token || "", logout, setError);
      setIsInitialized(true);
    }

    runAuthInit();
  }, [token, user, login, logout, setError]);

  const value: AuthContextType = {
    isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
