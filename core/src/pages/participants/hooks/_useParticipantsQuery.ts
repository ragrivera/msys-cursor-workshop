import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

export type Participant = {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const fetchParticipants = async (token?: string): Promise<Participant[]> => {
  try {
    const { data } = await axios.get(`${API_BASE}/participants`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error: any) {
    console.error("Failed to fetch participants:", error);

    // If user is not authenticated, return empty array
    if (!token) {
      console.warn("No authentication token available");
      return [];
    }

    // If it's an authentication error, return empty array
    if (
      error.response?.status === 401 ||
      error.message?.includes("authorization")
    ) {
      console.error("Authentication failed for participants");
      return [];
    }

    // Only fall back to mock data for network/server errors in development
    if (import.meta.env.VITE_NODE_ENV === "development") {
      console.warn("API not available in development, using mock data");
      return [
        {
          id: 1,
          name: "Valt Aoi (Mock)",
          email: "valt@example.com",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Shu Kurenai (Mock)",
          email: "shu@example.com",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    }

    return [];
  }
};

export const useParticipantsQuery = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["participants"],
    queryFn: () => fetchParticipants(token || undefined),
    refetchInterval: 60000, // Refetch every minute
  });
};
