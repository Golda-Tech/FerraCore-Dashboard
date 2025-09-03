"use client";

import * as React from "react";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionTrend } from "@/types/collections";

interface DailyVolumeChartProps {
  trends: CollectionTrend[];
  loading: boolean;
}

const chartConfig = {
  success: {
    label: "Success",
    color: "var(--chart-1)",
  },
  failed: {
    label: "Failed",
    color: "var(--chart-2)",
  },
  ongoing: {
    label: "Ongoing",
    color: "var(--chart-3)",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function DailyVolumeChart({ trends, loading }: DailyVolumeChartProps) {
  const chartData = React.useMemo(() => {
    return trends.map((trend) => ({
      date: trend.date,
      success: trend.statusCounts?.SUCCESS || 0,
      failed: trend.statusCounts?.FAILED || 0,
      ongoing: trend.statusCounts?.ONGOING || 0,
      pending: trend.statusCounts?.PENDING_EXTERNAL || 0,
    }));
  }, [trends]);

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
          <CardTitle>Daily Transaction Volume</CardTitle>
          <CardDescription>
            Transaction count breakdown by status
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Transaction Volume</CardTitle>
        <CardDescription>Transaction count breakdown by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  labelFormatter={(value) =>
                    new Date(value as string).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                  formatter={(value, name) => [
                    `${value} transactions`,
                    chartConfig[name as keyof typeof chartConfig]?.label ??
                      name,
                  ]}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="success"
              stackId="a"
              fill="var(--color-success)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="failed"
              stackId="a"
              fill="var(--color-failed)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="ongoing"
              stackId="a"
              fill="var(--color-ongoing)"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="pending"
              stackId="a"
              fill="var(--color-pending)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing transaction volumes by status
        </div>
      </CardFooter>
    </Card>
  );
}
