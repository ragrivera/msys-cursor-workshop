import { createContext } from "react";

export type AuthContextType = {
  isInitialized: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
