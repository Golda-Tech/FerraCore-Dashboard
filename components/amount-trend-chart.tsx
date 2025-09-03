"use client";

import * as React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
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

interface AmountTrendChartProps {
  trends: CollectionTrend[];
  loading: boolean;
}

export function AmountTrendChart({ trends, loading }: AmountTrendChartProps) {
  const chartData = React.useMemo(() => {
    return trends.map(trend => ({
      date: trend.date,
      totalAmount: trend.totalAmount,
      averageAmount: trend.totalCount > 0 ? trend.totalAmount / trend.totalCount : 0,
    }));
  }, [trends]);

  const maxAmount = Math.max(...chartData.map(d => d.totalAmount));
  const minAmount = Math.min(...chartData.map(d => d.totalAmount));

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
          <CardTitle>Amount Trends</CardTitle>
          <CardDescription>Total and average transaction amounts over time</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `₵${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `₵${(value / 1000).toFixed(1)}k`;
    }
    return `₵${value.toFixed(0)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Amount Trends</CardTitle>
        <CardDescription>
          Total and average transaction amounts over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
              <YAxis 
                yAxisId="left"
                tickFormatter={formatCurrency}
                domain={[minAmount * 0.9, maxAmount * 1.1]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={formatCurrency}
              />
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
                      formatCurrency(value as number),
                      name as string
                    ]}
                  />
                }
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalAmount"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#8b5cf6" }}
                activeDot={{ r: 6, fill: "#8b5cf6" }}
                name="Total Amount"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageAmount"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: "#06b6d4" }}
                activeDot={{ r: 5, fill: "#06b6d4" }}
                name="Average Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Legend and Summary Stats */}
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-muted-foreground">Total Amount</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-cyan-500" />
              <span className="text-sm text-muted-foreground">Average Amount</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <span className="text-muted-foreground">Highest Day: </span>
              <span className="font-medium">{formatCurrency(maxAmount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Lowest Day: </span>
              <span className="font-medium">{formatCurrency(minAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}