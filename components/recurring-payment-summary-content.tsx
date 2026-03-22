"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Repeat,
  Loader,
  PauseCircle,
  PlayCircle,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getSubscriptions, manageSubscription, getSubscriptionStatus } from "@/lib/recurring";
import { toast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LoginResponse } from "@/types/auth";
import type { RecurringPaymentSubscriptionResponse, TransactionDto } from "@/types/recurring";
import { RecurringPaymentStatus } from "@/types/recurring";

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */
const getStatusIcon = (status: string) => {
  switch (status) {
    case "ACTIVE":
    case "IN_PROGRESS":
    case "COMPLETED":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "CREATED":
    case "PENDING_AUTH":
    case "FIRST_PAYMENT_PENDING":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "FAILED":
    case "CANCELLED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "SUSPENDED":
      return <PauseCircle className="h-4 w-4 text-orange-500" />;
    case "IN_GRACE":
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case "CREATED":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Created</Badge>;
    case "PENDING_AUTH":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Auth</Badge>;
    case "FIRST_PAYMENT_PENDING":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">First Payment Pending</Badge>;
    case "FAILED":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    case "SUSPENDED":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Suspended</Badge>;
    case "IN_GRACE":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">In Grace</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const CYCLE_LABELS: Record<string, string> = {
  DLY: "Daily",
  WKL: "Weekly",
  MON: "Monthly",
};

const NETWORK_LABELS: Record<string, string> = {
  MTN: "MTN",
  VOD: "Telecel",
  AIR: "AirtelTigo",
};

const NETWORK_LOGOS: Record<string, string> = {
  MTN: "/mtn-momo.png",
  VOD: "/telecel-cash.webp",
  AIR: "/airtel-tigo.png",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function RecurringPaymentSummaryContent() {
  const [subscriptions, setSubscriptions] = useState<RecurringPaymentSubscriptionResponse[]>([]);
  const [selectedSub, setSelectedSub] = useState<RecurringPaymentSubscriptionResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<LoginResponse | null>(null);

  /* ---------- date range filter (client-side) ---------- */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  /* ---------- manage subscription (suspend / cancel) ---------- */
  const [loadingAction, setLoadingAction] = useState<{ subscriptionId: string; action: string } | null>(null);
  const [alertOpen, setAlertOpen] = useState<{ subscriptionId: string; action: "suspend" | "cancel" | "resume" } | null>(null);

  /* ---------- payment history dialog ---------- */
  const [paymentHistorySub, setPaymentHistorySub] = useState<RecurringPaymentSubscriptionResponse | null>(null);
  const [paymentHistoryTxns, setPaymentHistoryTxns] = useState<TransactionDto[]>([]);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  // Export loading flags
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const isActionLoading = (subscriptionId: string, action: string) =>
    loadingAction?.subscriptionId === subscriptionId && loadingAction?.action === action;

  const handleManageAction = async (subscriptionId: string, action: "suspend" | "cancel" | "resume") => {
    if (!subscriptionId) return;
    setLoadingAction({ subscriptionId, action });
    try {
      await manageSubscription(subscriptionId, action);

      if (action === "cancel") {
        setSubscriptions((prev) => prev.map((s) =>
          s.subscriptionId === subscriptionId ? { ...s, status: RecurringPaymentStatus.CANCELLED } : s
        ));
      } else if (action === "suspend") {
        setSubscriptions((prev) => prev.map((s) =>
          s.subscriptionId === subscriptionId ? { ...s, status: RecurringPaymentStatus.SUSPENDED } : s
        ));
      } else if (action === "resume") {
        setSubscriptions((prev) => prev.map((s) =>
          s.subscriptionId === subscriptionId ? { ...s, status: RecurringPaymentStatus.ACTIVE } : s
        ));
      }

      const actionLabel = action === "suspend" ? "suspended" : action === "cancel" ? "cancelled" : "resumed";
      toast({
        title: "Success",
        description: `Subscription has been ${actionLabel} successfully.`,
      });
      setAlertOpen(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        `Failed to ${action} subscription`;
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  /* ---------- payment history ---------- */
  const handleViewPaymentHistory = async (sub: RecurringPaymentSubscriptionResponse) => {
    setPaymentHistorySub(sub);
    setPaymentHistoryTxns([]);
    setPaymentHistoryLoading(true);
    try {
      const res = await getSubscriptionStatus(sub.subscriptionId);
      setPaymentHistoryTxns(res.transactions || []);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || err.message || "Failed to fetch payment history",
        variant: "destructive",
      });
    } finally {
      setPaymentHistoryLoading(false);
    }
  };

  /* ---------- load user ---------- */
  useEffect(() => {
    const stored = getUser();
    setUser(stored);
  }, []);

  /* ---------- fetch subscriptions ---------- */
  const fetchSubscriptions = useCallback(async (email: string, showLoading = true) => {
    if (!email) return;
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptions(email);
      setSubscriptions(data || []);
      setLastRefresh(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch subscriptions");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    if (user?.email) {
      fetchSubscriptions(user.email, true);
    }
  }, [user, fetchSubscriptions]);

  // Auto-refresh
  useEffect(() => {
    if (!user?.email || !isAutoRefreshEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchSubscriptions(user.email, false);
    }, 15000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.email, isAutoRefreshEnabled, fetchSubscriptions]);

  const handleManualRefresh = () => {
    if (user?.email) fetchSubscriptions(user.email, true);
  };
  const toggleAutoRefresh = () => setIsAutoRefreshEnabled((prev) => !prev);

  /* ---------- date filter ---------- */
  const handleApplyDateFilter = () => {
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 400);
  };

  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
  };

  /* ---------- downloads ---------- */
  const downloadPDF = () => {
    if (filteredSubscriptions.length === 0) return;
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(14);
      doc.text(user?.organizationName || "Partner", 14, 16);
      doc.setFontSize(11);
      doc.text("Recurring Payment Subscriptions", 14, 23);


      const body = filteredSubscriptions.map((s) => [
        s.subscriptionId,
        s.customerName,
        s.customerNumber,
        CYCLE_LABELS[s.cycle] || s.cycle,
        NETWORK_LABELS[s.networkProvider] || s.networkProvider,
        Number(s.billingAmount ?? s.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 }),
        s.paidCount ?? "—",
        s.status,
        formatDate(s.startDate),
        formatDate(s.endDate),
      ]);

      autoTable(doc, {
        head: [[
          "Subscription ID",
          "Customer",
          "Number",
          "Cycle",
          "Network",
          "Amount(GHS)",
          "Paid Count",
          "Status",
          "Start",
          "End",
        ]],
        body,
        startY: 28,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: "#22c55e" },
      });

      doc.save(`recurring_subscriptions_${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const downloadCSV = () => {
    if (filteredSubscriptions.length === 0) return;
    setIsExportingCsv(true);
    try {
      const csvContent = [
        "Subscription ID,Customer Name,Customer Number,Cycle,Network,Amount(GHS),Paid Count,Status,Start Date,End Date",
        ...filteredSubscriptions.map((s) =>
          [
            s.subscriptionId,
            `"${s.customerName}"`,
            s.customerNumber,
            CYCLE_LABELS[s.cycle] || s.cycle,
            NETWORK_LABELS[s.networkProvider] || s.networkProvider,
            Number(s.billingAmount ?? s.amount).toFixed(2),
            s.paidCount ?? "—",
            s.status,
            formatDate(s.startDate),
            formatDate(s.endDate),
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `recurring_subscriptions_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExportingCsv(false);
    }
  };

  /* ---------- filter logic ---------- */
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (sub.customerName || "").toLowerCase().includes(term) ||
      (sub.customerNumber || "").toLowerCase().includes(term) ||
      (sub.subscriptionId || "").toLowerCase().includes(term) ||
      (sub.mandateReference || "").toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;

    let matchesDate = true;
    if (startDate) {
      const subDate = new Date(sub.startDate);
      const filterStart = new Date(startDate);
      filterStart.setHours(0, 0, 0, 0);
      if (subDate < filterStart) matchesDate = false;
    }
    if (endDate) {
      const subDate = new Date(sub.startDate);
      const filterEnd = new Date(endDate);
      filterEnd.setHours(23, 59, 59, 999);
      if (subDate > filterEnd) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
    const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
    return dateB - dateA;
  });

  /* ---------- summary cards ---------- */
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === RecurringPaymentStatus.ACTIVE || s.status === RecurringPaymentStatus.IN_PROGRESS
  ).length;
  const pendingSubscriptions = subscriptions.filter(
    (s) =>
      s.status === RecurringPaymentStatus.PENDING_AUTH ||
      s.status === RecurringPaymentStatus.FIRST_PAYMENT_PENDING ||
      s.status === RecurringPaymentStatus.CREATED
  ).length;
  const totalAmount = subscriptions
    .filter((s) => s.status === RecurringPaymentStatus.ACTIVE || s.status === RecurringPaymentStatus.IN_PROGRESS)
    .reduce((sum, s) => sum + Number(s.billingAmount ?? s.amount), 0);
  const filteredTotalAmount = filteredSubscriptions.reduce((sum, s) => sum + Number(s.billingAmount ?? s.amount), 0);

  /* ---------- helpers ---------- */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).replace(",", "");
  };

  const getNetworkLogo = (provider: string) => {
    const logo = NETWORK_LOGOS[provider];
    if (!logo) return <span className="text-sm">{provider}</span>;
    return (
      <img
        src={logo}
        alt={NETWORK_LABELS[provider] || provider}
        className="h-8 w-8 rounded-lg object-contain bg-white p-0.5"
      />
    );
  };

  /* ---------- render ---------- */
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Recurring Payment Summary</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
            <div
              className={`h-2 w-2 rounded-full ${isAutoRefreshEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
            />
            <span className="hidden sm:inline">
              {isAutoRefreshEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={toggleAutoRefresh}>
            {isAutoRefreshEnabled ? "Pause" : "Resume"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={() => router.push("/recurring-payments")}>
            <Plus className="h-4 w-4 mr-2" />
            New Subscription
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Repeat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">All recurring subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Sum of active subscription amounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Awaiting authorization / payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
          <CardDescription>Track all recurring payment subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 mb-4">
            {/* Search & filter row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, number or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-[300px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="PENDING_AUTH">Pending Auth</SelectItem>
                    <SelectItem value="FIRST_PAYMENT_PENDING">First Payment Pending</SelectItem>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    <SelectItem value="IN_GRACE">In Grace</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    <Download className="h-4 w-4 mr-2" />
                    {isExportingPdf || isExportingCsv ? "Exporting..." : "Export"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={downloadPDF}
                    disabled={isExportingPdf || isExportingCsv}
                  >
                    <div className="flex items-center">
                      {isExportingPdf ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Export as PDF
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={downloadCSV}
                    disabled={isExportingPdf || isExportingCsv}
                  >
                    <div className="flex items-center">
                      {isExportingCsv ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      Export as CSV
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Date range filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 p-3 rounded-lg border bg-muted/30">
              <div className="space-y-1">
                <Label htmlFor="recStartDate" className="text-xs text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  id="recStartDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 w-[160px]"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="recEndDate" className="text-xs text-muted-foreground">
                  End Date
                </Label>
                <Input
                  id="recEndDate"
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
              {(startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={handleClearDateFilter}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Paid Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading subscriptions…
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.subscriptionId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{sub.customerName}</div>
                          <div className="text-sm text-muted-foreground font-mono">{sub.customerNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(Number(sub.billingAmount ?? sub.amount))}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{CYCLE_LABELS[sub.cycle] || sub.cycle}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{sub.paidCount ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(sub.status)}
                          {getStatusBadge(sub.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getNetworkLogo(sub.networkProvider)}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(sub.startDate)}</TableCell>
                      <TableCell>{formatDateTime(sub.endDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setSelectedSub(sub)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {/* Payment History — only when paidCount > 0 */}
                            {Number(sub.paidCount) > 0 && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewPaymentHistory(sub)}>
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Payment History
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Suspend — only for ACTIVE or IN_PROGRESS */}
                            {(sub.status === RecurringPaymentStatus.ACTIVE ||
                              sub.status === RecurringPaymentStatus.IN_PROGRESS ||
                              sub.status === RecurringPaymentStatus.FIRST_PAYMENT_PENDING) && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setAlertOpen({ subscriptionId: sub.subscriptionId, action: "suspend" })}
                                >
                                  <PauseCircle className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Cancel — show for non-cancelled/non-completed */}
                            {sub.status !== RecurringPaymentStatus.CANCELLED &&
                              sub.status !== RecurringPaymentStatus.COMPLETED &&
                              sub.status !== RecurringPaymentStatus.FAILED && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setAlertOpen({ subscriptionId: sub.subscriptionId, action: "cancel" })}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}

                            {/* Resume — only for SUSPENDED subscriptions */}
                            {sub.status === RecurringPaymentStatus.SUSPENDED && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setAlertOpen({ subscriptionId: sub.subscriptionId, action: "resume" })}
                                  className="text-green-600 focus:text-green-600"
                                >
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  Resume
                                </DropdownMenuItem>
                              </>
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

          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
            <div>
              Showing {filteredSubscriptions.length} of {subscriptions.length} subscriptions
            </div>
            <div className="text-green-600 dark:text-green-400 text-lg font-semibold">
              Total: {formatCurrency(filteredTotalAmount)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standalone Alert Dialogs for Manage Actions */}
      {(() => {
        const alertSub = alertOpen
          ? subscriptions.find((s) => s.subscriptionId === alertOpen.subscriptionId)
          : null;

        return (
          <>
            {/* Suspend Alert */}
            <AlertDialog
              open={alertOpen?.action === "suspend"}
              onOpenChange={(open) => { if (!open) setAlertOpen(null); }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Suspend Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to suspend the subscription for{" "}
                    <strong>{alertSub?.customerName}</strong> ({alertSub?.subscriptionId})?
                    The recurring payments will be paused.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setAlertOpen(null)}>
                    Go Back
                  </AlertDialogCancel>
                  <Button
                    onClick={() => {
                      if (alertOpen?.subscriptionId) {
                        handleManageAction(alertOpen.subscriptionId, "suspend");
                      }
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700"
                    disabled={!!alertOpen && isActionLoading(alertOpen.subscriptionId, "suspend")}
                  >
                    {alertOpen && isActionLoading(alertOpen.subscriptionId, "suspend") && (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Confirm Suspend
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Cancel Alert */}
            <AlertDialog
              open={alertOpen?.action === "cancel"}
              onOpenChange={(open) => { if (!open) setAlertOpen(null); }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel the subscription for{" "}
                    <strong>{alertSub?.customerName}</strong> ({alertSub?.subscriptionId})?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setAlertOpen(null)}>
                    Keep Subscription
                  </AlertDialogCancel>
                  <Button
                    onClick={() => {
                      if (alertOpen?.subscriptionId) {
                        handleManageAction(alertOpen.subscriptionId, "cancel");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={!!alertOpen && isActionLoading(alertOpen.subscriptionId, "cancel")}
                  >
                    {alertOpen && isActionLoading(alertOpen.subscriptionId, "cancel") && (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Confirm Cancel
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Resume Alert */}
            <AlertDialog
              open={alertOpen?.action === "resume"}
              onOpenChange={(open) => { if (!open) setAlertOpen(null); }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resume Subscription</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to resume the subscription for{" "}
                    <strong>{alertSub?.customerName}</strong> ({alertSub?.subscriptionId})?
                    Recurring payments will be reactivated.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setAlertOpen(null)}>
                    Go Back
                  </AlertDialogCancel>
                  <Button
                    onClick={() => {
                      if (alertOpen?.subscriptionId) {
                        handleManageAction(alertOpen.subscriptionId, "resume");
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!!alertOpen && isActionLoading(alertOpen.subscriptionId, "resume")}
                  >
                    {alertOpen && isActionLoading(alertOpen.subscriptionId, "resume") && (
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Confirm Resume
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        );
      })()}

      {/* Detail Dialog */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>Complete information about this recurring subscription</DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedSub.status)}
                    {getStatusBadge(selectedSub.status)}
                  </div>
                  {selectedSub.status === RecurringPaymentStatus.PENDING_AUTH && (
                    <p className="text-xs text-red-600 font-medium mt-1">Reason: REFUSED TO AUTHORIZE OTP</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <Label className="text-sm font-medium text-muted-foreground">Subscription ID</Label>
                  <p className="text-sm font-mono mt-1">{selectedSub.subscriptionId}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Customer Name</Label>
                    <p>{selectedSub.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Customer Number</Label>
                    <p className="font-mono">{selectedSub.customerNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Network</Label>
                    <div className="flex items-center gap-2">
                      {getNetworkLogo(selectedSub.networkProvider)}
                      <span>{NETWORK_LABELS[selectedSub.networkProvider] || selectedSub.networkProvider}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Subscription Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <p className="text-lg font-semibold">{formatCurrency(Number(selectedSub.billingAmount ?? selectedSub.amount))}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Cycle</Label>
                    <p>{CYCLE_LABELS[selectedSub.cycle] || selectedSub.cycle}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Mandate Reference</Label>
                    <p className="font-mono text-sm">{selectedSub.mandateReference || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Paid Count</Label>
                    <p className="font-semibold">{selectedSub.paidCount ?? "—"}</p>
                  </div>
                  {/* Outstanding Balance field removed as requested */}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Dates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p>{formatDateTime(selectedSub.startDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                    <p>{formatDateTime(selectedSub.endDate)}</p>
                  </div>
                  {selectedSub.authorizationTimestamp && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Authorized At</Label>
                      <p>{formatDateTime(selectedSub.authorizationTimestamp)}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedSub.message && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Message</Label>
                    <p className="text-sm mt-1">{selectedSub.message}</p>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedSub(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog
        open={!!paymentHistorySub}
        onOpenChange={(open) => {
          if (!open) {
            setPaymentHistorySub(null);
            setPaymentHistoryTxns([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-green-600" />
              Payment History
            </DialogTitle>
            <DialogDescription>
              {paymentHistorySub
                ? `${paymentHistorySub.customerName} — ${paymentHistorySub.customerNumber}`
                : "Transaction records for this subscription"}
            </DialogDescription>
          </DialogHeader>

          {paymentHistoryLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader className="h-8 w-8 animate-spin text-green-600" />
              <p className="text-sm text-muted-foreground">Fetching payment history…</p>
            </div>
          ) : paymentHistoryTxns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <Receipt className="h-10 w-10 opacity-40" />
              <p className="text-sm">No transactions found for this subscription.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {paymentHistoryTxns.map((txn, idx) => {
                const isSuccess =
                  txn.transStatus?.toLowerCase() === "success" ||
                  txn.transStatus?.toLowerCase() === "completed";
                const isFailed =
                  txn.transStatus?.toLowerCase() === "failed" ||
                  txn.transStatus?.toLowerCase() === "error";

                return (
                  <div
                    key={txn.transId || idx}
                    className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/40"
                  >
                    {/* Status indicator */}
                    <div
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        isSuccess
                          ? "bg-green-100 text-green-600"
                          : isFailed
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {isSuccess ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : isFailed ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={
                            isSuccess
                              ? "border-green-300 text-green-700 bg-green-50"
                              : isFailed
                              ? "border-red-300 text-red-700 bg-red-50"
                              : "border-amber-300 text-amber-700 bg-amber-50"
                          }
                        >
                          {txn.transStatus || "—"}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {txn.transDate || "—"}
                        </span>
                      </div>
                      {txn.transMsg && (
                        <p className="text-sm text-muted-foreground leading-snug">
                          {txn.transMsg}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {!paymentHistoryLoading && paymentHistoryTxns.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {paymentHistoryTxns.length} transaction{paymentHistoryTxns.length !== 1 ? "s" : ""}
              </p>
            )}
            <div className="ml-auto">
              <Button variant="outline" onClick={() => setPaymentHistorySub(null)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

