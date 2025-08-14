export type DashboardStat = {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
};

export type QuickAction = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
};
