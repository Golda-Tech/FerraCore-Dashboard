"use client";

import { useState } from "react";
import {
  CalendarIcon,
  Download,
  Eye,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react";
import {
  IconBuildingBank,
  IconCash,
  IconClock,
  IconDeviceMobile,
  IconInfoCircle,
  IconShield,
  IconCheck,
  IconX,
  IconLoader,
  IconRefresh,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Mock data for collections
const mockCollections = [
  {
    id: "COL-001",
    customerName: "Acme Corporation",
    customerContact: "+233 24 123 4567",
    amount: 5000.0,
    currency: "GHS",
    method: "Mobile Money",
    provider: "MTN",
    status: "completed",
    reference: "REF-COL-001",
    description: "Invoice payment for services",
    createdAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T10:32:15Z",
    fees: 25.0,
  },
  {
    id: "COL-002",
    customerName: "Tech Solutions Ltd",
    customerContact: "0201234567",
    amount: 2500.0,
    currency: "GHS",
    method: "Bank Transfer",
    provider: "First Bank",
    status: "pending",
    reference: "REF-COL-002",
    description: "Monthly subscription payment",
    createdAt: "2024-01-15T14:20:00Z",
    completedAt: null,
    fees: 12.5,
  },
  {
    id: "COL-003",
    customerName: "Global Enterprises",
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
    failureReason: "Insufficient funds",
  },
  {
    id: "COL-004",
    customerName: "StartUp Inc",
    customerContact: "0244567890",
    amount: 750.0,
    currency: "GHS",
    method: "Mobile Money",
    provider: "AirtelTigo",
    status: "awaiting_approval",
    reference: "REF-COL-004",
    description: "Service fee collection",
    createdAt: "2024-01-15T18:10:00Z",
    completedAt: null,
    fees: 3.75,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200";
    case "awaiting_approval":
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <IconCheck className="h-3 w-3" />;
    case "pending":
      return <IconLoader className="h-3 w-3 animate-spin" />;
    case "failed":
      return <IconX className="h-3 w-3" />;
    case "awaiting_approval":
      return <IconClock className="h-3 w-3" />;
    default:
      return <IconClock className="h-3 w-3" />;
  }
};

export function CollectionsContent() {
  const [selectedMethod, setSelectedMethod] = useState("mobile_money");
  const [isCollecting, setIsCollecting] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Filter collections based on search and filters
  const filteredCollections = mockCollections.filter((collection) => {
    const matchesSearch =
      collection.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      collection.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || collection.status === statusFilter;
    const matchesMethod =
      methodFilter === "all" ||
      collection.method.toLowerCase().replace(" ", "_") === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  // Calculate statistics
  const totalCollections = filteredCollections.length;
  const completedCollections = filteredCollections.filter(
    (c) => c.status === "completed"
  ).length;
  const pendingCollections = filteredCollections.filter(
    (c) => c.status === "pending" || c.status === "awaiting_approval"
  ).length;
  const totalAmount = filteredCollections
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + c.amount, 0);

  const handleCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCollecting(true);

    // Simulate API call
    setTimeout(() => {
      setIsCollecting(false);
      // Show success message or handle response
    }, 3000);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setMethodFilter("all");
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            Collect payments from customers into your Rexpay account
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Collect payment from a customer into your Rexpay account
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCollectionSubmit} className="space-y-6">
              {/* Collection Method Selection */}
              <div className="space-y-3">
                <Label>Collection Method</Label>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label
                      htmlFor="mobile_money"
                      className="flex items-center gap-2"
                    >
                      <IconDeviceMobile className="h-4 w-4" />
                      Mobile Money
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label
                      htmlFor="bank_transfer"
                      className="flex items-center gap-2"
                    >
                      <IconBuildingBank className="h-4 w-4" />
                      Bank Transfer
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                  />
                </div>
              </div>

              {/* Collection Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (GHS)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input id="reference" placeholder="Optional reference" />
                </div>
              </div>

              {/* Method-specific fields */}
              {selectedMethod === "mobile_money" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        placeholder="+233 XX XXX XXXX"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider">Network Provider</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mtn">MTN</SelectItem>
                          <SelectItem value="vodafone">Vodafone</SelectItem>
                          <SelectItem value="airteltigo">AirtelTigo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <IconInfoCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">
                          Mobile Money Collection Process:
                        </p>
                        <ul className="mt-2 space-y-1 list-disc list-inside">
                          <li>Customer will receive a prompt on their phone</li>
                          <li>
                            They need to enter their PIN to approve the payment
                          </li>
                          <li>You'll receive a status update once completed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "bank_transfer" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        placeholder="Enter account number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="first_bank">First Bank</SelectItem>
                          <SelectItem value="gcb">GCB Bank</SelectItem>
                          <SelectItem value="ecobank">Ecobank</SelectItem>
                          <SelectItem value="absa">Absa Bank</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Payment description (optional)"
                />
              </div>

              {/* Fee Information */}
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Collection Fee:</span>
                  <span className="font-medium">0.5% (Min: GHS 1.00)</span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogTrigger>
                <Button type="submit" disabled={isCollecting}>
                  {isCollecting ? (
                    <>
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <IconCash className="mr-2 h-4 w-4" />
                      Initiate Collection
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
              GHS {totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed collections
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
              Collection success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Collection History</CardTitle>
          <CardDescription>
            View and manage your collection requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

              {(searchTerm ||
                statusFilter !== "all" ||
                methodFilter !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          <Separator className="my-4" />

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
                            {collection.customerContact}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          GHS {collection.amount.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Fee: GHS {collection.fees}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {collection.method === "Mobile Money" ? (
                            <IconDeviceMobile className="h-4 w-4" />
                          ) : (
                            <IconBuildingBank className="h-4 w-4" />
                          )}
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
                        <Badge className={getStatusColor(collection.status)}>
                          {getStatusIcon(collection.status)}
                          <span className="ml-1 capitalize">
                            {collection.status.replace("_", " ")}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {collection.reference}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(collection.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(collection.createdAt).toLocaleTimeString()}
                        </div>
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
        </CardContent>
      </Card>

      {/* Collection Details Dialog */}
      <Dialog
        open={!!selectedCollection}
        onOpenChange={() => setSelectedCollection(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Collection Details</DialogTitle>
            <DialogDescription>
              View detailed information about this collection request
            </DialogDescription>
          </DialogHeader>

          {selectedCollection && (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedCollection.customerName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCollection.reference}
                  </p>
                </div>
                <Badge className={getStatusColor(selectedCollection.status)}>
                  {getStatusIcon(selectedCollection.status)}
                  <span className="ml-1 capitalize">
                    {selectedCollection.status.replace("_", " ")}
                  </span>
                </Badge>
              </div>

              <Separator />

              {/* Collection Information */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Customer Information
                    </Label>
                    <div className="mt-1">
                      <p className="font-medium">
                        {selectedCollection.customerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedCollection.customerContact}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Collection Method
                    </Label>
                    <div className="mt-1 flex items-center gap-2">
                      {selectedCollection.method === "Mobile Money" ? (
                        <IconDeviceMobile className="h-4 w-4" />
                      ) : (
                        <IconBuildingBank className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {selectedCollection.method}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({selectedCollection.provider})
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Description
                    </Label>
                    <p className="mt-1">{selectedCollection.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Financial Information
                    </Label>
                    <div className="mt-1 space-y-2">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-medium">
                          GHS {selectedCollection.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collection Fee:</span>
                        <span className="font-medium">
                          GHS {selectedCollection.fees}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Net Amount:</span>
                        <span>
                          GHS{" "}
                          {(
                            selectedCollection.amount - selectedCollection.fees
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Timeline
                    </Label>
                    <div className="mt-1 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Created:</span>
                        <span>
                          {new Date(
                            selectedCollection.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>
                      {selectedCollection.completedAt && (
                        <div className="flex justify-between text-sm">
                          <span>Completed:</span>
                          <span>
                            {new Date(
                              selectedCollection.completedAt
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Failure Reason */}
              {selectedCollection.status === "failed" &&
                selectedCollection.failureReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <IconX className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">
                          Collection Failed
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {selectedCollection.failureReason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Awaiting Approval Info */}
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
                        needs to enter their PIN to complete the payment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedCollection(null)}
                >
                  Close
                </Button>
                {selectedCollection.status === "failed" && (
                  <Button>
                    <IconRefresh className="mr-2 h-4 w-4" />
                    Retry Collection
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Information Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconShield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• All collection requests are encrypted and secure</p>
            <p>• PCI DSS compliant payment processing</p>
            <p>• Real-time fraud monitoring and detection</p>
            <p>• Customer data protection and privacy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconInfoCircle className="h-5 w-5" />
              Collection Process
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Mobile Money: Customer receives prompt to approve</p>
            <p>• Bank Transfer: Direct debit from customer account</p>
            <p>• Real-time status updates and notifications</p>
            <p>• Automatic retry for failed transactions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
