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
  Plus,
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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getPayment, getPayments, getTransactionStatus } from "@/lib/payment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LoginResponse } from "@/types/auth";
import { getPaymentsStatusSummary } from "@/lib/payment";

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

export function PaymentsContent() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<LoginResponse | null>(null);

  // Use ref to store interval ID for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  // Debug wrapper for fetchPayments
  const fetchPayments = useCallback(async (email: string, showLoading = true, source = "unknown") => {
    console.log(`[${new Date().toISOString()}] fetchPayments called from: ${source}`, { email, showLoading });

    if (!email) {
      console.error("fetchPayments: No email provided");
      setError("No user email available");
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log(`[${new Date().toISOString()}] Calling getPayments API...`);
      const data = await getPayments(email);
      console.log(`[${new Date().toISOString()}] getPayments returned:`, { count: data?.length || 0, data });

      setPayments(data || []);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error(`[${new Date().toISOString()}] Failed to fetch payments:`, err);
      setError(err.message || "Failed to fetch payments");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Get user on mount - CRITICAL: This must run first
  useEffect(() => {
    console.log("Component mounted, getting user...");
    const stored = getUser();
    console.log("getUser returned:", stored);
    setUser(stored);
  }, []);

  // IMMEDIATE fetch when user is available - don't wait for interval
  useEffect(() => {
    console.log("User effect triggered:", { user, email: user?.email });
    if (user?.email) {
      console.log("User available, fetching payments immediately...");
      fetchPayments(user.email, true, "user-effect");
    } else {
      console.log("No user email yet, skipping fetch");
    }
  }, [user, fetchPayments]);

  // Setup auto-refresh interval
  useEffect(() => {
    console.log("Interval setup effect triggered:", { isAutoRefreshEnabled, userEmail: user?.email });

    if (!user?.email) {
      console.log("No user email, not setting up interval");
      return;
    }

    if (!isAutoRefreshEnabled) {
      console.log("Auto-refresh disabled, clearing interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      console.log("Clearing existing interval");
      clearInterval(intervalRef.current);
    }

    console.log("Setting up new 8-second interval");
    // Set up new interval
    intervalRef.current = setInterval(() => {
      console.log(`[${new Date().toISOString()}] Interval tick - fetching payments`);
      fetchPayments(user.email, false, "interval");
    }, 8000);

    // Cleanup
    return () => {
      console.log("Cleaning up interval");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user?.email, isAutoRefreshEnabled, fetchPayments]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    console.log("Manual refresh clicked");
    if (user?.email) {
      fetchPayments(user.email, true, "manual-refresh");
    } else {
      console.error("Cannot refresh - no user email");
      setError("Please log in to refresh payments");
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setIsAutoRefreshEnabled((prev) => {
      const newValue = !prev;
      console.log("Auto-refresh toggled:", newValue);
      return newValue;
    });
  };

  const downloadPDF = () => {
    if (!user) return;

    const doc = new jsPDF({ orientation: "landscape" });
    doc.text(user?.organizationName || "PAYMENTS REPORT", 14, 16);

    const body = filteredPayments.map((p) => [
      p.mobileNumber,
      p.transactionRef,
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

    doc.save(`payments_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

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

  const [lastMonth, setLastMonth] = useState<{
    total: number;
    completed: number;
    pending: number;
    amount: number;
  }>({ total: 0, completed: 0, pending: 0, amount: 0 });

  useEffect(() => {
    if (!user?.email) return;
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    getPaymentsStatusSummary(user.email)
      .then((res) => {
        const completed = res.SUCCESS ?? 0;
        const pending = res.ONGOING ?? 0;
        const total = Object.values(res).reduce((a, b) => a + (b ?? 0), 0);
        const amount = 0;
        setLastMonth({ total, completed, pending, amount });
      })
      .catch(() => setLastMonth({ total: 0, completed: 0, pending: 0, amount: 0 }));
  }, [user?.email]);

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

  const delta = (current: number, previous: number) => {
    if (previous === 0) return { pct: 0, arrow: "→", color: "text-gray-500" };
    const pct = ((current - previous) / previous) * 100;
    return {
      pct: Math.abs(pct).toFixed(1),
      arrow: pct > 0 ? "↗" : pct < 0 ? "↘" : "→",
      color: pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "text-gray-500",
    };
  };

  const filteredPayments = payments.filter((payment) => {
    const mappedStatus = mapApiStatus(payment.status);
    const matchesSearch =
      payment.mobileNumber?.includes(searchTerm) ||
      payment.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || mappedStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const completedStatuses = ["SUCCESSFUL"];
  const pendingStatuses = ["PENDING"];

  const totalRequests = payments.length;
  const completedRequests = payments.filter((p) => completedStatuses.includes(p.status)).length;
  const pendingRequests = payments.filter((p) => pendingStatuses.includes(p.status)).length;
  const totalAmount = payments
    .filter((p) => completedStatuses.includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
  const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastRefresh = () => {
    return lastRefresh.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Payments Summary</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
            <div className={`h-2 w-2 rounded-full ${isAutoRefreshEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            <span className="hidden sm:inline">
              {isAutoRefreshEnabled ? "Auto-refresh ON" : "Auto-refresh OFF"}
            </span>
            {/*<span className="text-xs">({formatLastRefresh()})</span>*/}
          </div>

          <Button variant="outline" size="sm" onClick={toggleAutoRefresh}>
            {isAutoRefreshEnabled ? "Pause" : "Resume"}
          </Button>

          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={() => router.push("/request-payment")}>
            <Plus className="h-4 w-4 mr-2" />
            Request Payment
          </Button>
        </div>
      </div>

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
              {delta(totalRequests, lastMonth.total).pct}%
              {delta(totalRequests, lastMonth.total).arrow}
              from last month
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
              {delta(totalAmount, lastMonth.amount).pct}% {delta(totalAmount, lastMonth.amount).arrow} from last month
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
              {delta(pendingRequests, lastMonth.pending).pct}% {delta(pendingRequests, lastMonth.pending).arrow} from last month
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
                delta(successRate, (lastMonth.completed / lastMonth.total) * 100).color
              )}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {delta(successRate, (lastMonth.completed / lastMonth.total) * 100).pct}%{" "}
              {delta(successRate, (lastMonth.completed / lastMonth.total) * 100).arrow} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments </CardTitle>
          <CardDescription>Track all payment requests </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
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
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={downloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

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
                      No payments found. {user?.email ? "" : "Please log in to view payments."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm text-muted-foreground">{payment.mobileNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          {getStatusBadge(payment.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">{getTelcoLogo(payment.provider)}</div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{payment.mtnFinancialTransactionId}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.externalRef}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleViewDetails(payment.transactionRef)}>
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

          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
            <div></div>
            <div className="text-green-600 dark:text-green-400 text-lg font-semibold">
              Total: {formatCurrency(totalAmount)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Request Details</DialogTitle>
            <DialogDescription>Complete information about this payment request</DialogDescription>
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
                    <p className="text-lg font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">External Reference</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-sans text-gray-900 dark:text-gray-100 truncate">
                        {selectedPayment.externalRef}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Transaction Reference</Label>
                    <p className="text-sm font-sans text-gray-900 dark:text-gray-100 truncate">
                      {selectedPayment.transactionRef}
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