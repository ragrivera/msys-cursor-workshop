export type Arena = {
  id: number;
  name: string;
  capacity: number;
  currentBookings: number;
  status: "active" | "maintenance" | "inactive";
  nextEvent?: {
    title: string;
    time: string;
  };
};
