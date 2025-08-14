import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import { processApiError } from "@/lib/error-handling";
import { logDetailedError } from "@/lib/debug-error-helper";

export type Tournament = {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  arena_id: number;
  max_participants: number;
  format: "single-elimination" | "double-elimination" | "round-robin";
  prize?: string;
  status: "upcoming" | "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  // Joined data
  arena_name?: string;
  participant_count?: number;
};

export type CreateTournamentData = {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  arena_id: number;
  max_participants: number;
  format: "single-elimination" | "double-elimination" | "round-robin";
  prize?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const createTournament = async (
  data: CreateTournamentData & { token?: string }
) => {
  const { token, ...tournamentData } = data;

  const response = await axios.post(`${API_BASE}/tournaments`, tournamentData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreateTournamentData) =>
      createTournament({ ...data, token: token || undefined }),
    onSuccess: (newTournament: Tournament) => {
      console.log("Tournament created successfully:", newTournament);

      // Optimistically update the cache with the new tournament
      queryClient.setQueryData(
        ["tournaments"],
        (oldData: Tournament[] | undefined) => {
          return oldData ? [...oldData, newTournament] : [newTournament];
        }
      );

      // Invalidate and refetch to ensure consistency with backend
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });

      toast.success("Tournament created successfully!");
    },
    onError: (error: unknown) => {
      // Log detailed error information for debugging
      logDetailedError(error, "CREATE_TOURNAMENT", {
        endpoint: `${API_BASE}/tournaments`,
        action: "create tournament",
      });

      const processedError = processApiError(error, "CREATE_TOURNAMENT");
      toast.error(processedError.message);
    },
  });
};
