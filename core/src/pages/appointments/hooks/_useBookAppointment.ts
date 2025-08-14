import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

type BookingData = {
  appointmentId: number;
  participantId: number;
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const bookAppointment = async (data: BookingData) => {
  const response = await axios.post(`${API_BASE}/participants/book`, data, {
    headers: {
      Authorization: `Bearer demo-token`, // TODO: replace with real auth
    },
  });
  return response.data;
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Appointment booked successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    },
  });
};
