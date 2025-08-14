import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import type { Tournament } from "../hooks/_useCreateTournament";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const fetchTournaments = async (token?: string): Promise<Tournament[]> => {
  const { data } = await axios.get(`${API_BASE}/tournaments`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return data;
};

export const useTournamentsQuery = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ["tournaments"],
    queryFn: () => fetchTournaments(token || undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!token, // Only fetch when authenticated
  });
};
