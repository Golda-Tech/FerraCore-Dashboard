"use client";

import { useState } from "react";
import { IconCheck, IconClock, IconEye, IconX } from "@tabler/icons-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const pendingApprovals = [
  {
    id: 1,
    batchId: "BATCH-001",
    type: "Single Payment",
    initiatedBy: "John Merchant",
    amount: 50000,
    recipients: 1,
    dateInitiated: "2024-01-16T08:45:00Z",
    description: "Farmer payment for harvest",
  },
  {
    id: 2,
    batchId: "BATCH-002",
    type: "Bulk Upload",
    initiatedBy: "Jane Merchant",
    amount: 250000,
    recipients: 15,
    dateInitiated: "2024-01-16T10:30:00Z",
    description: "Monthly farmer disbursements",
  },
  {
    id: 3,
    batchId: "BATCH-003",
    type: "Single Payment",
    initiatedBy: "Bob Merchant",
    amount: 75000,
    recipients: 1,
    dateInitiated: "2024-01-16T14:20:00Z",
    description: "Equipment purchase payment",
  },
];

const approvedPayments = [
  {
    id: 4,
    batchId: "BATCH-004",
    type: "Bulk Upload",
    initiatedBy: "Alice Merchant",
    approvedBy: "Sarah Admin",
    amount: 180000,
    recipients: 12,
    dateApproved: "2024-01-15T16:30:00Z",
    status: "Processing",
  },
  {
    id: 5,
    batchId: "BATCH-005",
    type: "Single Payment",
    initiatedBy: "David Merchant",
    approvedBy: "Mike Admin",
    amount: 60000,
    recipients: 1,
    dateApproved: "2024-01-15T14:15:00Z",
    status: "Completed",
  },
];

export default function ApprovalsPage() {
  const [selectedTab, setSelectedTab] = useState("pending");

  const handleApprove = (id: number) => {
    alert(`Approved payment with ID: ${id}`);
  };

  const handleReject = (id: number) => {
    alert(`Rejected payment with ID: ${id}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Approvals</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Pending Approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingApprovals.length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Approved Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Amount</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦375,000</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals
            <Badge variant="secondary" className="ml-2">
              {pendingApprovals.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>
                Review and approve pending disbursement requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono">
                          {payment.batchId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.type}</Badge>
                        </TableCell>
                        <TableCell>{payment.initiatedBy}</TableCell>
                        <TableCell className="font-medium">
                          ₦{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>{payment.recipients}</TableCell>
                        <TableCell>
                          {new Date(payment.dateInitiated).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(payment.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <IconCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(payment.id)}
                            >
                              <IconX className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Payments</CardTitle>
              <CardDescription>
                Recently approved disbursement requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Initiated By</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Approved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono">
                          {payment.batchId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.type}</Badge>
                        </TableCell>
                        <TableCell>{payment.initiatedBy}</TableCell>
                        <TableCell>{payment.approvedBy}</TableCell>
                        <TableCell className="font-medium">
                          ₦{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              payment.status === "Completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }
                          >
                            {payment.status === "Completed" ? (
                              <IconCheck className="h-3 w-3 mr-1" />
                            ) : (
                              <IconClock className="h-3 w-3 mr-1" />
                            )}
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(payment.dateApproved).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
