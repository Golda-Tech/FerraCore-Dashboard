"use client";
import { useState } from "react";
import {
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconClock,
  IconDownload,
  IconEye,
  IconLoader,
  IconSearch,
  IconX,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Enhanced transaction data with all required fields
const allTransactions = [
  {
    id: 1,
    reference: "TXN-2024-001",
    batchId: "BATCH-001",
    recipient: "0244123456",
    recipientName: "John Doe",
    recipientType: "Mobile Money",
    network: "MTN Ghana",
    amount: 500,
    fees: 2.5,
    totalAmount: 502.5,
    status: "Completed",
    initiatedBy: "First Bank",
    approvedBy: "Sarah Admin",
    dateInitiated: "2024-01-16T10:30:00Z",
    dateCompleted: "2024-01-16T10:35:00Z",
    description: "Farmer payment for harvest",
    transactionId: "MTN240116103500001",
    // New fields for enhanced details
    paymentAmount: 500,
    charge: 2.5,
    paidBy: "First Bank Limited",
    requestType: "Bulk Payment",
    balanceBefore: 10000.0,
    balanceAfter: 9497.5,
    externalTransactionId: "EXT-MTN-240116-001",
    narration: "Monthly farmer payment for maize harvest delivery",
  },
  {
    id: 2,
    reference: "TXN-2024-002",
    batchId: "BATCH-002",
    recipient: "1234567890123456",
    recipientName: "Jane Smith",
    recipientType: "Bank Account",
    network: "GCB Bank",
    amount: 750,
    fees: 3.75,
    totalAmount: 753.75,
    status: "Processing",
    initiatedBy: "First Bank",
    approvedBy: "Mike Admin",
    dateInitiated: "2024-01-16T14:20:00Z",
    dateCompleted: null,
    description: "Salary payment",
    transactionId: "GCB240116142000002",
    // New fields
    paymentAmount: 750,
    charge: 3.75,
    paidBy: "First Bank Limited",
    requestType: "Salary Transfer",
    balanceBefore: 9497.5,
    balanceAfter: 8743.75,
    externalTransactionId: "EXT-GCB-240116-002",
    narration: "Monthly salary payment for employee Jane Smith",
  },
  {
    id: 3,
    reference: "TXN-2024-003",
    batchId: "BATCH-003",
    recipient: "0201234567",
    recipientName: "Bob Johnson",
    recipientType: "Mobile Money",
    network: "Vodafone",
    amount: 250,
    fees: 1.25,
    totalAmount: 251.25,
    status: "Failed",
    initiatedBy: "First Bank",
    approvedBy: "Sarah Admin",
    dateInitiated: "2024-01-16T09:15:00Z",
    dateCompleted: null,
    description: "Equipment purchase",
    transactionId: null,
    failureReason: "Insufficient balance in recipient account",
    // New fields
    paymentAmount: 250,
    charge: 1.25,
    paidBy: "First Bank Limited",
    requestType: "Vendor Payment",
    balanceBefore: 8743.75,
    balanceAfter: 8743.75, // No change due to failure
    externalTransactionId: null,
    narration: "Payment for farming equipment purchase - FAILED",
  },
  {
    id: 4,
    reference: "TXN-2024-004",
    batchId: "BATCH-004",
    recipient: "0267890123",
    recipientName: "Alice Brown",
    recipientType: "Mobile Money",
    network: "AirtelTigo",
    amount: 1000,
    fees: 5.0,
    totalAmount: 1005.0,
    status: "Pending Approval",
    initiatedBy: "First Bank",
    approvedBy: null,
    dateInitiated: "2024-01-16T16:45:00Z",
    dateCompleted: null,
    description: "Contractor payment",
    transactionId: null,
    // New fields
    paymentAmount: 1000,
    charge: 5.0,
    paidBy: "First Bank Limited",
    requestType: "Contractor Payment",
    balanceBefore: 8743.75,
    balanceAfter: null, // Pending
    externalTransactionId: null,
    narration: "Payment to contractor Alice Brown for construction work",
  },
  {
    id: 5,
    reference: "TXN-2024-005",
    batchId: "BATCH-005",
    recipient: "9876543210987654",
    recipientName: "David Wilson",
    recipientType: "Bank Account",
    network: "Ecobank Ghana",
    amount: 300,
    fees: 1.5,
    totalAmount: 301.5,
    status: "Completed",
    initiatedBy: "First Bank",
    approvedBy: "Mike Admin",
    dateInitiated: "2024-01-15T11:30:00Z",
    dateCompleted: "2024-01-15T11:45:00Z",
    description: "Vendor payment",
    transactionId: "ECO240115114500005",
    // New fields
    paymentAmount: 300,
    charge: 1.5,
    paidBy: "First Bank Limited",
    requestType: "Vendor Payment",
    balanceBefore: 10301.5,
    balanceAfter: 10000.0,
    externalTransactionId: "EXT-ECO-240115-005",
    narration: "Payment to vendor David Wilson for supplies",
  },
  {
    id: 6,
    reference: "TXN-2024-006",
    batchId: "BATCH-006",
    recipient: "0244567890",
    recipientName: "Emma Davis",
    recipientType: "Mobile Money",
    network: "MTN Ghana",
    amount: 600,
    fees: 3.0,
    totalAmount: 603.0,
    status: "Rejected",
    initiatedBy: "First Bank",
    approvedBy: null,
    dateInitiated: "2024-01-15T08:20:00Z",
    dateCompleted: null,
    description: "Refund payment",
    transactionId: null,
    rejectionReason: "Invalid recipient details",
    // New fields
    paymentAmount: 600,
    charge: 3.0,
    paidBy: "First Bank Limited",
    requestType: "Refund",
    balanceBefore: 10904.5,
    balanceAfter: 10904.5, // No change due to rejection
    externalTransactionId: null,
    narration: "Refund payment to customer Emma Davis - REJECTED",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <IconCircleCheckFilled className="h-4 w-4 text-green-500" />;
    case "Processing":
      return <IconLoader className="h-4 w-4 text-blue-500 animate-spin" />;
    case "Failed":
      return <IconCircleXFilled className="h-4 w-4 text-red-500" />;
    case "Pending Approval":
      return <IconClock className="h-4 w-4 text-yellow-500" />;
    case "Rejected":
      return <IconX className="h-4 w-4 text-red-500" />;
    default:
      return <IconClock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
    case "Processing":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800";
    case "Failed":
    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
    case "Pending Approval":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
  }
};

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<
    (typeof allTransactions)[0] | null
  >(null);

  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.recipientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.recipient.includes(searchTerm) ||
      transaction.network.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;
    const matchesType =
      typeFilter === "all" || transaction.recipientType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const completedTransactions = filteredTransactions.filter(
    (t) => t.status === "Completed"
  );
  const processingTransactions = filteredTransactions.filter(
    (t) => t.status === "Processing"
  );
  const failedTransactions = filteredTransactions.filter(
    (t) => t.status === "Failed" || t.status === "Rejected"
  );
  const pendingTransactions = filteredTransactions.filter(
    (t) => t.status === "Pending Approval"
  );

  const exportTransactions = () => {
    const csvContent = [
      "Reference,Recipient,Type,Network,Amount,Status,Date,Description",
      ...filteredTransactions.map((t) =>
        [
          t.reference,
          t.recipientName,
          t.recipientType,
          t.network,
          `₵${t.amount}`,
          t.status,
          new Date(t.dateInitiated).toLocaleDateString(),
          t.description,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Transactions</h1>
        <Button
          variant="outline"
          onClick={exportTransactions}
          className="flex items-center gap-2 bg-transparent"
        >
          <IconDownload className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTransactions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Completed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {processingTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Failed/Rejected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {failedTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
          <CardDescription>
            Search and filter your transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by reference, name, or recipient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Pending Approval">
                    Pending Approval
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Bank Account">Bank Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Transactions
            <Badge variant="secondary" className="ml-2">
              {filteredTransactions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="secondary" className="ml-2">
              {completedTransactions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing
            <Badge variant="secondary" className="ml-2">
              {processingTransactions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed
            <Badge variant="secondary" className="ml-2">
              {failedTransactions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TransactionTable
            transactions={filteredTransactions}
            onViewDetails={setSelectedTransaction}
          />
        </TabsContent>
        <TabsContent value="completed">
          <TransactionTable
            transactions={completedTransactions}
            onViewDetails={setSelectedTransaction}
          />
        </TabsContent>
        <TabsContent value="processing">
          <TransactionTable
            transactions={processingTransactions}
            onViewDetails={setSelectedTransaction}
          />
        </TabsContent>
        <TabsContent value="failed">
          <TransactionTable
            transactions={failedTransactions}
            onViewDetails={setSelectedTransaction}
          />
        </TabsContent>
      </Tabs>

      {/* Transaction Details Dialog */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Reference: {selectedTransaction?.reference}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionDetails transaction={selectedTransaction} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransactionTable({
  transactions,
  onViewDetails,
}: {
  transactions: (typeof allTransactions)[0][];
  onViewDetails: (transaction: (typeof allTransactions)[0]) => void;
}) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Network/Bank</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onViewDetails(transaction)}
                  >
                    <TableCell className="font-mono">
                      {transaction.reference}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.recipientName}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {transaction.recipient}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.recipientType}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.network}</TableCell>
                    <TableCell className="font-medium">
                      ₵{transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`px-2 py-1 ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}
                        <span className="ml-1">{transaction.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.dateInitiated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(transaction);
                        }}
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No transactions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionDetails({
  transaction,
}: {
  transaction: (typeof allTransactions)[0];
}) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{transaction.recipientName}</h3>
          <p className="text-sm text-muted-foreground">
            {transaction.description}
          </p>
        </div>
        <Badge
          variant="outline"
          className={`px-3 py-1 ${getStatusColor(transaction.status)}`}
        >
          {getStatusIcon(transaction.status)}
          <span className="ml-2">{transaction.status}</span>
        </Badge>
      </div>

      <Separator />

      {/* Enhanced Transaction Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Details */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Payment Detail
          </h4>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Payment Amount
              </Label>
              <p className="text-lg font-semibold text-primary mt-1">
                ₵{transaction.paymentAmount?.toFixed(2) || "N/A"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Charge
              </Label>
              <p className="text-sm mt-1">
                ₵{transaction.charge?.toFixed(2) || "N/A"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Total Amount
              </Label>
              <p className="text-lg font-bold mt-1">
                ₵{transaction.totalAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Paid By
              </Label>
              <p className="text-sm mt-1">{transaction.paidBy || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Transaction IDs and References */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Transaction References
          </h4>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Reference Number
              </Label>
              <p className="font-mono text-sm mt-1">{transaction.reference}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Transaction ID
              </Label>
              <p className="font-mono text-sm mt-1">
                {transaction.transactionId || "Pending"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                External Transaction ID
              </Label>
              <p className="font-mono text-sm mt-1">
                {transaction.externalTransactionId || "N/A"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Batch ID
              </Label>
              <p className="font-mono text-sm mt-1">{transaction.batchId}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Request Type
              </Label>
              <Badge variant="outline" className="mt-1">
                {transaction.requestType || "N/A"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Network and Balance Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Network & Balance
          </h4>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Network
              </Label>
              <p className="text-sm mt-1">{transaction.network}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Balance Before
              </Label>
              <p className="text-sm font-medium text-gray-600 mt-1">
                ₵{transaction.balanceBefore?.toFixed(2) || "N/A"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Balance After
              </Label>
              <p className="text-sm font-medium text-gray-600 mt-1">
                {transaction.balanceAfter !== null
                  ? `₵${transaction.balanceAfter.toFixed(2)}`
                  : "Pending"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Date
              </Label>
              <p className="text-sm mt-1">
                {new Date(transaction.dateInitiated).toLocaleString()}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Status
              </Label>
              <Badge
                variant="outline"
                className={`mt-1 ${getStatusColor(transaction.status)}`}
              >
                {getStatusIcon(transaction.status)}
                <span className="ml-1">{transaction.status}</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Narration Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Narration
        </h4>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {transaction.narration ||
                transaction.description ||
                "No additional notes available"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Recipient Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Recipient Information
          </h4>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Recipient Name
              </Label>
              <p className="text-sm mt-1">{transaction.recipientName}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Recipient Account
              </Label>
              <p className="font-mono text-sm mt-1">{transaction.recipient}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Payment Method
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{transaction.recipientType}</Badge>
                <span className="text-sm text-muted-foreground">
                  via {transaction.network}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Processing Details
          </h4>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Initiated By
              </Label>
              <p className="text-sm mt-1">{transaction.initiatedBy}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Approved By
              </Label>
              <p className="text-sm mt-1">
                {transaction.approvedBy || "Pending approval"}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Date Initiated
              </Label>
              <p className="text-sm mt-1">
                {new Date(transaction.dateInitiated).toLocaleString()}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Date Completed
              </Label>
              <p className="text-sm mt-1">
                {transaction.dateCompleted
                  ? new Date(transaction.dateCompleted).toLocaleString()
                  : "Not completed"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Information */}
      {(transaction.failureReason || transaction.rejectionReason) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Issue Details
            </h4>

            {transaction.failureReason && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <Label className="text-sm font-medium text-red-700 dark:text-red-300">
                  Failure Reason
                </Label>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {transaction.failureReason}
                </p>
              </div>
            )}

            {transaction.rejectionReason && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <Label className="text-sm font-medium text-red-700 dark:text-red-300">
                  Rejection Reason
                </Label>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {transaction.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Summary Section */}
      <Separator />
      <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Transaction Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <span className="ml-2 font-medium">
              ₵{transaction.paymentAmount?.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Charges:</span>
            <span className="ml-2 font-medium">
              ₵{transaction.charge?.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span>
            <span className="ml-2 font-bold text-primary">
              ₵{transaction.totalAmount.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <span className="ml-2 font-medium">{transaction.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
