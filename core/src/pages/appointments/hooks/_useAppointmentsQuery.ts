import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/stores/auth-store";

export type Appointment = {
  id: number;
  arena_id: number;
  start_time: string;
  end_time: string;
  title: string;
  description?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

// Static mock data that doesn't change on each call
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    arena_id: 1,
    start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    title: "Quarter Finals (Mock)",
    description: "Top 8 players face off.",
  },
  {
    id: 2,
    arena_id: 2,
    start_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    title: "Practice Session (Mock)",
    description: "Open practice for newcomers.",
  },
];

const fetchAppointments = async (
  token?: string,
  existingData?: Appointment[]
): Promise<Appointment[]> => {
  try {
    const { data } = await axios.get(`${API_BASE}/appointments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return data.data || data;
  } catch (error: unknown) {
    console.error("Failed to fetch appointments:", error);

    // If user is not authenticated, return empty array instead of mock data
    if (!token) {
      console.warn("No authentication token available");
      return [];
    }

    // If it's an authentication error, return empty array
    const axiosError = error as AxiosError;
    const errorMessage = error as Error;
    if (
      axiosError?.response?.status === 401 ||
      errorMessage?.message?.includes("authorization")
    ) {
      console.error("Authentication failed for appointments");
      return [];
    }

    // In development, merge existing cached data with mock data
    if (import.meta.env.VITE_NODE_ENV === "development") {
      console.warn("API not available in development, using mock data");
      console.log("Existing cached appointment data:", existingData);

      // If we have existing data, preserve user-created appointments (IDs > 100)
      const userCreatedAppointments =
        existingData?.filter((appointment) => appointment.id > 100) || [];

      console.log("User created appointments:", userCreatedAppointments);

      // Combine mock appointments with user-created appointments
      const combinedData = [...MOCK_APPOINTMENTS, ...userCreatedAppointments];
      console.log("Combined appointment data:", combinedData);
      return combinedData;
    }

    return [];
  }
};

export const useAppointmentsQuery = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      // Get existing cached data to preserve user-created appointments
      const existingData = queryClient.getQueryData<Appointment[]>([
        "appointments",
      ]);
      console.log(
        "Query function - existing cached appointment data:",
        existingData
      );
      const result = await fetchAppointments(token || undefined, existingData);
      console.log("Appointments query result:", result);
      return result;
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus to preserve user-created data
    refetchOnMount: false, // Don't refetch on component mount if we have cached data
  });
};
