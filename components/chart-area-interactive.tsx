"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { CollectionTrend } from "@/types/collections"

export const description = "An interactive area chart showing payment transactions"

const chartConfig = {
  transactions: {
    label: "Transactions",
  },
  totalAmount: {
    label: "Total Amount",
    color: "hsl(var(--primary))",
  },
  totalCount: {
    label: "Transaction Count",
    color: "hsl(var(--secondary))",
  },
} satisfies ChartConfig

interface ChartAreaInteractiveProps {
  data: CollectionTrend[];
  period: string;
  loading: boolean;
}

export function ChartAreaInteractive({ data, period, loading }: ChartAreaInteractiveProps) {
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7d": return "last 7 days";
      case "30d": return "last 30 days";
      case "90d": return "last 3 months";
      case "6m": return "last 6 months";
      case "1y": return "last year";
      default: return "selected period";
    }
  };

  // Transform data for the chart
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      date: item.date,
      totalAmount: item.totalAmount,
      totalCount: item.totalCount,
      // Scale amount for better visualization alongside count
      scaledAmount: item.totalAmount / 100, // Adjust this scale factor as needed
    }));
  }, [data]);

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-64" />
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="aspect-auto h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Transaction Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Transaction amounts and counts for the {getPeriodLabel(period)}
          </span>
          <span className="@[540px]/card:hidden">
            {getPeriodLabel(period).charAt(0).toUpperCase() + getPeriodLabel(period).slice(1)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-totalAmount)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-totalAmount)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-totalCount)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-totalCount)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toString()}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                  formatter={(value, name) => {
                    if (name === "totalAmount") {
                      return [`₵${(value as number).toLocaleString()}`, "Total Amount"];
                    }
                    return [value, "Transaction Count"];
                  }}
                />
              }
            />
            <Area
              yAxisId="left"
              dataKey="totalAmount"
              type="natural"
              fill="url(#fillAmount)"
              stroke="var(--color-totalAmount)"
              stackId="a"
            />
            <Area
              yAxisId="right"
              dataKey="totalCount"
              type="natural"
              fill="url(#fillCount)"
              stroke="var(--color-totalCount)"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}