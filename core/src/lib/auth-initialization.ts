import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

export async function initializeAuth(
  token: string,
  logout: () => void,
  setError: (error: string | null) => void
) {
  if (!token) {
    return;
  }

  try {
    setError(null);

    // Verify the token with the server
    const response = await axios.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === "success") {
      console.log(
        "Authentication verified for user:",
        response.data.data.user.email
      );
      // Token is valid, user data might be updated from server
    } else {
      throw new Error("Token validation failed");
    }
  } catch (error) {
    console.error("Authentication verification failed:", error);
    // Token is invalid, clear auth state
    logout();
  }
}
