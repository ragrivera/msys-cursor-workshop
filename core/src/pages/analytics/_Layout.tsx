import {
  BarChart3,
  TrendingUp,
  Users,
  Trophy,
  Target,
  Clock,
  DollarSign,
} from "lucide-react";
import { AnalyticsChart } from "./components/_AnalyticsChart";

export default function AnalyticsLayout() {
  // Mock analytics data - replace with real API calls
  const bookingTrends = [
    { label: "Jan", value: 45 },
    { label: "Feb", value: 52 },
    { label: "Mar", value: 48 },
    { label: "Apr", value: 61 },
    { label: "May", value: 55 },
    { label: "Jun", value: 67 },
  ];

  const arenaUtilization = [
    { label: "Battle Dome", value: 85, color: "#3b82f6" },
    { label: "Training Ground", value: 62, color: "#10b981" },
    { label: "Championship Arena", value: 0, color: "#f59e0b" },
    { label: "Mini Arena", value: 100, color: "#ef4444" },
  ];

  const tournamentTypes = [
    { label: "Singles", value: 45, color: "#3b82f6" },
    { label: "Doubles", value: 28, color: "#10b981" },
    { label: "Team", value: 15, color: "#f59e0b" },
    { label: "Practice", value: 32, color: "#8b5cf6" },
  ];

  const peakHours = [
    { label: "9 AM", value: 12 },
    { label: "12 PM", value: 28 },
    { label: "3 PM", value: 35 },
    { label: "6 PM", value: 42 },
    { label: "9 PM", value: 18 },
  ];

  const participantGrowth = [{ label: "New Participants", value: 156 }];

  const revenue = [{ label: "Total Revenue", value: 12450 }];

  const averageSession = [{ label: "Average Duration", value: 2.5 }];

  const completionRate = [{ label: "Tournament Completion", value: 94 }];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Tournament performance insights and trends
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsChart
          title="New Participants"
          type="metric"
          data={participantGrowth}
          trend={{ direction: "up", percentage: 23 }}
          timeframe="This month"
          icon={<Users className="h-5 w-5 text-primary" />}
        />

        <AnalyticsChart
          title="Revenue"
          type="metric"
          data={revenue}
          trend={{ direction: "up", percentage: 15 }}
          timeframe="This month"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
        />

        <AnalyticsChart
          title="Avg. Session (hrs)"
          type="metric"
          data={averageSession}
          trend={{ direction: "down", percentage: 5 }}
          timeframe="This week"
          icon={<Clock className="h-5 w-5 text-primary" />}
        />

        <AnalyticsChart
          title="Completion Rate"
          type="metric"
          data={completionRate}
          trend={{ direction: "up", percentage: 8 }}
          timeframe="This month"
          icon={<Target className="h-5 w-5 text-primary" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Booking Trends"
          type="line"
          data={bookingTrends}
          timeframe="Last 6 months"
          trend={{ direction: "up", percentage: 12 }}
        />

        <AnalyticsChart
          title="Arena Utilization"
          type="bar"
          data={arenaUtilization}
          timeframe="Current week"
        />

        <AnalyticsChart
          title="Tournament Types"
          type="pie"
          data={tournamentTypes}
          timeframe="This month"
        />

        <AnalyticsChart
          title="Peak Hours"
          type="bar"
          data={peakHours}
          timeframe="Average week"
        />
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Peak Performance
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    Battle Dome shows 85% utilization rate, indicating high
                    demand. Consider scheduling additional sessions.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Growth Opportunity
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    New participant registrations increased by 23% this month.
                    Marketing campaigns are showing positive results.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Attention Needed
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Championship Arena has been under maintenance. Consider
                    reopening to meet growing demand.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Top Performers
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Most Active Arena</div>
                <div className="text-sm text-muted-foreground">Mini Arena</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">100%</div>
                <div className="text-xs text-muted-foreground">utilization</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Peak Time</div>
                <div className="text-sm text-muted-foreground">6 PM - 8 PM</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">42</div>
                <div className="text-xs text-muted-foreground">
                  avg bookings
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Popular Format</div>
                <div className="text-sm text-muted-foreground">
                  Singles Tournament
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">45</div>
                <div className="text-xs text-muted-foreground">events</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Revenue Leader</div>
                <div className="text-sm text-muted-foreground">Battle Dome</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">$8,200</div>
                <div className="text-xs text-muted-foreground">this month</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
