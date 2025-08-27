"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Search, X, Download, Calendar, Plus } from "lucide-react";
import {
  IconBuildingBank,
  IconCash,
  IconClock,
  IconDeviceMobile,
  IconCheck,
  IconX as IconClose,
  IconLoader,
  IconRefresh,
  IconFileExport,
  IconUser,
  IconReceipt,
  IconCalendar,
  IconAlertTriangle,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for collections
const mockCollections = [
  {
    id: "COL-001",
    customerName: "Acme Corporation",
    customerEmail: "finance@acme.com",
    customerContact: "+233 24 123 4567",
    amount: 5000.0,
    currency: "GHS",
    method: "Mobile Money",
    provider: "MTN",
    status: "completed",
    reference: "REF-COL-001",
    description: "Invoice payment for services rendered in December 2023",
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T10:32:15Z",
    fees: 25.0,
    netAmount: 4975.0,
    processingTime: "2 minutes 15 seconds",
  },
  {
    id: "COL-002",
    customerName: "Tech Solutions Ltd",
    customerEmail: "accounts@techsolutions.com",
    customerContact: "0201234567",
    amount: 2500.0,
    currency: "GHS",
    method: "Bank Transfer",
    provider: "First Bank",
    status: "pending",
    reference: "REF-COL-002",
    description: "Monthly subscription payment for January 2024",
    createdAt: "2024-01-15T14:20:00Z",
    completedAt: null,
    fees: 12.5,
    netAmount: 2487.5,
    processingTime: "Processing...",
    bankName: "First National Bank",
    accountNumber: "ACC-123456789",
  },
  {
    id: "COL-003",
    customerName: "Global Enterprises",
    customerEmail: "billing@global.com",
    customerContact: "+233 20 987 6543",
    amount: 1200.0,
    currency: "GHS",
    method: "Mobile Money",
    provider: "Vodafone",
    status: "failed",
    reference: "REF-COL-003",
    description: "Product purchase payment",
    createdAt: "2024-01-15T16:45:00Z",
    completedAt: null,
    fees: 6.0,
    netAmount: 1194.0,
    failureReason: "Insufficient funds in customer account",
    processingTime: "Failed after 1 minute 30 seconds",
    errorCode: "INSUFFICIENT_FUNDS",
    errorMessage:
      "Customer does not have sufficient balance to complete this transaction",
  },
  {
    id: "COL-004",
    customerName: "StartUp Inc",
    customerEmail: "finance@startup.com",
    customerContact: "0244567890",
    amount: 750.0,
    currency: "GHS",
    method: "Mobile Money",
    provider: "AirtelTigo",
    status: "awaiting_approval",
    reference: "REF-COL-004",
    description: "Service fee collection for Q4 2023",
    createdAt: "2024-01-15T18:10:00Z",
    completedAt: null,
    fees: 3.75,
    netAmount: 746.25,
    processingTime: "Awaiting customer approval...",
  },
  {
    id: "COL-005",
    customerName: "Manufacturing Co",
    customerEmail: "payments@manufacturing.com",
    customerContact: "+233 26 555 0123",
    amount: 8500.0,
    currency: "GHS",
    method: "Bank Transfer",
    provider: "GCB Bank",
    status: "completed",
    reference: "REF-COL-005",
    description: "Equipment purchase payment",
    createdAt: "2024-01-14T09:15:00Z",
    completedAt: "2024-01-16T11:30:00Z",
    fees: 42.5,
    netAmount: 8457.5,
    processingTime: "2 days 2 hours 15 minutes",
    bankName: "GCB Bank",
    accountNumber: "ACC-987654321",
  },
  {
    id: "COL-006",
    customerName: "Retail Store Ltd",
    customerEmail: "admin@retailstore.com",
    customerContact: "0277890123",
    amount: 3200.0,
    currency: "GHS",
    method: "Mobile Money",
    provider: "MTN",
    status: "expired",
    reference: "REF-COL-006",
    description: "Inventory payment - expired after 24 hours",
    createdAt: "2024-01-13T15:45:00Z",
    completedAt: null,
    fees: 16.0,
    netAmount: 3184.0,
    processingTime: "Expired after 24 hours",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
      return "destructive";
    case "awaiting_approval":
      return "secondary";
    case "expired":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <IconCheck className="h-3 w-3" />;
    case "pending":
      return <IconLoader className="h-3 w-3 animate-spin" />;
    case "failed":
      return <IconClose className="h-3 w-3" />;
    case "awaiting_approval":
      return <IconClock className="h-3 w-3" />;
    case "expired":
      return <IconClose className="h-3 w-3" />;
    default:
      return <IconClock className="h-3 w-3" />;
  }
};

const getMethodIcon = (method: string) => {
  switch (method) {
    case "Mobile Money":
      return <IconDeviceMobile className="h-4 w-4" />;
    case "Bank Transfer":
      return <IconBuildingBank className="h-4 w-4" />;
    default:
      return <IconCash className="h-4 w-4" />;
  }
};

export function CollectionsContent() {
  const router = useRouter();
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  // Filter collections based on search and filters
  const filteredCollections = mockCollections.filter((collection) => {
    const matchesSearch =
      collection.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      collection.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || collection.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" ||
      collection.method.toLowerCase().replace(" ", "_") === methodFilter;

    const collectionDate = new Date(collection.createdAt);
    const matchesDateFrom = !dateFrom || collectionDate >= dateFrom;
    const matchesDateTo = !dateTo || collectionDate <= dateTo;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMethod &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  // Calculate statistics
  const totalCollections = filteredCollections.length;
  const completedCollections = filteredCollections.filter(
    (c) => c.status === "completed"
  ).length;
  const pendingCollections = filteredCollections.filter(
    (c) => c.status === "pending" || c.status === "awaiting_approval"
  ).length;
  const failedCollections = filteredCollections.filter(
    (c) => c.status === "failed"
  ).length;
  const totalAmount = filteredCollections
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.amount, 0);
  const totalNetAmount = filteredCollections
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.netAmount, 0);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);

    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // In real implementation, trigger download
      console.log(
        `Exporting ${filteredCollections.length} collections as ${format}`
      );
    }, 2000);
  };

  const formatCurrency = (amount: number, currency = "GHS") => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            View and manage all your collection requests
          </p>
        </div>
        <Button onClick={() => router.push("/new-collection")}>
          <Plus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Collections
            </CardTitle>
            <IconCash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCollections}</div>
            <p className="text-xs text-muted-foreground">
              {completedCollections} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Amount Collected
            </CardTitle>
            <IconBuildingBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Net: {formatCurrency(totalNetAmount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCollections}</div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <IconCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCollections > 0
                ? Math.round((completedCollections / totalCollections) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {failedCollections} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Collections Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Collection History</CardTitle>
              <CardDescription>
                View and manage your collection requests
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <IconFileExport className="mr-2 h-4 w-4" />
                      Export
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateFrom && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateTo && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {(searchTerm ||
                statusFilter !== "all" ||
                methodFilter !== "all" ||
                dateFrom ||
                dateTo) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <Separator className="mb-4" />

          {/* Collections Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCollections.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No collections found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollections.map((collection) => (
                    <TableRow
                      key={collection.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCollection(collection)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {collection.customerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {collection.customerEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(
                            collection.amount,
                            collection.currency
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Net:{" "}
                          {formatCurrency(
                            collection.netAmount,
                            collection.currency
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(collection.method)}
                          <div>
                            <div className="font-medium">
                              {collection.method}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {collection.provider}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusColor(collection.status)}
                          className="flex items-center space-x-1 w-fit"
                        >
                          {getStatusIcon(collection.status)}
                          <span className="capitalize">
                            {collection.status.replace("_", " ")}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {collection.reference}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(collection.createdAt)}
                        </div>
                        {collection.completedAt && (
                          <div className="text-xs text-muted-foreground">
                            Completed: {formatDate(collection.completedAt)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results Summary */}
          {filteredCollections.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
              <div>
                Showing {filteredCollections.length} of {mockCollections.length}{" "}
                collections
              </div>
              <div>
                Total: {formatCurrency(totalAmount)} • Net:{" "}
                {formatCurrency(totalNetAmount)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Details Dialog - Matching Transaction Screen Format */}
      <Dialog
        open={!!selectedCollection}
        onOpenChange={() => setSelectedCollection(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collection Details</DialogTitle>
            <DialogDescription>
              Complete information about this collection request
            </DialogDescription>
          </DialogHeader>

          {selectedCollection && (
            <div className="space-y-6">
              {/* Collection Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Collection ID
                  </Label>
                  <p className="font-mono">{selectedCollection.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Reference
                  </Label>
                  <p className="font-mono">{selectedCollection.reference}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={getStatusColor(selectedCollection.status)}
                    className="flex items-center space-x-1 w-fit"
                  >
                    {getStatusIcon(selectedCollection.status)}
                    <span className="capitalize">
                      {selectedCollection.status.replace("_", " ")}
                    </span>
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Method
                  </Label>
                  <div className="flex items-center space-x-2">
                    {getMethodIcon(selectedCollection.method)}
                    <span>{selectedCollection.method}</span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <IconUser className="h-4 w-4 mr-2" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Name
                    </Label>
                    <p>{selectedCollection.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email
                    </Label>
                    <p>{selectedCollection.customerEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {selectedCollection.method === "Mobile Money"
                        ? "Phone Number"
                        : "Account Number"}
                    </Label>
                    <p className="font-mono">
                      {selectedCollection.method === "Mobile Money"
                        ? selectedCollection.customerContact
                        : selectedCollection.accountNumber ||
                          selectedCollection.customerContact}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {selectedCollection.method === "Mobile Money"
                        ? "Network Provider"
                        : "Bank"}
                    </Label>
                    <p>{selectedCollection.provider}</p>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <IconReceipt className="h-4 w-4 mr-2" />
                  Financial Breakdown
                </h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Collection Amount
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedCollection.amount,
                        selectedCollection.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Collection Fee
                    </span>
                    <span>
                      {formatCurrency(
                        selectedCollection.fees,
                        selectedCollection.currency
                      )}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Net Amount (You Receive)</span>
                    <span>
                      {formatCurrency(
                        selectedCollection.netAmount,
                        selectedCollection.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Processing Details */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <IconCalendar className="h-4 w-4 mr-2" />
                  Processing Details
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Created Date & Time
                    </Label>
                    <p>{formatDate(selectedCollection.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Processing Time
                    </Label>
                    <p>{selectedCollection.processingTime}</p>
                  </div>
                  {selectedCollection.completedAt && (
                    <>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Completed Date & Time
                        </Label>
                        <p>{formatDate(selectedCollection.completedAt)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Total Duration
                        </Label>
                        <p>{selectedCollection.processingTime}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="bg-muted/50 p-3 rounded-lg">
                  {selectedCollection.description}
                </p>
              </div>

              {/* Error Details (if failed) */}
              {selectedCollection.status === "failed" && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center text-destructive">
                    <IconAlertTriangle className="h-4 w-4 mr-2" />
                    Error Details
                  </h4>
                  <div className="bg-destructive/10 p-3 rounded-lg space-y-2">
                    {selectedCollection.errorCode && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Error Code
                        </Label>
                        <p className="font-mono text-destructive">
                          {selectedCollection.errorCode}
                        </p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Error Message
                      </Label>
                      <p className="text-destructive">
                        {selectedCollection.errorMessage ||
                          selectedCollection.failureReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status-specific Information */}
              {selectedCollection.status === "awaiting_approval" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <IconClock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">
                        Awaiting Customer Approval
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        The customer has received a prompt on their device and
                        needs to enter their PIN to complete the payment. This
                        request will expire in 24 hours if not approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedCollection.status === "expired" && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <IconClose className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">
                        Collection Request Expired
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        This collection request has expired after 24 hours
                        without customer approval. You can create a new
                        collection request for this customer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  Download Receipt
                </Button>
                {(selectedCollection.status === "failed" ||
                  selectedCollection.status === "expired") && (
                  <Button
                    className="flex-1"
                    onClick={() => router.push("/new-collection")}
                  >
                    Create New Collection
                  </Button>
                )}
                {selectedCollection.status === "awaiting_approval" && (
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Resend Request
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
