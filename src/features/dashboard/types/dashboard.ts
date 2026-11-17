export type DashboardMetric = {
  title: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
  icon: 'activity' | 'clock' | 'trending-up' | 'users';
};

export type DashboardActivity = {
  title: string;
  detail: string;
  time: string;
};

export type DashboardChannel = {
  label: string;
  share: number;
};
