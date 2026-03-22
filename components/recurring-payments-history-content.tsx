"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getUser } from "@/lib/auth"
import { getSubscriptions } from "@/lib/recurring"
import { RecurringPaymentSubscriptionResponse, RecurringPaymentStatus } from "@/types/recurring"
import { LoginResponse } from "@/types/auth"
import { ArrowLeft, CheckCircle2, Clock3, PauseCircle, AlertTriangle, RefreshCw, XCircle, Eye, ChevronLeft, ChevronRight, Download, TrendingUp, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Props {
  userEmail: string
  partnerName?: string
}

function formatCurrency(amount?: number | null) {
  if (!amount || isNaN(amount)) return "0.00"
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDateTime(value?: string | null) {
  if (!value) return "-"
  const date = new Date(value)
  if (isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatCycle(cycle?: string | null) {
  switch (cycle) {
    case "DLY":
      return "Daily"
    case "WKL":
      return "Weekly"
    case "MON":
      return "Monthly"
    default:
      return cycle || "-"
  }
}

function getStatusConfig(status?: RecurringPaymentStatus | string | null) {
  const value = (status || "").toString()
  switch (value) {
    case "ACTIVE":
    case "IN_PROGRESS":
    case "COMPLETED":
      return {
        variant: "success" as const,
        icon: CheckCircle2,
        label: value.replace(/_/g, " "),
      }
    case "CREATED":
    case "PENDING_AUTH":
    case "FIRST_PAYMENT_PENDING":
    case "IN_GRACE":
      return {
        variant: "warning" as const,
        icon: Clock3,
        label: value.replace(/_/g, " "),
      }
    case "FAILED":
    case "CANCELLED":
      return {
        variant: "destructive" as const,
        icon: XCircle,
        label: value.replace(/_/g, " "),
      }
    case "SUSPENDED":
      return {
        variant: "outline" as const,
        icon: PauseCircle,
        label: value.replace(/_/g, " "),
      }
    default:
      return {
        variant: "secondary" as const,
        icon: AlertTriangle,
        label: value || "UNKNOWN",
      }
  }
}

export function RecurringPaymentsHistoryContent({ userEmail, partnerName }: Props) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null)
  const [subscriptions, setSubscriptions] = useState<RecurringPaymentSubscriptionResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // pagination
  const [page, setPage] = useState(1)
  const pageSize = 10

  // view details dialog
  const [selected, setSelected] = useState<RecurringPaymentSubscriptionResponse | null>(null)

  useEffect(() => {
    setCurrentUser(getUser())
  }, [])

  const loadData = async () => {
    if (!userEmail) {
      setError("Missing user email. Unable to load recurring payment history.")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await getSubscriptions(userEmail)
      const sorted = [...data].sort((a, b) => {
        const aTime = a.authorizationTimestamp ? new Date(a.authorizationTimestamp).getTime() : 0
        const bTime = b.authorizationTimestamp ? new Date(b.authorizationTimestamp).getTime() : 0
        return bTime - aTime
      })
      setSubscriptions(sorted)
      setPage(1)
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.title ||
        err?.message ||
        "Failed to load recurring subscriptions"
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail])

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return subscriptions.filter((s) => {
      const matchesSearch =
        !term ||
        s.customerName?.toLowerCase().includes(term) ||
        s.customerNumber?.toLowerCase().includes(term) ||
        s.subscriptionId?.toLowerCase().includes(term) ||
        s.mandateReference?.toLowerCase().includes(term)

      const matchesStatus = statusFilter === "all" || s.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [subscriptions, searchTerm, statusFilter])

  const totalSubscriptions = subscriptions.length
  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE").length
  const totalBillingAmount = subscriptions.reduce((sum, s) => sum + (Number(s.billingAmount) || 0), 0)

  const displayName = partnerName || userEmail

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Recurring Payments History", 14, 20)
    doc.setFontSize(10)
    doc.text(`Partner: ${displayName}`, 14, 28)
    if (currentUser?.email) {
      doc.text(`Generated by: ${currentUser.email}`, 14, 34)
    }
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40)

    const rows = filtered.map((s) => [
      s.subscriptionId,
      s.customerName,
      s.customerNumber,
      s.paidCount ?? 0,
      Number(s.billingAmount) || 0,
      s.cycle,
      s.status,
      s.networkProvider,
      s.startDate ? formatDateTime(s.startDate as any) : "-",
      s.endDate ? formatDateTime(s.endDate as any) : "-",
    ])

    autoTable(doc, {
      startY: 48,
      head: [[
        "Subscription ID",
        "Customer Name",
        "Customer Number",
        "Paid Count",
        "Billing Amount",
        "Cycle",
        "Status",
        "Network",
        "Start Date",
        "End Date",
      ]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    doc.save(`recurring-history-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  const handleExportCSV = () => {
    const header = [
      "Subscription ID",
      "Customer Name",
      "Customer Number",
      "Paid Count",
      "Billing Amount",
      "Cycle",
      "Status",
      "Network",
      "Start Date",
      "End Date",
    ]

    const rows = filtered.map((s) => [
      s.subscriptionId,
      s.customerName ?? "",
      s.customerNumber ?? "",
      String(s.paidCount ?? 0),
      String(Number(s.billingAmount) || 0),
      s.cycle ?? "",
      String(s.status ?? ""),
      s.networkProvider ?? "",
      s.startDate ? formatDateTime(s.startDate as any) : "",
      s.endDate ? formatDateTime(s.endDate as any) : "",
    ])

    const csv = [header.join(","), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `recurring-history-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Recurring Payments History</h2>
            <p className="text-sm text-muted-foreground">
              {displayName ? `Subscriptions for ${displayName}` : "Partner recurring subscriptions"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CardDescription>All recurring mandates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptions}</div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CardDescription>Currently active mandates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Billing Amount</CardTitle>
            <CardDescription>Sum of billing amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBillingAmount)}</div>
          </CardContent>
        </Card>
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Authorized</CardTitle>
            <CardDescription>Most recent authorization time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {subscriptions[0]?.authorizationTimestamp
                ? formatDateTime(subscriptions[0].authorizationTimestamp as any)
                : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Subscriptions</CardTitle>
          <CardDescription>List of recurring payment subscriptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Input
                  placeholder="Search by customer, number or subscription ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-[300px]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING_AUTH">Pending Auth</SelectItem>
                  <SelectItem value="FIRST_PAYMENT_PENDING">First Payment Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_GRACE">In Grace</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="CREATED">Created</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800">
              <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                {formatCurrency(totalBillingAmount)}
              </span>
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
                <DropdownMenuItem onClick={handleExportPDF} disabled={filtered.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV} disabled={filtered.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md px-3 py-2 bg-red-50/80 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Customer Number</TableHead>
                  <TableHead>Paid Count</TableHead>
                  <TableHead>Billing Amount</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Authorized At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                      No recurring subscriptions found for this partner.
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((s) => {
                    const statusCfg = getStatusConfig(s.status)
                    const StatusIcon = statusCfg.icon
                    return (
                      <TableRow key={s.subscriptionId}>
                        <TableCell className="font-mono text-xs md:text-sm">{s.subscriptionId}</TableCell>
                        <TableCell className="text-sm font-medium">{s.customerName || "-"}</TableCell>
                        <TableCell className="text-sm">{s.customerNumber || "-"}</TableCell>
                        <TableCell className="text-sm text-center">{s.paidCount ?? 0}</TableCell>
                        <TableCell className="text-sm">{formatCurrency(Number(s.billingAmount))}</TableCell>
                        <TableCell className="text-sm">{formatCycle(s.cycle)}</TableCell>
                        <TableCell className="text-sm">{formatDateTime(s.startDate as any)}</TableCell>
                        <TableCell className="text-sm">{formatDateTime(s.endDate as any)}</TableCell>
                        <TableCell className="text-sm">
                          <Badge
                            variant={
                              statusCfg.variant === "success"
                                ? "default"
                                : statusCfg.variant === "warning"
                                ? "secondary"
                                : statusCfg.variant === "destructive"
                                ? "destructive"
                                : "outline"
                            }
                            className="flex items-center gap-1 w-fit"
                          >
                            <StatusIcon className="h-3 w-3" />
                            <span className="text-[11px] uppercase tracking-wide">{statusCfg.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm uppercase">{s.networkProvider || "-"}</TableCell>
                        <TableCell className="text-sm">{formatDateTime(s.authorizationTimestamp as any)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelected(s)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination footer */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3 pt-2 text-xs text-muted-foreground">
              <div>
                Showing {paged.length} of {filtered.length} subscriptions
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View details dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>
              Detailed information for subscription {selected?.subscriptionId}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <Label className="text-xs text-muted-foreground">Customer Name</Label>
                <p className="text-sm font-medium">{selected.customerName || "-"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Customer Number</Label>
                <p className="text-sm">{selected.customerNumber || "-"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Billing Amount</Label>
                <p className="text-sm">{formatCurrency(Number(selected.billingAmount))}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cycle</Label>
                <p className="text-sm">{formatCycle(selected.cycle)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <p className="text-sm">{formatDateTime(selected.startDate as any)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <p className="text-sm">{formatDateTime(selected.endDate as any)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <p className="text-sm flex items-center gap-2">
                  {(() => {
                    const cfg = getStatusConfig(selected.status)
                    const Icon = cfg.icon
                    return (
                      <>
                        <Icon className="h-3 w-3" />
                        <span className="uppercase text-[11px] tracking-wide">{cfg.label}</span>
                      </>
                    )
                  })()}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Network</Label>
                <p className="text-sm uppercase">{selected.networkProvider || "-"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Paid Count</Label>
                <p className="text-sm">{selected.paidCount ?? 0}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Mandate Reference</Label>
                <p className="text-sm break-all">{selected.mandateReference || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground">Authorization Timestamp</Label>
                <p className="text-sm">{formatDateTime(selected.authorizationTimestamp as any)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

