"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getPayment, getPayments, getTransactionStatus } from "@/lib/payment"

// Mock data for payment requests
const payments = [
  {
    id: "PAY-001",
    customerName: "John Doe",
    customerPhone: "+233 24 123 4567",
    amount: 25000,
    status: "completed",
    method: "Mobile Money",
    network: "MTN",
    reference: "INV-2024-001",
    description: "Payment for web development services",
    createdAt: "2024-01-15T10:30:00Z",
    paidAt: "2024-01-15T10:35:00Z",
    dueDate: "2024-01-20T23:59:59Z",
  },
  {
    id: "PAY-002",
    customerName: "Jane Smith",
    customerPhone: "+233 20 234 5678",
    amount: 15000,
    status: "pending",
    method: "Mobile Money",
    network: "Vodafone",
    reference: "INV-2024-002",
    description: "Monthly subscription fee",
    createdAt: "2024-01-14T14:20:00Z",
    paidAt: null,
    dueDate: "2024-01-18T23:59:59Z",
  },
  {
    id: "PAY-003",
    customerName: "Mike Johnson",
    customerPhone: "+233 27 345 6789",
    amount: 50000,
    status: "failed",
    method: "Mobile Money",
    network: "AirtelTigo",
    reference: "INV-2024-003",
    description: "Product purchase",
    createdAt: "2024-01-13T09:15:00Z",
    paidAt: null,
    dueDate: "2024-01-17T23:59:59Z",
  },
  {
    id: "PAY-004",
    customerName: "Sarah Wilson",
    customerPhone: "+233 26 456 7890",
    amount: 8500,
    status: "expired",
    method: "Mobile Money",
    network: "Telecel",
    reference: "INV-2024-004",
    description: "Consultation fee",
    createdAt: "2024-01-10T16:45:00Z",
    paidAt: null,
    dueDate: "2024-01-12T23:59:59Z",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "SUCCESSFUL":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "EXPIRED":
      return <AlertCircle className="h-4 w-4 text-gray-500" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "SUCCESSFUL":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Successful</Badge>
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    case "FAILED":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
    case "EXPIRED":
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Expired</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function PaymentsContent() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)


  const router = useRouter()

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const data = await getPayments()
      setPayments(data)
    } catch (err) {
      console.error("Failed to fetch payments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])


  const handleViewDetails = async (transactionRef: string) => {
    setLoading(true)
    try {
      const data = await getPayment(transactionRef)
      setSelectedPayment(data)
    } catch (err) {
      console.error("Failed to fetch payment details:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshStatus = async () => {
    if (!selectedPayment) return
    setLoading(true)
    try {
      const statusData = await getTransactionStatus(
        selectedPayment.provider,
        selectedPayment.transactionRef
      )
      setSelectedPayment((prev: any) => ({ ...prev, ...statusData }))
    } catch (err) {
      console.error("Failed to refresh payment status:", err)
    } finally {
      setLoading(false)
    }
  }




  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      // payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.mobileNumber.includes(searchTerm) ||
      payment.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const completedStatuses = ["SUCCESSFUL"]
  const pendingStatuses = ["PENDING"]

  const totalRequests = payments.length
  const completedRequests = payments.filter(p => completedStatuses.includes(p.status)).length
  const pendingRequests = payments.filter(p => pendingStatuses.includes(p.status)).length
  const totalAmount = payments
    .filter(p => completedStatuses.includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0)
  const successRate = totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Payment Requests</h2>
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
                </Button>
                <Button size="sm" onClick={() => router.push("/request-payment")}>
                <Plus className="h-4 w-4 mr-2" />
                Request Payment
                </Button>
            </div>
        </div>


      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
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
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last month
              </span>
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
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting payment
              </span>
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
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.5% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>Manage and track all your payment requests</CardDescription>
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
                  <TableHead>Reference</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        {/* <div className="font-medium">{payment.customerName}</div> */}
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
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        {payment.provider}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{payment.transactionRef}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Request Details</DialogTitle>
            <DialogDescription>Complete information about this payment request</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Request ID</Label>
                  <p className="font-mono">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(selectedPayment.status)}
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p>{selectedPayment.first}</p>
                  </div> */}
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
                  {/* <div>
                    <Label className="text-sm font-medium text-muted-foreground">Method</Label>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <p>{selectedPayment.method}</p>
                    </div>
                  </div> */}
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reference</Label>
                    <p className="font-mono">{selectedPayment.transactionRef}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p>{selectedPayment.mtnPayeeNote}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Timeline</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p>{formatDate(selectedPayment.initiatedAt)}</p>
                  </div>
                  {/* <div>
                    <Label className="text-sm font-medium text-muted-foreground">Completed At</Label>
                    <p>{formatDate(selectedPayment.completedAt)}</p>
                  </div> */}
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
  )
}
