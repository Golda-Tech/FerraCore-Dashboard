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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  IconDownload,
  IconPlus,
  IconFileText,
  IconSearch,
  IconFilter,
  IconReport,
  IconChartBar,
  IconClock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface GeneratedReport {
  id: string;
  name: string;
  type:
    | "transaction_summary"
    | "payment_analysis"
    | "account_statement"
    | "bulk_upload_summary"
    | "approval_report"
    | "funding_report";
  status: "completed" | "generating" | "failed";
  dateRange: {
    from: string;
    to: string;
  };
  generatedDate: string;
  generatedBy: string;
  fileSize: number;
  downloadCount: number;
  description: string;
  parameters: {
    includeFailedTransactions?: boolean;
    includeRefunds?: boolean;
    groupByMethod?: boolean;
    includeCharts?: boolean;
  };
}

const mockReports: GeneratedReport[] = [
  {
    id: "RPT-2024-001",
    name: "January 2024 Transaction Summary",
    type: "transaction_summary",
    status: "completed",
    dateRange: {
      from: "2024-01-01",
      to: "2024-01-31",
    },
    generatedDate: "2024-02-01T09:30:00Z",
    generatedBy: "John Merchant",
    fileSize: 2048576,
    downloadCount: 5,
    description:
      "Complete transaction summary for January 2024 including all payment methods",
    parameters: {
      includeFailedTransactions: true,
      includeRefunds: false,
      groupByMethod: true,
      includeCharts: true,
    },
  },
  {
    id: "RPT-2024-002",
    name: "Payment Analysis Q4 2023",
    type: "payment_analysis",
    status: "completed",
    dateRange: {
      from: "2023-10-01",
      to: "2023-12-31",
    },
    generatedDate: "2024-01-15T14:20:00Z",
    generatedBy: "Sarah Johnson",
    fileSize: 3145728,
    downloadCount: 12,
    description:
      "Detailed payment analysis for Q4 2023 with performance metrics",
    parameters: {
      includeFailedTransactions: true,
      includeRefunds: true,
      groupByMethod: true,
      includeCharts: true,
    },
  },
  {
    id: "RPT-2024-003",
    name: "Account Statement December 2023",
    type: "account_statement",
    status: "completed",
    dateRange: {
      from: "2023-12-01",
      to: "2023-12-31",
    },
    generatedDate: "2024-01-05T11:15:00Z",
    generatedBy: "System",
    fileSize: 1536000,
    downloadCount: 3,
    description:
      "Monthly account statement with all transactions and balance changes",
    parameters: {
      includeFailedTransactions: false,
      includeRefunds: true,
      groupByMethod: false,
      includeCharts: false,
    },
  },
  {
    id: "RPT-2024-004",
    name: "Bulk Upload Summary January",
    type: "bulk_upload_summary",
    status: "generating",
    dateRange: {
      from: "2024-01-01",
      to: "2024-01-31",
    },
    generatedDate: "2024-02-01T16:45:00Z",
    generatedBy: "Mike Davis",
    fileSize: 0,
    downloadCount: 0,
    description: "Summary of all bulk upload activities for January 2024",
    parameters: {
      includeFailedTransactions: true,
      includeRefunds: false,
      groupByMethod: false,
      includeCharts: true,
    },
  },
];

