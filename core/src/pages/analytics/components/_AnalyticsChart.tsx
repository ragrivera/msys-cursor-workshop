import React from "react";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface AnalyticsChartProps {
  title: string;
  type: "bar" | "line" | "pie" | "metric";
  data: ChartDataPoint[];
  trend?: {
    direction: "up" | "down";
    percentage: number;
  };
  timeframe?: string;
  icon?: React.ReactNode;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  type,
  data,
  trend,
  timeframe,
  icon,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                item.color || "bg-primary"
              }`}
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color || undefined,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="relative h-32 flex items-end gap-2 p-4">
      {data.map((item, index) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-full rounded-t transition-all ${
                item.color || "bg-primary"
              }`}
              style={{
                height: `${height}%`,
                backgroundColor: item.color || undefined,
              }}
            />
            <span className="text-xs text-muted-foreground rotate-45 origin-left">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );

  const renderPieChart = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {data.slice(0, 4).map((item, index) => {
          const percentage = ((item.value / totalValue) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    item.color || `hsl(${(index * 60) % 360}, 70%, 50%)`,
                }}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-muted-foreground">
                  {percentage}% ({item.value})
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple pie representation */}
      <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-primary via-secondary to-accent opacity-20" />
    </div>
  );

  const renderMetric = () => {
    const mainValue = data[0]?.value || 0;
    return (
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold text-foreground">
          {mainValue.toLocaleString()}
        </div>
        {data[0]?.label && (
          <div className="text-sm text-muted-foreground">{data[0].label}</div>
        )}
      </div>
    );
  };

  const getChartIcon = () => {
    if (icon) return icon;
    switch (type) {
      case "bar":
        return <BarChart3 className="h-5 w-5 text-primary" />;
      case "line":
        return <Activity className="h-5 w-5 text-primary" />;
      case "pie":
        return <PieChart className="h-5 w-5 text-primary" />;
      case "metric":
        return <TrendingUp className="h-5 w-5 text-primary" />;
      default:
        return <BarChart3 className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getChartIcon()}
            {title}
          </CardTitle>
          {timeframe && (
            <Badge variant="outline" className="text-xs w-fit">
              {timeframe}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm ${
                trend.direction === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.direction === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="font-medium">{trend.percentage}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {type === "bar" && renderBarChart()}
        {type === "line" && renderLineChart()}
        {type === "pie" && renderPieChart()}
        {type === "metric" && renderMetric()}
      </CardContent>
    </Card>
  );
};
