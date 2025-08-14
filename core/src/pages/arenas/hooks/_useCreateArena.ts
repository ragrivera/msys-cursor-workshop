import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import type { Arena } from "./_useArenasQuery";

type CreateArenaData = {
  name: string;
  capacity: number;
  location?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const createArena = async (data: CreateArenaData & { token?: string }) => {
  const { token, ...arenaData } = data;

  const response = await axios.post(`${API_BASE}/arenas`, arenaData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};

export const useCreateArena = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreateArenaData) =>
      createArena({ ...data, token: token || undefined }),
    onSuccess: (newArena: Arena) => {
      console.log("Arena created successfully:", newArena);

      // Optimistically update the cache with the new arena
      queryClient.setQueryData(["arenas"], (oldData: Arena[] | undefined) => {
        return oldData ? [...oldData, newArena] : [newArena];
      });

      // Invalidate and refetch to ensure consistency with backend
      queryClient.invalidateQueries({ queryKey: ["arenas"] });

      toast.success("Arena created successfully!");
    },
    onError: (error: unknown) => {
      console.error("Error creating arena:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        axiosError?.response?.data?.message || "Failed to create arena"
      );
    },
  });
};