export function ReportsContent() {
  const [reports] = useState<GeneratedReport[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(
    null
  );
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // New report generation form state
  const [newReport, setNewReport] = useState({
    name: "",
    type: "transaction_summary",
    dateFrom: "",
    dateTo: "",
    description: "",
    parameters: {
      includeFailedTransactions: true,
      includeRefunds: false,
      groupByMethod: true,
      includeCharts: true,
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
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

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "transaction_summary":
        return <IconFileText className="h-4 w-4 text-blue-600" />;
      case "payment_analysis":
        return <IconChartBar className="h-4 w-4 text-green-600" />;
      case "account_statement":
        return <IconReport className="h-4 w-4 text-purple-600" />;
      case "bulk_upload_summary":
        return <IconFileText className="h-4 w-4 text-orange-600" />;
      case "approval_report":
        return <IconCheck className="h-4 w-4 text-teal-600" />;
      case "funding_report":
        return <IconReport className="h-4 w-4 text-indigo-600" />;
      default:
        return <IconFileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
        return "destructive";
      case "generating":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <IconCheck className="h-4 w-4" />;
      case "failed":
        return <IconX className="h-4 w-4" />;
      case "generating":
        return <IconClock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getReportTypeName = (type: string) => {
    switch (type) {
      case "transaction_summary":
        return "Transaction Summary";
      case "payment_analysis":
        return "Payment Analysis";
      case "account_statement":
        return "Account Statement";
      case "bulk_upload_summary":
        return "Bulk Upload Summary";
      case "approval_report":
        return "Approval Report";
      case "funding_report":
        return "Funding Report";
      default:
        return type;
    }
  };

  // Filter reports based on selected filters
  const filteredReports = reports.filter((report) => {
    const matchesDate =
      !dateFilter || report.generatedDate.startsWith(dateFilter);
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDate && matchesType && matchesStatus && matchesSearch;
  });

  const handleGenerateReport = () => {
    // Handle report generation logic here
    console.log("Generating report:", newReport);
    setShowGenerateDialog(false);
    // Reset form
    setNewReport({
      name: "",
      type: "transaction_summary",
      dateFrom: "",
      dateTo: "",
      description: "",
      parameters: {
        includeFailedTransactions: true,
        includeRefunds: false,
        groupByMethod: true,
        includeCharts: true,
      },
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <Button onClick={() => setShowGenerateDialog(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <IconReport className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredReports.length}</div>
            <p className="text-xs text-muted-foreground">Generated reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <IconCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReports.filter((r) => r.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Ready for download</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Downloads
            </CardTitle>
            <IconDownload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredReports.reduce((sum, r) => sum + r.downloadCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">All time downloads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(
                filteredReports.reduce((sum, r) => sum + r.fileSize, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">Total file size</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <IconFilter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          <CardDescription>
            Filter reports by date, type, status, or search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="date-filter">Generated Date</Label>
              <Input
                id="date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-filter">Report Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="transaction_summary">
                    Transaction Summary
                  </SelectItem>
                  <SelectItem value="payment_analysis">
                    Payment Analysis
                  </SelectItem>
                  <SelectItem value="account_statement">
                    Account Statement
                  </SelectItem>
                  <SelectItem value="bulk_upload_summary">
                    Bulk Upload Summary
                  </SelectItem>
                  <SelectItem value="approval_report">
                    Approval Report
                  </SelectItem>
                  <SelectItem value="funding_report">Funding Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="generating">Generating</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDateFilter("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                  setSearchQuery("");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            {filteredReports.length} reports found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedReport(report)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getReportTypeIcon(report.type)}
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {report.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getReportTypeName(report.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusColor(report.status)}
                      className="flex items-center space-x-1 w-fit"
                    >
                      {getStatusIcon(report.status)}
                      <span>{report.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {new Date(report.dateRange.from).toLocaleDateString(
                          "en-GB"
                        )}
                      </div>
                      <div className="text-muted-foreground">
                        to{" "}
                        {new Date(report.dateRange.to).toLocaleDateString(
                          "en-GB"
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(report.generatedDate)}</div>
                      <div className="text-muted-foreground">
                        by {report.generatedBy}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(report.fileSize)}</TableCell>
                  <TableCell>{report.downloadCount}</TableCell>
                  <TableCell>
                    {report.status === "completed" && (
                      <Button variant="ghost" size="sm">
                        <IconDownload className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate New Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate New Report</DialogTitle>
            <DialogDescription>
              Create a new report with custom parameters and date range
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="Enter report name"
                  value={newReport.name}
                  onChange={(e) =>
                    setNewReport({ ...newReport, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={newReport.type}
                  onValueChange={(value) =>
                    setNewReport({ ...newReport, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transaction_summary">
                      Transaction Summary
                    </SelectItem>
                    <SelectItem value="payment_analysis">
                      Payment Analysis
                    </SelectItem>
                    <SelectItem value="account_statement">
                      Account Statement
                    </SelectItem>
                    <SelectItem value="bulk_upload_summary">
                      Bulk Upload Summary
                    </SelectItem>
                    <SelectItem value="approval_report">
                      Approval Report
                    </SelectItem>
                    <SelectItem value="funding_report">
                      Funding Report
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={newReport.dateFrom}
                  onChange={(e) =>
                    setNewReport({ ...newReport, dateFrom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={newReport.dateTo}
                  onChange={(e) =>
                    setNewReport({ ...newReport, dateTo: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Enter report description"
                value={newReport.description}
                onChange={(e) =>
                  setNewReport({ ...newReport, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-4">
              <Label>Report Parameters</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-failed"
                    checked={newReport.parameters.includeFailedTransactions}
                    onCheckedChange={(checked) =>
                      setNewReport({
                        ...newReport,
                        parameters: {
                          ...newReport.parameters,
                          includeFailedTransactions: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="include-failed">
                    Include failed transactions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-refunds"
                    checked={newReport.parameters.includeRefunds}
                    onCheckedChange={(checked) =>
                      setNewReport({
                        ...newReport,
                        parameters: {
                          ...newReport.parameters,
                          includeRefunds: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="include-refunds">Include refunds</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="group-by-method"
                    checked={newReport.parameters.groupByMethod}
                    onCheckedChange={(checked) =>
                      setNewReport({
                        ...newReport,
                        parameters: {
                          ...newReport.parameters,
                          groupByMethod: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="group-by-method">
                    Group by payment method
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={newReport.parameters.includeCharts}
                    onCheckedChange={(checked) =>
                      setNewReport({
                        ...newReport,
                        parameters: {
                          ...newReport.parameters,
                          includeCharts: checked === true,
                        },
                      })
                    }
                  />
                  <Label htmlFor="include-charts">
                    Include charts and graphs
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleGenerateReport} className="flex-1">
                <IconPlus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowGenerateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={() => setSelectedReport(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Complete information about this generated report
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Report ID
                  </Label>
                  <p className="font-mono">{selectedReport.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Report Name
                  </Label>
                  <p className="font-medium">{selectedReport.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Type
                  </Label>
                  <div className="flex items-center space-x-2">
                    {getReportTypeIcon(selectedReport.type)}
                    <Badge variant="outline">
                      {getReportTypeName(selectedReport.type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={getStatusColor(selectedReport.status)}
                    className="flex items-center space-x-1 w-fit"
                  >
                    {getStatusIcon(selectedReport.status)}
                    <span>{selectedReport.status}</span>
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="bg-muted/50 p-3 rounded-lg">
                  {selectedReport.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Date Range
                  </Label>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p>
                      From:{" "}
                      {new Date(
                        selectedReport.dateRange.from
                      ).toLocaleDateString("en-GB")}
                    </p>
                    <p>
                      To:{" "}
                      {new Date(selectedReport.dateRange.to).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Generation Info
                  </Label>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p>Generated: {formatDate(selectedReport.generatedDate)}</p>
                    <p>By: {selectedReport.generatedBy}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    File Size
                  </Label>
                  <p>{formatFileSize(selectedReport.fileSize)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Download Count
                  </Label>
                  <p>{selectedReport.downloadCount} times</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Report Parameters
                </Label>
                <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                  <p>
                    • Include failed transactions:{" "}
                    {selectedReport.parameters.includeFailedTransactions
                      ? "Yes"
                      : "No"}
                  </p>
                  <p>
                    • Include refunds:{" "}
                    {selectedReport.parameters.includeRefunds ? "Yes" : "No"}
                  </p>
                  <p>
                    • Group by method:{" "}
                    {selectedReport.parameters.groupByMethod ? "Yes" : "No"}
                  </p>
                  <p>
                    • Include charts:{" "}
                    {selectedReport.parameters.includeCharts ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                {selectedReport.status === "completed" && (
                  <Button className="flex-1">
                    <IconDownload className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                )}
                <Button variant="outline" className="flex-1 bg-transparent">
                  Generate Similar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
