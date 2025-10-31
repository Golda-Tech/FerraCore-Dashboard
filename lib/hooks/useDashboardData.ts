"use client";

import { useEffect, useState } from "react";
import { getCollectionsStatusSummary as getStatusSummary, getCollectionsTrends } from "@/lib/collections";
import { StatusSummary, CollectionTrend } from "@/types/collections";
import { getPaymentsStatusSummary, getPaymentsTrends } from "@/lib/payment";
import { PaymentTrend, StatusSummary as PaymentStatusSummary } from "@/types/payment";


export function useDashboardData(startDate: string, endDate: string, interval: "DAILY" | "WEEKLY" | "MONTHLY") {
  const [statusSummary, setStatusSummary] = useState<PaymentStatusSummary | null>(null);
  const [trends, setTrends] = useState<PaymentTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [summaryRes, trendsRes] = await Promise.all([
          getPaymentsStatusSummary(),
          getPaymentsTrends(startDate, endDate, interval),
        ]);
        setStatusSummary(summaryRes);
        setTrends(trendsRes);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [startDate, endDate, interval]);

  return { statusSummary, trends, loading };
}