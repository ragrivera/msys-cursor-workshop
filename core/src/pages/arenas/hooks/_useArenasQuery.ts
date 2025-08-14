import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth-store";

export type Arena = {
  id: number;
  name: string;
  capacity: number;
  location?: string;
  created_at: string;
  updated_at: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const fetchArenas = async (token?: string): Promise<Arena[]> => {
  const { data } = await axios.get(`${API_BASE}/arenas`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return data;
};

export const useArenasQuery = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["arenas"],
    queryFn: () => fetchArenas(token || undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!token, // Only fetch when authenticated
  });
};
