"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusSummary, CollectionTrend } from "@/types/collections";

interface SectionCardsProps {
  statusSummary: StatusSummary | null;
  trends: CollectionTrend[];
  period: string;
  loading: boolean;
}

export function SectionCards({
  statusSummary,
  trends,
  period,
  loading,
}: SectionCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-0 lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate metrics from trends data
  const totalPayouts = trends.reduce(
    (sum, trend) => sum + trend.totalAmount,
    0
  );
  const totalTransactions = trends.reduce(
    (sum, trend) => sum + trend.totalCount,
    0
  );

  const successCount = statusSummary?.SUCCESS || 0;
  const failedCount = statusSummary?.FAILED || 0;
  const ongoingCount = statusSummary?.ONGOING || 0;

  const totalStatusCount = successCount + failedCount + ongoingCount;
  const successRate =
    totalStatusCount > 0 ? (successCount / totalStatusCount) * 100 : 0;

  // Mock calculations for percentage changes (you can implement real calculations based on previous period data)
  const payoutChange = 12.5;
  const pendingChange = -5.0;
  const successRateChange = 2.1;
  const balanceChange = 8.3;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₵${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₵${(amount / 1000).toFixed(1)}k`;
    }
    return `₵${amount.toFixed(0)}`;
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "7d":
        return "this week";
      case "30d":
        return "this month";
      case "90d":
        return "last 3 months";
      case "6m":
        return "last 6 months";
      case "1y":
        return "this year";
      default:
        return "selected period";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-0 lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total Collections</CardDescription>
          <CardAction>
            <Badge
              variant="outline"
              className={payoutChange > 0 ? "text-green-600" : "text-red-600"}
            >
              {payoutChange > 0 ? (
                <IconTrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <IconTrendingDown className="h-3 w-3 mr-1" />
              )}
              {payoutChange > 0 ? "+" : ""}
              {payoutChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">
            {formatCurrency(totalPayouts)}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Total amount for {getPeriodLabel(period)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Pending Collections</CardDescription>
          <CardAction>
            <Badge
              variant="outline"
              className={
                pendingChange > 0 ? "text-green-600" : "text-yellow-600"
              }
            >
              {pendingChange > 0 ? (
                <IconTrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <IconTrendingDown className="h-3 w-3 mr-1" />
              )}
              {pendingChange > 0 ? "+" : ""}
              {pendingChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">{ongoingCount}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Requires immediate attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Success Rate</CardDescription>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconTrendingUp className="h-3 w-3 mr-1" />+{successRateChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">
            {successRate.toFixed(1)}%
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Excellent performance
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total Collections</CardDescription>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconTrendingUp className="h-3 w-3 mr-1" />+{balanceChange}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">
            {totalTransactions.toLocaleString()}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            For {getPeriodLabel(period)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
