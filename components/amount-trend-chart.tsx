"use client";
import * as React from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentTrend } from "@/types/payment";

interface AmountTrendChartProps {
  trends: PaymentTrend[];
  loading: boolean;
}

const chartConfig = {
  totalAmount: {
    label: "Total Amount",
    color: "var(--chart-1)", // blue
  },
  averageAmount: {
    label: "Average Amount",
    color: "var(--chart-2)", // green
  },
} satisfies ChartConfig;

export function AmountTrendChart({ trends, loading }: AmountTrendChartProps) {
  const chartData = React.useMemo(() => {
    return trends.map((trend) => ({
      date: trend.date,
      totalAmount: trend.totalAmount,
      averageAmount:
        trend.totalCount > 0 ? trend.totalAmount / trend.totalCount : 0,
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
          <CardTitle>Amount Trends</CardTitle>
          <CardDescription>
            Total and average transaction amounts over time
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `₵${(value / 1_000_000).toFixed(1)}M`;
    } else if (value >= 1_000) {
      return `₵${(value / 1_000).toFixed(1)}k`;
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
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                  formatter={(value, name) => [
                    formatCurrency(value as number),
                    chartConfig[name as keyof typeof chartConfig]?.label ??
                      name,
                  ]}
                />
              }
            />
            <Line
              dataKey="totalAmount"
              type="natural"
              stroke="var(--color-totalAmount)"
              strokeWidth={2}
              dot={{ fill: "var(--color-totalAmount)" }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={formatCurrency}
              />
            </Line>
            <Line
              dataKey="averageAmount"
              type="natural"
              stroke="var(--color-averageAmount)"
              strokeWidth={2}
              dot={{ fill: "var(--color-averageAmount)" }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
                formatter={formatCurrency}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up overall <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total and average amounts over time
        </div>
      </CardFooter>
    </Card>
  );
}
