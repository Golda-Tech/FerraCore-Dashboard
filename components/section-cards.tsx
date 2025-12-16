"use client";

import { useMemo } from "react";
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
import { StatusSummary, PaymentTrend } from "@/types/payment";

interface SectionCardsProps {
  statusSummary: StatusSummary | null;
  trends: PaymentTrend[];
  period: string;
  loading: boolean;
}

export function SectionCards({
  statusSummary,
  trends,
  period,
  loading,
}: SectionCardsProps) {
  /* ----------  DERIVED VALUES  ---------- */
  const totalPayouts = trends.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalTransactions = trends.reduce((sum, t) => sum + t.totalCount, 0);

  const successCount = statusSummary?.SUCCESS ?? 0;
  const failedCount   = statusSummary?.FAILED  ?? 0;
  const ongoingCount  = statusSummary?.ONGOING ?? 0;

  const totalStatusCount = successCount + failedCount + ongoingCount;
  const successRate =
    totalStatusCount > 0 ? (successCount / totalStatusCount) * 100 : 0;

 /* ----------  HELPERS  ---------- */
 const MS_DAY = 24 * 60 * 60 * 1000;

 /* return the length of the current period in days */
 function periodDays(p: string): number {
   switch (p) {
     case '7d':  return 7;
     case '30d': return 30;
     case '90d': return 90;
     case '6m':  return 183;   // ≈ 6 months
     case '1y':  return 365;
     default:    return 30;
   }
 }

 /* sum a slice of trends */
 function sliceSum(
   arr: PaymentTrend[],
   start: Date,
   end: Date,
   key: 'totalAmount' | 'totalCount'
 ) {
   return arr.reduce((sum, t) => {
     const d = new Date(t.date);
     return d >= start && d < end ? sum + t[key] : sum;
   }, 0);
 }

 /* ----------  REAL CHANGE LOGIC  ---------- */
 const { payoutChange, pendingChange, successRateChange, balanceChange } = useMemo(() => {
   if (!trends.length)
     return {
       payoutChange: 0,
       pendingChange: 0,
       successRateChange: 0,
       balanceChange: 0,
     };

   const dates = trends.map((t) => new Date(t.date));
   const currentEnd   = new Date(Math.max(...dates.map(Number)));
   const currentStart = new Date(currentEnd.getTime() - periodDays(period) * MS_DAY);

   const prevEnd   = currentStart;
   const prevStart = new Date(prevEnd.getTime() - periodDays(period) * MS_DAY);

   /* current period sums */
   const curAmount = sliceSum(trends, currentStart, currentEnd, 'totalAmount');
   const curCount  = sliceSum(trends, currentStart, currentEnd, 'totalCount');

   /* previous period sums */
   const prevAmount = sliceSum(trends, prevStart, prevEnd, 'totalAmount');
   const prevCount  = sliceSum(trends, prevStart, prevEnd, 'totalCount');

   /* success-rate per period */
   const curSuccess = trends.reduce((sum, t) => {
     const d = new Date(t.date);
     return d >= currentStart && d < currentEnd ? sum + ( 0) : sum;
   }, 0);

   const prevSuccess = trends.reduce((sum, t) => {
     const d = new Date(t.date);
     return d >= prevStart && d < prevEnd ? sum + ( 0) : sum;
   }, 0);

   const pct = (now: number, prev: number) =>
     prev === 0 ? 0 : ((now - prev) / prev) * 100;

   return {
     payoutChange:    pct(curAmount, prevAmount),
     pendingChange:   pct(curCount - curSuccess, prevCount - prevSuccess),
     successRateChange: pct(
       curCount ? (curSuccess / curCount) * 100 : 0,
       prevCount ? (prevSuccess / prevCount) * 100 : 0
     ),
     balanceChange:   pct(curCount, prevCount),
   };
 }, [trends, period]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);

  const getPeriodLabel = (p: string) => {
    switch (p) {
      case "7d":  return "this week";
      case "30d": return "this month";
      case "90d": return "last 3 months";
      case "6m":  return "last 6 months";
      case "1y":  return "this year";
      default:    return "selected period";
    }
  };

  /* ----------  LOADING SKELETON  ---------- */
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

  /* ----------  RENDER CARDS  ---------- */
  return (
    <div className="grid grid-cols-1 gap-4 px-0 lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total Payments</CardDescription>
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

      {/* Pending Payments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Pending Payments</CardDescription>
          <CardAction>
            <Badge
              variant="outline"
              className={pendingChange > 0 ? "text-green-600" : "text-yellow-600"}
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

      {/* Success Rate */}
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

      {/* Payment Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Payment Count</CardDescription>
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
};