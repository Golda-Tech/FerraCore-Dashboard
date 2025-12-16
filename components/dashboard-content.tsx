"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { StatusDistributionChart } from "@/components/status-distribution-chart";
import { DailyVolumeChart } from "@/components/daily-volume-chart";
import { AmountTrendChart } from "@/components/amount-trend-chart";
import { PeriodSelector } from "@/components/period-selector";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { getUser } from "@/lib/auth";
import { LoginResponse } from "@/types/auth";
import { Interval } from "@/types/payment";


export function DashboardContent() {
  const [period, setPeriod] = useState("7d");
  const [isMobile, setIsMobile] = useState(false);

  const [user, setUser] = useState<LoginResponse | null>(null);
  useEffect(() => {
      const stored = getUser();
      setUser(stored);
    }, []);

    /* 2.  date / interval helpers */
  const { startDate, endDate, interval } = useMemo<{
  startDate: string;
  endDate: string;
  interval: Interval;
}>(() => {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case "7d": start.setDate(end.getDate() - 7); break;
    case "30d": start.setDate(end.getDate() - 30); break;
    case "90d": start.setDate(end.getDate() - 90); break;
    case "6m": start.setMonth(end.getMonth() - 6); break;
    case "1y": start.setFullYear(end.getFullYear() - 1); break;
    default: start.setDate(end.getDate() - 30);
  }
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    interval: period === "7d" || period === "30d" ? "DAILY"
              : period === "90d" ? "WEEKLY"
              : "MONTHLY",
  };
}, [period]);

    /* 3.  fetch charts – only when user exists */
    const { statusSummary, trends, loading } = useDashboardData(
      startDate,
      endDate,
      interval,
      user?.email // pass email as dependency
    );

  // useEffect(() => {
  //   const checkMobile = () => setIsMobile(window.innerWidth < 768);
  //   checkMobile();
  //   window.addEventListener("resize", checkMobile);
  //   return () => window.removeEventListener("resize", checkMobile);
  // }, []);

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Header with Period Selector */}
        <div className="flex flex-col gap-4 px-0 lg:px-0 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your payment transactions
            </p>
          </div>
          <PeriodSelector
            value={period}
            onChange={setPeriod}
            isMobile={isMobile}
          />
        </div>

        {/* Summary Cards */}

        <SectionCards
          statusSummary={statusSummary}
          trends={trends}
          period={period}
          loading={loading}
        />

        {/* Main Transaction Chart */}

        <ChartAreaInteractive data={trends} period={period} loading={loading} />

        {/* Additional Charts Grid */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatusDistributionChart
            statusSummary={statusSummary}
            trends={trends}
            loading={loading}
          />
          <AmountTrendChart trends={trends} loading={loading} />
          <DailyVolumeChart trends={trends} loading={loading} />
        </div>
      </div>
    </div>
  );
}
