import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth-store";
import type { Appointment } from "./_useAppointmentsQuery";
import { processApiError } from "@/lib/error-handling";
import { logDetailedError } from "@/lib/debug-error-helper";

type CreateAppointmentData = {
  arena_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const createAppointment = async (
  data: CreateAppointmentData & { token?: string }
) => {
  const { token, ...appointmentData } = data;

  const response = await axios.post(
    `${API_BASE}/appointments`,
    appointmentData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data.data || response.data;
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (data: CreateAppointmentData) =>
      createAppointment({ ...data, token: token || undefined }),
    onSuccess: (newAppointment: Appointment) => {
      console.log("Appointment created successfully:", newAppointment);

      // Optimistically update the cache with the new appointment
      queryClient.setQueryData(
        ["appointments"],
        (oldData: Appointment[] | undefined) => {
          return oldData ? [...oldData, newAppointment] : [newAppointment];
        }
      );

      // Invalidate and refetch to ensure consistency with backend
      queryClient.invalidateQueries({ queryKey: ["appointments"] });

      toast.success("Appointment created successfully!");
    },
    onError: (error: unknown) => {
      // Log detailed error information for debugging
      logDetailedError(error, "CREATE_APPOINTMENT", {
        endpoint: `${API_BASE}/appointments`,
        action: "create appointment",
      });

      const processedError = processApiError(error, "CREATE_APPOINTMENT");
      toast.error(processedError.message);
    },
  });
};
