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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getPayment, getPayments, getTransactionStatus, getPaymentsStatusSummary } from "@/lib/payment";
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

const mapApiStatus = (status: string) => {
  switch (status.toUpperCase()) {
    case "SUCCESSFUL":
      return "completed";
    case "ONGOING":
    case "PENDING":
      return "pending";
    case "FAILED":
      return "failed";
    default:
      return "expired";
  }
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
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  /* ---------- date range filter (client-side) ---------- */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const displayName = partnerName || partnerEmail;

  /* ---------- fetch payments for the selected partner ---------- */
  const fetchPayments = useCallback(
    async (showLoading = true) => {
      if (!partnerEmail) return;
      if (showLoading) setLoading(true);

      try {
        const data = await getPayments(partnerEmail);
        setPayments(data || []);
        setLastRefresh(new Date());
      } catch (err: any) {
        console.error("Failed to fetch partner payments:", err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [partnerEmail]
  );

  /* ---------- initial fetch ---------- */
  useEffect(() => {
    fetchPayments(true);
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

  /* ---------- status summary for delta cards ---------- */
  const [lastMonth, setLastMonth] = useState<{
    total: number;
    completed: number;
    pending: number;
    amount: number;
  }>({ total: 0, completed: 0, pending: 0, amount: 0 });

  useEffect(() => {
    if (!partnerEmail) return;
    getPaymentsStatusSummary(partnerEmail)
      .then((res) => {
        const completed = res.SUCCESS ?? 0;
        const pending = res.ONGOING ?? 0;
        const total = Object.values(res).reduce((a, b) => a + (b ?? 0), 0);
        setLastMonth({ total, completed, pending, amount: 0 });
      })
      .catch(() => setLastMonth({ total: 0, completed: 0, pending: 0, amount: 0 }));
  }, [partnerEmail]);

  /* ---------- telco logos ---------- */
  const telcos = [
    { name: "mtn", logo: "/mtn-momo.png" },
    { name: "telecel", logo: "/telecel-cash.webp" },
    { name: "airteltigo", logo: "/airtel-tigo.png" },
    { name: "gmoney", logo: "/gmoney.jpg" },
  ];
  const getTelcoLogo = (provider = "") => {
    const src =
      telcos.find((t) => provider.toLowerCase().includes(t.name))?.logo ??
      "/unknown-telco.webp";
    return (
      <img
        src={src}
        alt={provider}
        className="h-12 w-12 rounded-lg object-contain bg-white p-1"
      />
    );
  };

  /* ---------- filtering (including client-side date range) ---------- */
  const filteredPayments = payments.filter((payment) => {
    const mappedStatus = mapApiStatus(payment.status);
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (payment.mobileNumber || "").toLowerCase().includes(term) ||
      (payment.transactionRef || "").toLowerCase().includes(term) ||
      (payment.externalRef || "").toLowerCase().includes(term) ||
      (payment.mtnFinancialTransactionId || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter === "all" || mappedStatus === statusFilter;

    /* date range — client-side only */
    let matchesDate = true;
    if (startDate) {
      const paymentDate = new Date(payment.initiatedAt);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (paymentDate < start) matchesDate = false;
    }
    if (endDate) {
      const paymentDate = new Date(payment.initiatedAt);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (paymentDate > end) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  /* ---------- summary stats ---------- */
  const completedStatuses = ["SUCCESSFUL"];
  const pendingStatuses = ["PENDING"];

  const totalRequests = payments.length;
  const completedRequests = payments.filter((p) => completedStatuses.includes(p.status)).length;
  const pendingRequests = payments.filter((p) => pendingStatuses.includes(p.status)).length;
  const totalAmount = payments
    .filter((p) => completedStatuses.includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
  const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

  /* total based on the currently visible (filtered) list */
  const filteredTotalAmount = filteredPayments
    .filter((p) => completedStatuses.includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  /* ---------- helpers ---------- */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const delta = (current: number, previous: number) => {
    if (previous === 0) return { pct: 0, arrow: "→", color: "text-gray-500" };
    const pct = ((current - previous) / previous) * 100;
    return {
      pct: Math.abs(pct).toFixed(1),
      arrow: pct > 0 ? "↗" : pct < 0 ? "↘" : "→",
      color: pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "text-gray-500",
    };
  };

  /* ---------- export ---------- */
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(`${displayName} — Payments Report`, 14, 16);

    const body = filteredPayments.map((p) => [
      p.mobileNumber,
      p.externalRef,
      mapApiStatus(p.status),
      p.provider,
      Number(p.amount).toLocaleString("en-GH", { minimumFractionDigits: 2 }),
      formatDate(p.initiatedAt),
    ]);

    autoTable(doc, {
      head: [["Phone", "Reference", "Status", "Network", "Amount(GHS)", "Date"]],
      body,
      startY: 24,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: "#22c55e" },
    });

    doc.save(`partner-payments_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadCSV = () => {
    const csvContent = [
      "Phone,Reference,Status,Network,Amount(GHS),Date",
      ...filteredPayments.map((p) =>
        [
          p.mobileNumber,
          p.externalRef,
          mapApiStatus(p.status),
          p.provider,
          Number(p.amount).toFixed(2),
          formatDate(p.initiatedAt),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `partner-payments_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    setLoading(true);
    try {
      const statusData = await getTransactionStatus(
        selectedPayment.provider,
        selectedPayment.transactionRef
      );
      setSelectedPayment((prev: any) => ({ ...prev, ...statusData }));
    } catch (err) {
      console.error("Failed to refresh payment status:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => fetchPayments(true);

  const toggleAutoRefresh = () => setIsAutoRefreshEnabled((prev) => !prev);

  /* ---------- apply date range (client-side visual feedback) ---------- */
  const handleApplyDateFilter = () => {
    setIsFiltering(true);
    // Brief visual feedback — filtering is already reactive via filteredPayments
    setTimeout(() => setIsFiltering(false), 400);
  };

  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className={cn("text-xs flex items-center", delta(totalRequests, lastMonth.total).color)}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {delta(totalRequests, lastMonth.total).pct}%{" "}
              {delta(totalRequests, lastMonth.total).arrow} from summary
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className={cn("text-xs flex items-center", delta(totalAmount, lastMonth.amount).color)}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {delta(totalAmount, lastMonth.amount).pct}%{" "}
              {delta(totalAmount, lastMonth.amount).arrow} from summary
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className={cn("text-xs flex items-center", delta(pendingRequests, lastMonth.pending).color)}>
              <Clock className="h-3 w-3 mr-1" />
              {delta(pendingRequests, lastMonth.pending).pct}%{" "}
              {delta(pendingRequests, lastMonth.pending).arrow} from summary
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p
              className={cn(
                "text-xs flex items-center",
                delta(
                  successRate,
                  lastMonth.total > 0 ? (lastMonth.completed / lastMonth.total) * 100 : 0
                ).color
              )}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {delta(
                successRate,
                lastMonth.total > 0 ? (lastMonth.completed / lastMonth.total) * 100 : 0
              ).pct}
              %{" "}
              {delta(
                successRate,
                lastMonth.total > 0 ? (lastMonth.completed / lastMonth.total) * 100 : 0
              ).arrow}{" "}
              from summary
            </p>
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full sm:w-[300px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Successful</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <DropdownMenuItem onClick={downloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadCSV}>
                    <Download className="mr-2 h-4 w-4" />
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              {(startDate || endDate) && (
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>MTN Trans ID</TableHead>
                  <TableHead>External Reference</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 && !loading ? (
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
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {payment.mobileNumber}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
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
                        {payment.mtnFinancialTransactionId}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.externalRef}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(payment.initiatedAt)}
                        </div>
                      </TableCell>
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

          {/* Total footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
            <div>
              Showing {filteredPayments.length} of {payments.length} transactions
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
                      {selectedPayment.mtnFinancialTransactionId}
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
                  {selectedPayment.paidAt && (
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
                  <Button onClick={handleRefreshStatus}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
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

