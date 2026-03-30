"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Smartphone,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getOptimizedPayments, getPayment, getTransactionStatus, getStreamPayments, getPartnerTotal } from "@/lib/payment";
import { OptimizedPaymentsResponse, Payment, StreamPaymentItem } from "@/types/payment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const getStatusIcon = (status: string) => {
  switch (status) {
    case "SUCCESSFUL":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "EXPIRED":
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SUCCESSFUL":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Successful</Badge>;
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case "FAILED":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
    case "EXPIRED":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Expired</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const STATUS_FILTER_TO_API: Record<string, string[]> = {
  all: ["PENDING", "SUCCESSFUL", "FAILED"],
  Successful: ["SUCCESSFUL"],
  Pending: ["PENDING", "ONGOING"],
  Failed: ["FAILED"],
};

const toStartOfDayIso = (value: string) => (value ? `${value}T00:00:00` : undefined);
const toEndOfDayIso = (value: string) => (value ? `${value}T23:59:59` : undefined);
const getCurrentDayBounds = (dateKey?: string) => {
  const baseDate = dateKey ? new Date(`${dateKey}T00:00:00`) : new Date();
  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, "0");
  const day = String(baseDate.getDate()).padStart(2, "0");
  const date = `${year}-${month}-${day}`;

  return {
    dayKey: date,
    start: `${date}T00:00:00`,
    end: `${date}T23:59:59`,
  };
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
interface PartnerTransactionsContentProps {
  partnerEmail: string;
  partnerName?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function PartnerTransactionsContent({
  partnerEmail,
  partnerName,
}: PartnerTransactionsContentProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [summary, setSummary] = useState<OptimizedPaymentsResponse | null>(null);
  const [todaySummary, setTodaySummary] = useState<OptimizedPaymentsResponse | null>(null);
  const [dayKey, setDayKey] = useState(getCurrentDayBounds().dayKey);

  /* ---------- date range filter (server-side) ---------- */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  /* ---------- pagination ---------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const midnightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const todayRequestRef = useRef<AbortController | null>(null);
  const pdfExportRequestRef = useRef<AbortController | null>(null);
  const csvExportRequestRef = useRef<AbortController | null>(null);
  const isExportingRef = useRef(false);
  const requestSequenceRef = useRef(0);
  const todayRequestSequenceRef = useRef(0);
  const partnerTotalRequestRef = useRef<AbortController | null>(null);
  const [partnerTotalAmount, setPartnerTotalAmount] = useState<number | null>(null);
  const router = useRouter();

  const displayName = partnerName || partnerEmail;
  const activeStatuses = STATUS_FILTER_TO_API[statusFilter] ?? STATUS_FILTER_TO_API.all;
  const todayBounds = getCurrentDayBounds(dayKey);

  /* ---------- debounce search ---------- */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  /* ---------- fetch partner total for date range ---------- */
  const fetchPartnerTotal = useCallback(
    async (sd: string, ed: string) => {
      if (!partnerEmail || !sd || !ed) return;

      partnerTotalRequestRef.current?.abort();
      const controller = new AbortController();
      partnerTotalRequestRef.current = controller;

      try {
        const data = await getPartnerTotal(
          partnerEmail,
          `${sd}T00:00:00`,
          `${ed}T23:59:59`,
          controller.signal
        );

        if (controller.signal.aborted) return;

        setPartnerTotalAmount(data.totalAmount);
      } catch (err: any) {
        if (
          controller.signal.aborted ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        ) {
          return;
        }
        console.error("Failed to fetch partner total:", err);
      }
    },
    [partnerEmail]
  );

  useEffect(() => {
    const hasValidRange = !startDate || !endDate || startDate <= endDate;
    if (!hasValidRange) {
      return;
    }

    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);

    // Fetch partner total when both dates are set, clear when removed
    if (startDate && endDate) {
      fetchPartnerTotal(startDate, endDate);
    } else if (!startDate && !endDate) {
      setPartnerTotalAmount(null);
      partnerTotalRequestRef.current?.abort();
    }
  }, [startDate, endDate, fetchPartnerTotal]);

  /* ---------- fetch today-only summary ---------- */
  const fetchTodaySummary = useCallback(async () => {
    if (!partnerEmail) return;

    todayRequestRef.current?.abort();
    const controller = new AbortController();
    todayRequestRef.current = controller;
    const requestId = ++todayRequestSequenceRef.current;

    try {
      const data = await getOptimizedPayments({
        initiatedBy: partnerEmail,
        startDate: todayBounds.start,
        endDate: todayBounds.end,
        page: 0,
        size: 1,
        sort: "initiatedAt,desc",
        signal: controller.signal,
      });

      if (controller.signal.aborted || requestId !== todayRequestSequenceRef.current) {
        return;
      }

      setTodaySummary(data);
    } catch (err: any) {
      if (
        controller.signal.aborted ||
        err?.name === "AbortError" ||
        err?.code === "ERR_CANCELED"
      ) {
        return;
      }

      console.error("Failed to fetch partner today summary:", err);
    }
  }, [partnerEmail, todayBounds.start, todayBounds.end]);

  /* ---------- fetch payments for the selected partner ---------- */
  const fetchPayments = useCallback(
    async (showLoading = true) => {
      if (!partnerEmail) return;

      activeRequestRef.current?.abort();
      const controller = new AbortController();
      activeRequestRef.current = controller;
      const requestId = ++requestSequenceRef.current;

      if (showLoading) setLoading(true);

      try {
        const data = await getOptimizedPayments({
          q: searchTerm,
          statuses: activeStatuses,
          startDate: toStartOfDayIso(appliedStartDate),
          endDate: toEndOfDayIso(appliedEndDate),
          initiatedBy: partnerEmail,
          page: currentPage - 1,
          size: pageSize,
          sort: "initiatedAt,desc",
          signal: controller.signal,
        });

        if (controller.signal.aborted || requestId !== requestSequenceRef.current) {
          return;
        }

        setPayments(data.items || []);
        setSummary(data);

        const safePage = (data.page ?? 0) + 1;
        if (safePage !== currentPage) {
          setCurrentPage(safePage);
        }

        fetchTodaySummary();
      } catch (err: any) {
        if (
          controller.signal.aborted ||
          err?.name === "AbortError" ||
          err?.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Failed to fetch partner payments:", err);
        setPayments([]);
        setSummary(null);
      } finally {
        if (!controller.signal.aborted && requestId === requestSequenceRef.current && showLoading) {
          setLoading(false);
        }
      }
    },
    [partnerEmail, searchTerm, activeStatuses, appliedStartDate, appliedEndDate, currentPage, pageSize, fetchTodaySummary]
  );

  /* ---------- initial fetch / reactive fetch ---------- */
  useEffect(() => {
    fetchPayments(true);

    return () => {
      activeRequestRef.current?.abort();
    };
  }, [fetchPayments]);

  /* ---------- auto-refresh ---------- */
  useEffect(() => {
    if (!partnerEmail || !isAutoRefreshEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      fetchPayments(false);
    }, 8000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [partnerEmail, isAutoRefreshEnabled, fetchPayments]);

  /* ---------- midnight rollover ---------- */
  useEffect(() => {
    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      const timeoutMs = nextMidnight.getTime() - now.getTime();

      midnightTimeoutRef.current = setTimeout(() => {
        setDayKey(getCurrentDayBounds().dayKey);
      }, timeoutMs);
    };

    if (midnightTimeoutRef.current) {
      clearTimeout(midnightTimeoutRef.current);
      midnightTimeoutRef.current = null;
    }

    scheduleMidnightRefresh();

    return () => {
      if (midnightTimeoutRef.current) {
        clearTimeout(midnightTimeoutRef.current);
        midnightTimeoutRef.current = null;
      }
      todayRequestRef.current?.abort();
    };
  }, [dayKey]);

  useEffect(() => {
    fetchTodaySummary();

    return () => {
      todayRequestRef.current?.abort();
    };
  }, [fetchTodaySummary]);

  useEffect(() => {
    return () => {
      pdfExportRequestRef.current?.abort();
      csvExportRequestRef.current?.abort();
      partnerTotalRequestRef.current?.abort();
    };
  }, []);

  /* ---------- telco logos ---------- */
  const telcos = [
    { name: "mtn", codes: ["mtn"], logo: "/mtn-momo.png" },
    { name: "telecel", codes: ["telecel", "vod", "vodafone"], logo: "/telecel-cash.webp" },
    { name: "airteltigo", codes: ["airteltigo", "air", "airtel"], logo: "/airtel-tigo.png" },
    { name: "gmoney", codes: ["gmoney", "gmo", "g-money"], logo: "/gmoney.jpg" },
  ];
  const getTelcoLogo = (provider = "") => {
    const p = provider.toLowerCase();
    const src =
      telcos.find((t) => t.codes.some((c) => p === c || p.includes(t.name)))?.logo ??
      "/unknown-telco.webp";
    return (
      <img
        src={src}
        alt={provider}
        className="h-12 w-12 rounded-lg object-contain bg-white p-1"
      />
    );
  };

  /* ---------- current page dataset ---------- */
  const filteredPayments = payments;

  /* ---------- summary stats ---------- */
  const statusCounts = summary?.statusCounts ?? {};
  const completedRequests = Number(statusCounts.SUCCESSFUL ?? 0);
  const pendingRequests = Number((statusCounts.PENDING ?? 0)) + Number((statusCounts.ONGOING ?? 0));
  const failedRequests = Number(statusCounts.FAILED ?? 0);
  const expiredRequests = Number(statusCounts.EXPIRED ?? 0);
  const totalRequests = Number(summary?.totalElements ?? 0);

  const todayStatusCounts = todaySummary?.statusCounts ?? {};
  const todaySuccessful = Number(todayStatusCounts.SUCCESSFUL ?? 0);
  const todayPending = Number(todayStatusCounts.PENDING ?? 0) + Number(todayStatusCounts.ONGOING ?? 0);
  const todayFailed = Number(todayStatusCounts.FAILED ?? 0);
  const todayTotalCount = Number(todaySummary?.totalElements ?? 0);

  const allTimeAmountCollected = Number(summary?.totalAmount ?? 0);
  const todayAmountCollected = Number(summary?.todayAmount ?? todaySummary?.todayAmount ?? 0);
  const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

  const hasDateInput = Boolean(startDate || endDate || appliedStartDate || appliedEndDate);

  /* When a date range is active, use the partner-total API amount.
     When cleared, revert to the backend summary totalAmount. */
  const filteredTotalAmount = hasDateInput && partnerTotalAmount !== null
    ? partnerTotalAmount
    : Number(summary?.totalAmount ?? 0);

  /* ---------- pagination ---------- */
  const totalPages = Math.max(1, summary?.totalPages ?? 1);
  const paginatedPayments = filteredPayments;
  const rangeStart = totalRequests === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = totalRequests === 0 ? 0 : Math.min((currentPage - 1) * pageSize + paginatedPayments.length, totalRequests);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [partnerEmail, searchTerm, statusFilter, appliedStartDate, appliedEndDate, pageSize]);

  /* ---------- helpers ---------- */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const base = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const ms = String(d.getMilliseconds()).padStart(3, "0");
    return `${base}.${ms}`;
  };

  const escapeCsvValue = (value: string | number | null | undefined) => {
    const stringValue = String(value ?? "");
    if (/[",\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };


  /* ---------- export ---------- */
  const formatStreamDate = (dateArr: number[]) => {
    if (!dateArr || dateArr.length < 6) return "—";
    const [year, month, day, hour, minute, second] = dateArr;
    const d = new Date(year, month - 1, day, hour, minute, second);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const downloadPDF = async () => {
    if (!partnerEmail || isExportingPdf || isExportingCsv) return;

    // Require date range
    if (!startDate || !endDate) {
      alert("Please select a start date and end date before exporting to PDF.");
      return;
    }

    isExportingRef.current = true;
    pdfExportRequestRef.current?.abort();
    const controller = new AbortController();
    pdfExportRequestRef.current = controller;
    setIsExportingPdf(true);

    try {
      const streamStartDate = `${startDate}T00:00:00`;
      const streamEndDate = `${endDate}T23:59:59`;

      const exportRows: StreamPaymentItem[] = await getStreamPayments(
        streamStartDate,
        streamEndDate,
        controller.signal
      );

      if (controller.signal.aborted) return;

      const successCount = exportRows.filter((r) => r.status === "SUCCESSFUL").length;
      const failedCount = exportRows.filter((r) => r.status === "FAILED").length;
      const pendingCount = exportRows.filter((r) => r.status === "PENDING").length;
      const successAmt = exportRows
        .filter((r) => r.status === "SUCCESSFUL")
        .reduce((sum, r) => sum + Number(r.amountGhs ?? 0), 0);

      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`${displayName} — Payments Report`, 14, 16);

      doc.setFontSize(9);
      doc.setTextColor(80);
      const genDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      const dateRange = `${startDate}  to  ${endDate}`;
      doc.text(
        `Generated: ${genDate}   |   Date Range: ${dateRange}   |   Total Records: ${exportRows.length.toLocaleString()}   |   Successful: ${successCount.toLocaleString()} (GHS ${successAmt.toLocaleString("en-GH", { minimumFractionDigits: 2 })})   |   Pending: ${pendingCount.toLocaleString()}   |   Failed: ${failedCount.toLocaleString()}`,
        14, 23,
      );
      doc.setTextColor(0);
      doc.setFont("helvetica", "normal");

      autoTable(doc, {
        head: [["Customer MSISDN", "Reference", "Network", "Amount (GHS)", "Status", "Status Reason", "Date"]],
        body: exportRows.map((p) => [
          p.customerMsisdn,
          p.reference,
          p.network,
          Number(p.amountGhs ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2 }),
          p.status,
          (p.statusReason || "").replace(/_/g, " "),
          formatStreamDate(p.date),
        ]),
        startY: 28,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: "bold", halign: "center" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          6: { cellWidth: 45, overflow: "visible" },
        },
      });

      doc.save(`partner-payments_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("Failed to export partner payments PDF:", err);
    } finally {
      if (pdfExportRequestRef.current === controller) pdfExportRequestRef.current = null;
      setIsExportingPdf(false);
      isExportingRef.current = false;
    }
  };

  const downloadCSV = async () => {
    if (!partnerEmail || isExportingPdf || isExportingCsv) return;

    // Require date range
    if (!startDate || !endDate) {
      alert("Please select a start date and end date before exporting to CSV.");
      return;
    }

    isExportingRef.current = true;
    csvExportRequestRef.current?.abort();
    const controller = new AbortController();
    csvExportRequestRef.current = controller;
    setIsExportingCsv(true);

    try {
      const streamStartDate = `${startDate}T00:00:00`;
      const streamEndDate = `${endDate}T23:59:59`;

      const exportRows: StreamPaymentItem[] = await getStreamPayments(
        streamStartDate,
        streamEndDate,
        controller.signal
      );

      if (controller.signal.aborted) return;

      const csvContent = [
        "Customer MSISDN,Reference,Network,Amount(GHS),Status,Status Reason,Date",
        ...exportRows.map((p) => {
          const statusReason = (p.statusReason || "").replace(/_/g, " ");
          return [
            escapeCsvValue(p.customerMsisdn),
            escapeCsvValue(p.reference),
            escapeCsvValue(p.network),
            escapeCsvValue(Number(p.amountGhs ?? 0).toFixed(2)),
            escapeCsvValue(p.status),
            escapeCsvValue(statusReason),
            escapeCsvValue(formatStreamDate(p.date)),
          ].join(",");
        }),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `partner-payments_${new Date().toISOString().slice(0, 10)}.csv`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      if (controller.signal.aborted || err?.name === "AbortError" || err?.code === "ERR_CANCELED") return;
      console.error("Failed to export partner payments CSV:", err);
    } finally {
      if (csvExportRequestRef.current === controller) csvExportRequestRef.current = null;
      setIsExportingCsv(false);
      isExportingRef.current = false;
    }
  };

  /* ---------- detail & refresh handlers ---------- */
  const handleViewDetails = async (transactionRef: string) => {
    setLoading(true);
    try {
      const data = await getPayment(transactionRef);
      setSelectedPayment(data);
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!selectedPayment) return;
    setRefreshingStatus(true);
    try {
      const statusData = await getTransactionStatus(
        selectedPayment.provider,
        selectedPayment.transactionRef
      );
      setSelectedPayment((prev) => (prev ? { ...prev, ...statusData } : prev));
      fetchPayments(false);
    } catch (err) {
      console.error("Failed to refresh payment status:", err);
    } finally {
      setRefreshingStatus(false);
    }
  };

  const handleManualRefresh = () => fetchPayments(true);

  const toggleAutoRefresh = () => setIsAutoRefreshEnabled((prev) => !prev);

  /* ---------- apply date range (server-side visual feedback) ---------- */
  const handleApplyDateFilter = () => {
    setIsFiltering(true);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setCurrentPage(1);
    if (startDate && endDate) {
      fetchPartnerTotal(startDate, endDate);
    }
    setTimeout(() => setIsFiltering(false), 400);
  };

  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setCurrentPage(1);
    setPartnerTotalAmount(null);
    partnerTotalRequestRef.current?.abort();
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {displayName}
            </h2>
            <p className="text-sm text-muted-foreground">
              Transactions for {partnerEmail}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isAutoRefreshEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            <span className="hidden sm:inline">
              {isAutoRefreshEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={toggleAutoRefresh}>
            {isAutoRefreshEnabled ? "Pause" : "Resume"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Today&apos;s Collections</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-1">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(todayAmountCollected)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {todaySuccessful} successful of {todayTotalCount} today
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-medium">All-Time Collections</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-1">
            <div className="text-2xl font-bold">{formatCurrency(allTimeAmountCollected)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedRequests} successful of {totalRequests} total
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-1">
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time ({completedRequests}/{totalRequests})
            </p>
            <div className="flex-1" />
            <Separator className="my-2" />
            <p className="text-xs font-medium text-muted-foreground mb-1">Today&apos;s Rate</p>
            <div className="text-lg font-semibold text-green-600">
              {todayTotalCount > 0
                ? ((todaySuccessful / todayTotalCount) * 100).toFixed(1)
                : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground">
              {todaySuccessful} successful of {todayTotalCount} today
            </p>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-4 px-4">
            <CardTitle className="text-sm font-medium">Transaction Breakdown</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col px-4 pb-4 pt-1">
            <div className="flex-1" />
            <Separator className="mb-2" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Successful
                </span>
                <span className="tabular-nums font-medium">
                  <span className="text-green-600">{todaySuccessful}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span>{completedRequests}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Pending
                </span>
                <span className="tabular-nums font-medium">
                  <span className="text-yellow-600">{todayPending}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span>{pendingRequests}</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Failed
                </span>
                <span className="tabular-nums font-medium">
                  <span className="text-red-600">{todayFailed}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span>{failedRequests}</span>
                </span>
              </div>
              {expiredRequests > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-gray-500" />
                    Expired
                  </span>
                  <span className="tabular-nums font-medium">{expiredRequests}</span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground pt-1">Today / All-time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Partner Transactions</CardTitle>
          <CardDescription>Payment transactions initiated by {displayName}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters row */}
          <div className="flex flex-col gap-4 mb-4">
            {/* Search + status + export */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by phone or reference..."
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8 w-full sm:w-[300px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Successful">Successful</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
                <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {formatCurrency(filteredTotalAmount)}
                </span>
              </div>

              {isExportingPdf || isExportingCsv ? (
                <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {isExportingPdf ? "Exporting PDF…" : "Exporting CSV…"}
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => { downloadPDF(); }}>
                      <div className="flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        Export as PDF
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => { downloadCSV(); }}>
                      <div className="flex items-center">
                        <Download className="mr-2 h-4 w-4" />
                        Export as CSV
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Date range filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 p-3 rounded-lg border bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="startDate" className="text-xs text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 w-[160px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="endDate" className="text-xs text-muted-foreground">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 w-[160px]"
                />
              </div>
              <Button size="sm" onClick={handleApplyDateFilter} disabled={isFiltering || (!startDate && !endDate)}>
                {isFiltering ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Filtering…
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Apply
                  </>
                )}
              </Button>
              {(startDate || endDate || appliedStartDate || appliedEndDate) && (
                <Button variant="ghost" size="sm" onClick={handleClearDateFilter}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Customer</TableHead>
                  <TableHead className="text-center">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Network</TableHead>
                  <TableHead className="text-center">Telco Trans ID</TableHead>
                  <TableHead className="text-center">External Reference</TableHead>
                  <TableHead className="text-center">Created</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No transactions found for this partner.
                    </TableCell>
                  </TableRow>
                ) : loading && payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading transactions…
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {payment.mobileNumber}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amountCustomerPays ?? payment.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTelcoLogo(payment.provider)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {(["VOD", "AIR", "GMO"].includes((payment.provider || "").toUpperCase())
                          ? payment.transactionRef
                          : payment.mtnFinancialTransactionId) || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.externalRef}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Calendar className="h-4 w-4 shrink-0" />
                          {formatDate(payment.initiatedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(payment.transactionRef)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {payment.status === "PENDING" && (
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Resend Request
                              </DropdownMenuItem>
                            )}
                            {payment.status === "FAILED" && (
                              <DropdownMenuItem>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry Payment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination & Total footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Showing {rangeStart}–{rangeEnd} of {totalRequests} transactions
              </span>
              <div className="flex items-center gap-1.5">
                <Label htmlFor="ptPageSize" className="text-xs whitespace-nowrap">Rows</Label>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                  <SelectTrigger id="ptPageSize" className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 50, 100].map((s) => (
                      <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage(1)}>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage(totalPages)}>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-green-600 dark:text-green-400 text-lg font-semibold">
              Total: {formatCurrency(filteredTotalAmount)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Detail Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Request Details</DialogTitle>
            <DialogDescription>
              Complete information about this payment request
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedPayment.status)}
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-muted-foreground">Status Reason</Label>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-5 mt-1">
                    {selectedPayment.message ?? "—"}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <p>{selectedPayment.mobileNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Network</Label>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <p>{selectedPayment.provider}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Payment Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <p className="text-lg font-semibold">
                      {formatCurrency(selectedPayment.amountCustomerPays ?? selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fee</Label>
                    <p className="text-sm font-semibold text-orange-600">
                      {formatCurrency(selectedPayment.transactionFee ?? 0)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Amount</Label>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      External Reference
                    </Label>
                    <p className="text-sm font-sans text-gray-900 dark:text-gray-100 truncate">
                      {selectedPayment.externalRef}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Transaction Reference
                    </Label>
                    <p className="text-sm font-sans text-gray-900 dark:text-gray-100 truncate">
                      {(["VOD", "AIR", "GMO"].includes((selectedPayment.provider || "").toUpperCase())
                        ? selectedPayment.transactionRef
                        : selectedPayment.mtnFinancialTransactionId) || "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p>{selectedPayment.mtnPayeeNote}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p>{formatDate(selectedPayment.initiatedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Request ID</Label>
                    <p className="font-mono">{selectedPayment.id}</p>
                  </div>
                  {selectedPayment.completedAt && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Paid At</Label>
                      <p>{formatDate(selectedPayment.completedAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                  Close
                </Button>
                {selectedPayment.status === "PENDING" && (
                  <Button onClick={handleRefreshStatus} disabled={refreshingStatus}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshingStatus ? "animate-spin" : ""}`} />
                    {refreshingStatus ? "Refreshing…" : "Refresh Status"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

