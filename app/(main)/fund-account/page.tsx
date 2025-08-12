"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  CreditCard,
  Building,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface FundingTransaction {
  id: string;
  amount: number;
  method: "bank_transfer" | "card" | "mobile_money";
  status: "completed" | "pending" | "failed";
  date: string;
  reference: string;
  description: string;
  fees: number;
  sourceAccount?: string;
  sourceBank?: string;
}

const mockFundingHistory: FundingTransaction[] = [
  {
    id: "FUND-001",
    amount: 500000,
    method: "bank_transfer",
    status: "completed",
    date: "2024-01-15T10:30:00Z",
    reference: "BT-2024-001",
    description: "Account funding via bank transfer",
    fees: 0,
    sourceAccount: "****1234",
    sourceBank: "First Bank Ghana",
  },
  {
    id: "FUND-002",
    amount: 250000,
    method: "card",
    status: "completed",
    date: "2024-01-14T14:20:00Z",
    reference: "CD-2024-002",
    description: "Quick top-up via debit card",
    fees: 1250,
    sourceAccount: "****5678",
  },
  {
    id: "FUND-003",
    amount: 100000,
    method: "mobile_money",
    status: "pending",
    date: "2024-01-15T11:45:00Z",
    reference: "MM-2024-003",
    description: "Mobile money transfer",
    fees: 500,
    sourceAccount: "0244******89",
  },
];

export default function FundAccountPage() {
  const [fundingMethod, setFundingMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [fundingHistory, setFundingHistory] =
    useState<FundingTransaction[]>(mockFundingHistory);
  const [selectedTransaction, setSelectedTransaction] =
    useState<FundingTransaction | null>(null);

  // Mock account balance
  const accountBalance = 1250000;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <Building className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "mobile_money":
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return "Bank Transfer";
      case "card":
        return "Debit/Credit Card";
      case "mobile_money":
        return "Mobile Money";
      default:
        return method;
    }
  };

  const calculateFees = (amount: string, method: string) => {
    const num = Number.parseFloat(amount);
    if (isNaN(num)) return 0;

    switch (method) {
      case "bank_transfer":
        return 0; // Free for bank transfers
      case "card":
        return num * 0.005; // 0.5% for card payments
      case "mobile_money":
        return Math.min(num * 0.005, 500); // 0.5% capped at GHS 500
      default:
        return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    setSubmitStatus(success ? "success" : "error");
    setIsSubmitting(false);

    if (success) {
      // Add new funding transaction
      const newTransaction: FundingTransaction = {
        id: `FUND-${Date.now()}`,
        amount: Number.parseFloat(amount),
        method: fundingMethod as any,
        status: "pending",
        date: new Date().toISOString(),
        reference: `${fundingMethod.toUpperCase()}-${Date.now()}`,
        description:
          description || `Account funding via ${getMethodName(fundingMethod)}`,
        fees: calculateFees(amount, fundingMethod),
      };

      setFundingHistory((prev) => [newTransaction, ...prev]);

      // Reset form
      setAmount("");
      setDescription("");
      setFundingMethod("");
    }
  };

  const totalFunded = fundingHistory
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Fund Account</h2>
        <Badge variant="outline" className="ml-auto">
          <Wallet className="mr-1 h-3 w-3" />
          Multiple Methods
        </Badge>
      </div>

      {submitStatus === "success" && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Funding request has been submitted successfully and is being
            processed.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            There was an error processing your funding request. Please try
            again.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Account Balance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Account Balance
              </CardTitle>
              <CardDescription>
                Available balance for disbursements and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-4">
                {formatCurrency(accountBalance)}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Funded</p>
                  <p className="font-medium">{formatCurrency(totalFunded)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Available</p>
                  <p className="font-medium">
                    {formatCurrency(accountBalance)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Funds
              </CardTitle>
              <CardDescription>
                Top up your account balance to make payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fundingMethod">Funding Method *</Label>
                    <Select
                      value={fundingMethod}
                      onValueChange={setFundingMethod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select funding method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Bank Transfer (Free)
                          </div>
                        </SelectItem>
                        <SelectItem value="card">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Debit/Credit Card (0.5% fee)
                          </div>
                        </SelectItem>
                        <SelectItem value="mobile_money">
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            Mobile Money (0.5% fee, max GHS 500)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (GHS) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="10"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum funding amount: GHS 10.00
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter a description for this funding transaction"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !fundingMethod || !amount}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Fund Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Funding Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {amount && fundingMethod && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(Number.parseFloat(amount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Processing Fee:
                    </span>
                    <span>
                      {formatCurrency(calculateFees(amount, fundingMethod))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total to Pay:</span>
                    <span>
                      {formatCurrency(
                        (Number.parseFloat(amount) || 0) +
                          calculateFees(amount, fundingMethod)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Amount Added to Balance:</span>
                    <span className="font-medium">
                      {formatCurrency(Number.parseFloat(amount) || 0)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Funding Methods Info */}
          <Card>
            <CardHeader>
              <CardTitle>Funding Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-muted-foreground">
                    Free • 1-2 business days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Debit/Credit Card</p>
                  <p className="text-muted-foreground">0.5% fee • Instant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="font-medium">Mobile Money</p>
                  <p className="text-muted-foreground">
                    0.5% fee (max GHS 500) • Instant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardHeader>
              <CardTitle>Security & Limits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>PCI DSS compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Daily limit: GHS 1,000,000</span>
              </div>
              <div className="text-xs text-muted-foreground mt-4">
                All transactions are monitored for security and compliance.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Funding History */}
      <Card>
        <CardHeader>
          <CardTitle>Funding History</CardTitle>
          <CardDescription>Recent account funding transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundingHistory.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getMethodIcon(transaction.method)}
                      <div>
                        <p className="font-medium">{transaction.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.reference}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {getMethodName(transaction.method)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(transaction);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Funding Transaction Details</DialogTitle>
                          <DialogDescription>
                            Complete information for transaction{" "}
                            {selectedTransaction?.id}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedTransaction && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Wallet className="h-4 w-4" />
                                  Transaction Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      ID:
                                    </span>
                                    <span>{selectedTransaction.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Reference:
                                    </span>
                                    <span>{selectedTransaction.reference}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Method:
                                    </span>
                                    <span>
                                      {getMethodName(
                                        selectedTransaction.method
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Date:
                                    </span>
                                    <span>
                                      {formatDate(selectedTransaction.date)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Status:
                                    </span>
                                    {getStatusBadge(selectedTransaction.status)}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">
                                  Source Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {selectedTransaction.sourceAccount && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Account:
                                      </span>
                                      <span>
                                        {selectedTransaction.sourceAccount}
                                      </span>
                                    </div>
                                  )}
                                  {selectedTransaction.sourceBank && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">
                                        Bank:
                                      </span>
                                      <span>
                                        {selectedTransaction.sourceBank}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">
                                Financial Breakdown
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Funding Amount:
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(selectedTransaction.amount)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Processing Fee:
                                  </span>
                                  <span>
                                    {formatCurrency(selectedTransaction.fees)}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                  <span className="font-medium">
                                    Total Paid:
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency(
                                      selectedTransaction.amount +
                                        selectedTransaction.fees
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">
                                Description
                              </h4>
                              <p className="text-sm bg-muted p-3 rounded-md">
                                {selectedTransaction.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
