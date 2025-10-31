"use client";

import * as React from "react";
import { PieChart, Pie, Label, Sector, ResponsiveContainer } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusSummary, PaymentTrend } from "@/types/payment";

interface StatusDistributionChartProps {
  statusSummary: StatusSummary | null;
  trends: PaymentTrend[];
  loading: boolean;
}

const statusColors: Record<string, string> = {
  SUCCESSFUL: "#10b981",
  SUCCESS: "#10b981",       // Green (Tailwind emerald-500)
  FAILED: "#ef4444",        // Red (Tailwind red-500)
  PENDING: "#f59e0b",       // Yellow/Amber (Tailwind amber-500)
  ONGOING: "#f59e0b",       // Yellow/Amber (Tailwind amber-500)
  CANCELLED: "#6b7280",     // Gray (Tailwind gray-500)
  PENDING_EXTERNAL: "#8b5cf6", // Purple (Tailwind violet-500)
  REFUNDED: "#3b82f6",      // Blue (Tailwind blue-500)
  INITIATED: "#f97316",     // Orange (Tailwind orange-500)
};



export function StatusDistributionChart({
  statusSummary,
  trends,
  loading,
}: StatusDistributionChartProps) {
  const id = "status-distribution";

  // Build chart data from API
  const chartData = React.useMemo(() => {
    if (!statusSummary) return [];

    return Object.entries(statusSummary)
      .filter(([_, value]) => value > 0)
      .map(([status, count]) => ({
        status,
        label:
          status.charAt(0) +
          status.slice(1).toLowerCase().replace(/_/g, " "),
        value: count,
        fill: statusColors[status] || "var(--chart-8)",
      }));
  }, [statusSummary]);

  // Active slice logic (default to first)
  const [activeStatus, setActiveStatus] = React.useState<string | null>(null);
  const activeIndex = React.useMemo(
    () => chartData.findIndex((d) => d.status === activeStatus),
    [activeStatus, chartData]
  );
  const statuses = React.useMemo(() => chartData.map((d) => d.status), [chartData]);

  // Build chartConfig dynamically
  const chartConfig: ChartConfig = React.useMemo(() => {
    return chartData.reduce((acc, item, index) => {
      acc[item.status] = {
        label: item.label,
        color: item.fill,
      };
      return acc;
    }, {} as ChartConfig);
  }, [chartData]);

  React.useEffect(() => {
    if (chartData.length > 0 && !activeStatus) {
      setActiveStatus(chartData[0].status);
    }
  }, [chartData, activeStatus]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Breakdown of transaction statuses</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className="w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:justify-between pb-0">
        <div className="grid gap-1">
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Breakdown of transaction statuses</CardDescription>
        </div>
        <Select
          value={activeStatus || ""}
          onValueChange={setActiveStatus}
        >
          <SelectTrigger
            className="ml-auto h-7 w-[160px] rounded-lg pl-2.5"
            aria-label="Select a status"
          >
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {statuses.map((key) => {
              const config = chartConfig[key];
              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: config?.color,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-4 sm:pb-0">
  <ChartContainer
    id={id}
    config={chartConfig}
    className="mx-auto aspect-square w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[400px]"
  >
    <PieChart>
      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
      <Pie
        data={chartData}
        dataKey="value"
        nameKey="label"
        innerRadius={50}
        strokeWidth={5}
        activeIndex={activeIndex}
        activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
          <g>
            <Sector {...props} outerRadius={outerRadius + 10} />
            <Sector
              {...props}
              outerRadius={outerRadius + 25}
              innerRadius={outerRadius + 12}
            />
          </g>
        )}
      >
        <Label
          content={({ viewBox }) => {
            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-foreground text-2xl sm:text-3xl font-bold"
                  >
                    {activeStatus
                      ? chartData.find((d) => d.status === activeStatus)?.value
                      : 0}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) + 22}
                    className="fill-muted-foreground text-xs sm:text-sm"
                  >
                    Transactions
                  </tspan>
                </text>
              );
            }
          }}
        />
      </Pie>
    </PieChart>
  </ChartContainer>
</CardContent>

    </Card>
  );
}
