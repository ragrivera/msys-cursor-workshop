import { lazy } from "react";

// Lazy load pages for better performance
const AppointmentsPage = lazy(() => import("@/pages/appointments"));
const ArenasPage = lazy(() => import("@/pages/arenas"));
const TournamentsPage = lazy(() => import("@/pages/tournaments"));
const ParticipantsPage = lazy(() => import("@/pages/participants"));
const AnalyticsPage = lazy(() => import("@/pages/analytics"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const LoginPage = lazy(() => import("@/pages/login"));

export const protectedRoutes = [
  {
    path: "/",
    element: DashboardPage,
    name: "Dashboard",
  },
  {
    path: "/appointments",
    element: AppointmentsPage,
    name: "Appointments",
  },
  {
    path: "/arenas",
    element: ArenasPage,
    name: "Arenas",
  },
  {
    path: "/tournaments",
    element: TournamentsPage,
    name: "Tournaments",
  },
  {
    path: "/participants",
    element: ParticipantsPage,
    name: "Participants",
  },
  {
    path: "/analytics",
    element: AnalyticsPage,
    name: "Analytics",
  },
  {
    path: "/settings",
    element: SettingsPage,
    name: "Settings",
  },
];

export const publicRoutes = [
  {
    path: "/login",
    element: LoginPage,
    name: "Login",
  },
];

// Keep the old export for backward compatibility
export const routes = protectedRoutes;
