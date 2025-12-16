"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getCollectionsStatusSummary as getStatusSummary, getCollectionsTrends } from "@/lib/collections";
import { StatusSummary, CollectionTrend } from "@/types/collections";
import { getPaymentsStatusSummary, getPaymentsTrends } from "@/lib/payment";
import { PaymentTrend, StatusSummary as PaymentStatusSummary } from "@/types/payment";
import { getUser } from "@/lib/auth";


export function useDashboardData(
  startDate: string,
  endDate: string,
  interval: "DAILY" | "WEEKLY" | "MONTHLY",
  email?: string
) {
  const [statusSummary, setStatusSummary] = useState<PaymentStatusSummary | null>(null);
  const [trends, setTrends] = useState<PaymentTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return; // ← guard while loading / logged-out

    async function load() {
      setLoading(true);
      try {
        const [summaryRes, trendsRes] = await Promise.all([
          getPaymentsStatusSummary(email),
          getPaymentsTrends(email,startDate, endDate, interval),
        ]);
        setStatusSummary(summaryRes);
        setTrends(trendsRes);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [startDate, endDate, interval, email]);

  return { statusSummary, trends, loading };
}