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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  IconCheck,
  IconX,
  IconEye,
  IconClock,
  IconCurrencyDollar,
} from "@tabler/icons-react";

interface ApprovalRequest {
  id: string;
  type: string;
  description: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  requestedBy: string;
  requestedByEmail: string;
  date: string;
  priority: "Low" | "Medium" | "High";
  category: string;
  recipient?: string;
  recipientName?: string;
  recipientType?: string;
  network?: string;
  reference: string;
  batchId?: string;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
}

const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: "APR001",
    type: "Single Payout",
    description: "Payment to Vendor A for office supplies",
    amount: 1500.0,
    status: "Pending",
    requestedBy: "Alice Johnson",
    requestedByEmail: "alice.johnson@company.com",
    date: "2024-07-20",
    priority: "Medium",
    category: "Vendor Payment",
    recipient: "0244123456",
    recipientName: "Vendor A Ltd",
    recipientType: "Mobile Money",
    network: "MTN Ghana",
    reference: "REQ-2024-001",
    notes: "Urgent payment for office supplies delivery",
  },
  {
    id: "APR002",
    type: "Bulk Upload",
    description: "Payroll for July 2024",
    amount: 25000.0,
    status: "Pending",
    requestedBy: "Bob Williams",
    requestedByEmail: "bob.williams@company.com",
    date: "2024-07-19",
    priority: "High",
    category: "Payroll",
    batchId: "BATCH-PAY-202407",
    reference: "REQ-2024-002",
    notes: "Monthly payroll processing for all employees",
  },
  {
    id: "APR003",
    type: "Single Payout",
    description: "Refund to Customer B",
    amount: 250.5,
    status: "Approved",
    requestedBy: "Charlie Brown",
    requestedByEmail: "charlie.brown@company.com",
    date: "2024-07-18",
    priority: "Low",
    category: "Customer Refund",
    recipient: "0201234567",
    recipientName: "John Customer",
    recipientType: "Mobile Money",
    network: "Vodafone",
    reference: "REQ-2024-003",
    approvedBy: "Sarah Admin",
    approvedDate: "2024-07-18T14:30:00Z",
  },
  {
    id: "APR004",
    type: "Bulk Upload",
    description: "Supplier payments Q2",
    amount: 12000.0,
    status: "Pending",
    requestedBy: "Diana Prince",
    requestedByEmail: "diana.prince@company.com",
    date: "2024-07-17",
    priority: "Medium",
    category: "Supplier Payment",
    batchId: "BATCH-SUP-Q2-2024",
    reference: "REQ-2024-004",
    notes: "Quarterly supplier payments for Q2 2024",
  },
  {
    id: "APR005",
    type: "Single Payout",
    description: "Consulting fee payment",
    amount: 750.0,
    status: "Rejected",
    requestedBy: "Eve Adams",
    requestedByEmail: "eve.adams@company.com",
    date: "2024-07-16",
    priority: "Low",
    category: "Professional Services",
    recipient: "1234567890123456",
    recipientName: "Consulting Firm Ltd",
    recipientType: "Bank Account",
    network: "GCB Bank",
    reference: "REQ-2024-005",
    rejectionReason: "Insufficient documentation provided",
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
    case "Medium":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
    case "Low":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800";
    case "Rejected":
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800";
    case "Pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800";
  }
};

