"use client";

import { useState, useEffect } from "react";
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
  IconExclamationCircle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCollections, getCollection } from "@/lib/collections";
import type { Collection } from "@/types/collections";
import { Skeleton } from "./ui/skeleton";

// Status mapping for API data
const mapApiStatus = (status: string) => {
  switch (status.toUpperCase()) {
    case "SUCCESS":
      return "completed";
    case "ONGOING":
      return "pending";
    case "FAILED":
      return "failed";
    default:
      return "pending";
  }
};

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

export function CollectionsContent() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [selectedCollectionDetails, setSelectedCollectionDetails] =
    useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch collections data
  const fetchCollections = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const startDateStr = dateFrom
        ? format(dateFrom, "yyyy-MM-dd")
        : undefined;
      const endDateStr = dateTo ? format(dateTo, "yyyy-MM-dd") : undefined;

      const data = await getCollections(startDateStr, endDateStr, 0, 100);
      setCollections(data);
    } catch (err: any) {
      console.error("Error fetching collections:", err);
      setError(err?.message || "Failed to fetch collections");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch collection details
  const fetchCollectionDetails = async (collectionRef: string) => {
    try {
      setDetailsLoading(true);
      const details = await getCollection(collectionRef);
      setSelectedCollectionDetails(details);
    } catch (err: any) {
      console.error("Error fetching collection details:", err);
      setError(err?.message || "Failed to fetch collection details");
    } finally {
      setDetailsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCollections();
  }, [dateFrom, dateTo]);

  // Handle collection row click
  const handleCollectionClick = async (collection: Collection) => {
    setSelectedCollection(collection);
    setSelectedCollectionDetails(null);
    await fetchCollectionDetails(collection.collectionRef);
  };

  // Filter collections based on search and filters
  const filteredCollections = collections.filter((collection) => {
    const mappedStatus = mapApiStatus(collection.status);

    const matchesSearch =
      collection.collectionRef
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      collection.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.externalRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || mappedStatus === statusFilter;

    const collectionDate = new Date(collection.initiatedAt);
    const matchesDateFrom = !dateFrom || collectionDate >= dateFrom;
    const matchesDateTo = !dateTo || collectionDate <= dateTo;

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Calculate statistics
  const totalCollections = filteredCollections.length;
  const completedCollections = filteredCollections.filter(
    (c) => mapApiStatus(c.status) === "completed"
  ).length;
  const pendingCollections = filteredCollections.filter(
    (c) => mapApiStatus(c.status) === "pending"
  ).length;
  const failedCollections = filteredCollections.filter(
    (c) => mapApiStatus(c.status) === "failed"
  ).length;
  const totalAmount = filteredCollections
    .filter((c) => mapApiStatus(c.status) === "completed")
    .reduce((sum, c) => sum + c.amount, 0);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
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

  const formatCustomerId = (customerId: string) => {
    // Format phone number for display
    if (customerId.startsWith("233") && customerId.length === 12) {
      return `+${customerId.slice(0, 3)} ${customerId.slice(
        3,
        5
      )} ${customerId.slice(5, 8)} ${customerId.slice(8)}`;
    }
    return customerId;
  };

  // if (loading && !isRefreshing) {
  //   return (
  //     <div className="flex flex-1 flex-col gap-4 p-4">
  //       <div className="flex items-center justify-between">
  //         <div>
  //           <h1 className="text-2xl font-semibold tracking-tight">
  //             Collections
  //           </h1>
  //           <p className="text-muted-foreground">Loading collections...</p>
  //         </div>
  //       </div>
  //       <div className="flex flex-1 items-center justify-center">
  //         <Card className="w-full max-w-sm">
  //           <CardContent className="pt-6">
  //             <div className="text-center space-y-4">
  //               <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
  //                 <IconLoader className="h-8 w-8 text-blue-600 animate-spin" />
  //               </div>
  //               <div>
  //                 <h3 className="text-lg font-semibold">Loading Collections</h3>
  //                 <p className="text-sm text-muted-foreground mt-2">
  //                   Fetching your collection data...
  //                 </p>
  //               </div>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     </div>
  //   );
  // }

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCollections(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <IconRefresh className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>
          <Button onClick={() => router.push("/new-collection")}>
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <IconExclamationCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => fetchCollections()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
              From successful collections
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
                  <SelectItem value="failed">Failed</SelectItem>
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

              {(searchTerm || statusFilter !== "all" || dateFrom || dateTo) && (
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
                {loading || isRefreshing ? (
                  // Show shimmer rows during initial loading
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[120px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredCollections.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {error
                        ? "Failed to load collections"
                        : "No collections found matching your criteria"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCollections.map((collection) => (
                    <TableRow
                      key={collection.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleCollectionClick(collection)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCustomerId(collection.customerId)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Customer ID
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
                          {collection.currency}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconDeviceMobile className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Mobile Money</div>
                            <div className="text-sm text-muted-foreground">
                              MTN
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusColor(
                            mapApiStatus(collection.status)
                          )}
                          className="flex items-center space-x-1 w-fit"
                        >
                          {getStatusIcon(mapApiStatus(collection.status))}
                          <span className="capitalize">
                            {mapApiStatus(collection.status)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {collection.collectionRef}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(collection.initiatedAt)}
                        </div>
                        {collection.updatedAt && (
                          <div className="text-xs text-muted-foreground">
                            Updated: {formatDate(collection.updatedAt)}
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
                Showing {filteredCollections.length} of {collections.length}{" "}
                collections
              </div>
              <div>Total: {formatCurrency(totalAmount)}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Details Dialog */}
      <Dialog
        open={!!selectedCollection}
        onOpenChange={() => {
          setSelectedCollection(null);
          setSelectedCollectionDetails(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Collection Details</DialogTitle>
            <DialogDescription>
              Complete information about this collection request
            </DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <IconLoader className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Loading collection details...
                </p>
              </div>
            </div>
          ) : selectedCollectionDetails ? (
            <div className="space-y-6">
              {/* Collection Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Collection ID
                  </Label>
                  <p className="font-mono">{selectedCollectionDetails.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Reference
                  </Label>
                  <p className="font-mono">
                    {selectedCollectionDetails.collectionRef}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    External Reference
                  </Label>
                  <p className="font-mono text-xs">
                    {selectedCollectionDetails.externalRef}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={getStatusColor(
                      mapApiStatus(selectedCollectionDetails.status)
                    )}
                    className="flex items-center space-x-1 w-fit"
                  >
                    {getStatusIcon(
                      mapApiStatus(selectedCollectionDetails.status)
                    )}
                    <span className="capitalize">
                      {mapApiStatus(selectedCollectionDetails.status)}
                    </span>
                  </Badge>
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
                      Customer ID
                    </Label>
                    <p>
                      {formatCustomerId(selectedCollectionDetails.customerId)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Payment Method
                    </Label>
                    <p>Mobile Money</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <IconReceipt className="h-4 w-4 mr-2" />
                  Financial Information
                </h4>
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Collection Amount
                    </span>
                    <span className="font-medium">
                      {formatCurrency(
                        selectedCollectionDetails.amount,
                        selectedCollectionDetails.currency
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Currency
                    </span>
                    <span>{selectedCollectionDetails.currency}</span>
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
                      Initiated Date & Time
                    </Label>
                    <p>{formatDate(selectedCollectionDetails.initiatedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Last Updated
                    </Label>
                    <p>{formatDate(selectedCollectionDetails.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Status Message */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Status Message
                </Label>
                <p className="bg-muted/50 p-3 rounded-lg">
                  {selectedCollectionDetails.message}
                </p>
              </div>

              {/* Status-specific Information */}
              {mapApiStatus(selectedCollectionDetails.status) === "pending" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <IconClock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">
                        Processing in Progress
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        The payment request is currently being processed. This
                        may take a few minutes to complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {mapApiStatus(selectedCollectionDetails.status) === "failed" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <IconAlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">
                        Collection Failed
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        The collection request could not be processed. You can
                        create a new collection request for this customer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {mapApiStatus(selectedCollectionDetails.status) ===
                "completed" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <IconCheck className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">
                        Collection Completed Successfully
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        The payment has been successfully collected from the
                        customer and processed.
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
                {mapApiStatus(selectedCollectionDetails.status) ===
                  "failed" && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setSelectedCollection(null);
                      setSelectedCollectionDetails(null);
                      router.push("/new-collection");
                    }}
                  >
                    Create New Collection
                  </Button>
                )}
                {mapApiStatus(selectedCollectionDetails.status) ===
                  "pending" && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() =>
                      fetchCollectionDetails(
                        selectedCollectionDetails.collectionRef
                      )
                    }
                  >
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Refresh Status
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Failed to load collection details
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() =>
                  selectedCollection &&
                  fetchCollectionDetails(selectedCollection.collectionRef)
                }
              >
                Retry
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
