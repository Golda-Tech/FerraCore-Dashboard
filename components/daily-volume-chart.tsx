"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionTrend } from "@/types/collections";

interface DailyVolumeChartProps {
  trends: CollectionTrend[];
  loading: boolean;
}

const statusColors = {
  SUCCESS: "#10b981",
  FAILED: "#ef4444",
  ONGOING: "#f59e0b",
  CANCELLED: "#6b7280",
  PENDING_EXTERNAL: "#8b5cf6",
  REFUNDED: "#06b6d4",
  INITIATED: "#f97316",
};

export function DailyVolumeChart({ trends, loading }: DailyVolumeChartProps) {
  const chartData = React.useMemo(() => {
    return trends.map(trend => ({
      date: trend.date,
      success: trend.statusCounts?.SUCCESS || 0,
      failed: trend.statusCounts?.FAILED || 0,
      ongoing: trend.statusCounts?.ONGOING || 0,
      pending: trend.statusCounts?.PENDING_EXTERNAL || 0,
      total: trend.totalCount,
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
          <CardDescription>Transaction count breakdown by status</CardDescription>
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
        <ChartContainer config={{}} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", { 
                    month: "short", 
                    day: "numeric" 
                  });
                }}
              />
              <YAxis />
              <ChartTooltip 
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value, name) => [
                      `${value} transactions`,
                      name as string
                    ]}
                  />
                }
              />
              <Bar 
                dataKey="success" 
                stackId="a" 
                fill={statusColors.SUCCESS} 
                name="Success" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="failed" 
                stackId="a" 
                fill={statusColors.FAILED} 
                name="Failed" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="ongoing" 
                stackId="a" 
                fill={statusColors.ONGOING} 
                name="Ongoing" 
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="pending" 
                stackId="a" 
                fill={statusColors.PENDING_EXTERNAL} 
                name="Pending" 
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm text-muted-foreground">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground">Failed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm text-muted-foreground">Ongoing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-sm text-muted-foreground">Pending</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}