export function ApprovalsContent() {
  const [approvals, setApprovals] =
    useState<ApprovalRequest[]>(mockApprovalRequests);
  const [selectedApproval, setSelectedApproval] =
    useState<ApprovalRequest | null>(null);

  const handleApprove = (id: string) => {
    setApprovals((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "Approved" as const,
              approvedBy: "Current User",
              approvedDate: new Date().toISOString(),
            }
          : req
      )
    );
    console.log(`Approved request: ${id}`);
  };

  const handleReject = (id: string) => {
    setApprovals((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status: "Rejected" as const,
              rejectionReason: "Rejected by administrator",
            }
          : req
      )
    );
    console.log(`Rejected request: ${id}`);
  };

  const pendingApprovals = approvals.filter((a) => a.status === "Pending");
  const approvedApprovals = approvals.filter((a) => a.status === "Approved");
  const rejectedApprovals = approvals.filter((a) => a.status === "Rejected");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Approvals</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Requests</CardDescription>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Pending</CardDescription>
            <IconClock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingApprovals.length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Approved</CardDescription>
            <IconCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedApprovals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Rejected</CardDescription>
            <IconX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {rejectedApprovals.length}
            </div>
            <p className="text-xs text-muted-foreground">Declined requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Approvals</CardTitle>
          <CardDescription>
            Review and approve or reject pending payment requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.map((request) => (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedApproval(request)}
                >
                  <TableCell className="font-mono">
                    {request.reference}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.description}
                  </TableCell>
                  <TableCell className="font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(request.amount)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.requestedBy}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.requestedByEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getPriorityColor(request.priority)}
                    >
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(request.status)}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApproval(request);
                        }}
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                      {request.status === "Pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(request.id);
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            <IconCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(request.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <IconX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Details Dialog */}
      <Dialog
        open={!!selectedApproval}
        onOpenChange={() => setSelectedApproval(null)}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approval Request Details</DialogTitle>
            <DialogDescription>
              Reference: {selectedApproval?.reference}
            </DialogDescription>
          </DialogHeader>
          {selectedApproval && (
            <ApprovalDetails
              approval={selectedApproval}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApprovalDetails({
  approval,
  onApprove,
  onReject,
}: {
  approval: ApprovalRequest;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{approval.description}</h3>
          <p className="text-sm text-muted-foreground">
            Requested by {approval.requestedBy}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={getPriorityColor(approval.priority)}
          >
            {approval.priority} Priority
          </Badge>
          <Badge variant="outline" className={getStatusColor(approval.status)}>
            {approval.status}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Request Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Request Details
          </h4>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Reference Number
              </Label>
              <p className="font-mono text-sm mt-1">{approval.reference}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Request Type
              </Label>
              <p className="text-sm mt-1">{approval.type}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Category
              </Label>
              <p className="text-sm mt-1">{approval.category}</p>
            </div>

            {approval.batchId && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Batch ID
                </Label>
                <p className="font-mono text-sm mt-1">{approval.batchId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Requester Information
          </h4>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Requested By
              </Label>
              <p className="text-sm mt-1">{approval.requestedBy}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Email
              </Label>
              <p className="text-sm mt-1">{approval.requestedByEmail}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Request Date
              </Label>
              <p className="text-sm mt-1">
                {new Date(approval.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Financial Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Financial Details
        </h4>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </Label>
                <p className="text-3xl font-bold mt-1">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(approval.amount)}
                </p>
              </div>
              <IconCurrencyDollar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recipient Information (for Single Payouts) */}
      {approval.recipientName && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Recipient Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Recipient Name
                </Label>
                <p className="text-sm mt-1">{approval.recipientName}</p>
              </div>

              {approval.recipient && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Recipient Account
                  </Label>
                  <p className="font-mono text-sm mt-1">{approval.recipient}</p>
                </div>
              )}

              {approval.recipientType && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{approval.recipientType}</Badge>
                    {approval.network && (
                      <span className="text-sm text-muted-foreground">
                        via {approval.network}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      {approval.notes && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Additional Notes
            </h4>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">{approval.notes}</p>
            </div>
          </div>
        </>
      )}

      {/* Approval Information */}
      {(approval.approvedBy || approval.rejectionReason) && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {approval.status === "Approved" ? "Approval" : "Rejection"}{" "}
              Details
            </h4>

            {approval.approvedBy && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Approved By
                  </Label>
                  <p className="text-sm mt-1">{approval.approvedBy}</p>
                </div>

                {approval.approvedDate && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Approval Date
                    </Label>
                    <p className="text-sm mt-1">
                      {new Date(approval.approvedDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {approval.rejectionReason && (
              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <Label className="text-sm font-medium text-red-700 dark:text-red-300">
                  Rejection Reason
                </Label>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {approval.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Action Buttons */}
      {approval.status === "Pending" && (
        <>
          <Separator />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onReject(approval.id)}
              className="text-red-600 hover:text-red-700"
            >
              <IconX className="h-4 w-4 mr-2" />
              Reject Request
            </Button>
            <Button
              onClick={() => onApprove(approval.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <IconCheck className="h-4 w-4 mr-2" />
              Approve Request
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
