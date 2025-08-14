export type ChartDataPoint = {
  label: string;
  value: number;
  percentage?: number;
};

export type AnalyticsMetric = {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
};

export type RevenueData = {
  month: string;
  revenue: number;
  bookings: number;
};
