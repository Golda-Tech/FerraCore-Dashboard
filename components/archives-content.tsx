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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconDownload,
  IconUpload,
  IconFile,
  IconFileText,
  IconFileSpreadsheet,
  IconSearch,
  IconFilter,
  IconShare3,
  IconPlus,
  IconReport,
  IconClock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

interface ArchivedFile {
  id: string;
  fileName: string;
  fileType: "pdf" | "csv" | "xlsx" | "txt";
  itemType: "document" | "report";
  action: "download" | "upload" | "generated";
  size: number;
  date: string;
  description: string;
  category:
    | "transaction_report"
    | "bulk_upload"
    | "template"
    | "receipt"
    | "statement"
    | "payment_analysis"
    | "approval_report"
    | "funding_report";
  downloadCount?: number;
  uploadedBy?: string;
  status?: "completed" | "generating" | "failed";
  dateRange?: {
    from: string;
    to: string;
  };
  generatedBy?: string;
  parameters?: {
    includeFailedTransactions?: boolean;
    includeRefunds?: boolean;
    groupByMethod?: boolean;
    includeCharts?: boolean;
  };
}

const mockArchivedItems: ArchivedFile[] = [
  // Documents
  {
    id: "FILE-2024-001",
    fileName: "bulk_payments_batch_001.csv",
    fileType: "csv",
    itemType: "document",
    action: "upload",
    size: 512000,
    date: "2024-01-14T14:20:00Z",
    description: "Bulk payment file for vendor payments",
    category: "bulk_upload",
    uploadedBy: "John Smith",
    downloadCount: 0,
  },
  {
    id: "FILE-2024-002",
    fileName: "payment_template_v2.xlsx",
    fileType: "xlsx",
    itemType: "document",
    action: "download",
    size: 25600,
    date: "2024-01-13T09:15:00Z",
    description: "Updated payment template with new fields",
    category: "template",
    downloadCount: 12,
  },
  {
    id: "FILE-2024-003",
    fileName: "salary_payments_jan.csv",
    fileType: "csv",
    itemType: "document",
    action: "upload",
    size: 768000,
    date: "2024-01-11T11:30:00Z",
    description: "Monthly salary payment batch",
    category: "bulk_upload",
    uploadedBy: "Sarah Johnson",
    downloadCount: 0,
  },
  {
    id: "FILE-2024-004",
    fileName: "receipt_TXN-2024-001.pdf",
    fileType: "pdf",
    itemType: "document",
    action: "download",
    size: 102400,
    date: "2024-01-10T08:20:00Z",
    description: "Payment receipt for transaction TXN-2024-001",
    category: "receipt",
    downloadCount: 2,
  },
  // Reports
  {
    id: "RPT-2024-001",
    fileName: "january_2024_transaction_summary.pdf",
    fileType: "pdf",
    itemType: "report",
    action: "generated",
    size: 2048576,
    date: "2024-02-01T09:30:00Z",
    description:
      "Complete transaction summary for January 2024 including all payment methods",
    category: "transaction_report",
    status: "completed",
    downloadCount: 5,
    generatedBy: "John Merchant",
    dateRange: {
      from: "2024-01-01",
      to: "2024-01-31",
    },
    parameters: {
      includeFailedTransactions: true,
      includeRefunds: false,
      groupByMethod: true,
      includeCharts: true,
    },
  },
  {
    id: "RPT-2024-002",
    fileName: "payment_analysis_q4_2023.pdf",
    fileType: "pdf",
    itemType: "report",
    action: "generated",
    size: 3145728,
    date: "2024-01-15T14:20:00Z",
    description:
      "Detailed payment analysis for Q4 2023 with performance metrics",
    category: "payment_analysis",
    status: "completed",
    downloadCount: 12,
    generatedBy: "Sarah Johnson",
    dateRange: {
      from: "2023-10-01",
      to: "2023-12-31",
    },
    parameters: {
      includeFailedTransactions: true,
      includeRefunds: true,
      groupByMethod: true,
      includeCharts: true,
    },
  },
  {
    id: "RPT-2024-003",
    fileName: "account_statement_december_2023.pdf",
    fileType: "pdf",
    itemType: "report",
    action: "generated",
    size: 1536000,
    date: "2024-01-05T11:15:00Z",
    description:
      "Monthly account statement with all transactions and balance changes",
    category: "statement",
    status: "completed",
    downloadCount: 3,
    generatedBy: "System",
    dateRange: {
      from: "2023-12-01",
      to: "2023-12-31",
    },
    parameters: {
      includeFailedTransactions: false,
      includeRefunds: true,
      groupByMethod: false,
      includeCharts: false,
    },
  },
  {
    id: "RPT-2024-004",
    fileName: "bulk_upload_summary_january.pdf",
    fileType: "pdf",
    itemType: "report",
    action: "generated",
    size: 0,
    date: "2024-02-01T16:45:00Z",
    description: "Summary of all bulk upload activities for January 2024",
    category: "bulk_upload",
    status: "generating",
    downloadCount: 0,
    generatedBy: "Mike Davis",
    dateRange: {
      from: "2024-01-01",
      to: "2024-01-31",
    },
    parameters: {
      includeFailedTransactions: true,
      includeRefunds: false,
      groupByMethod: false,
      includeCharts: true,
    },
  },
];

export function ArchivesContent() {
  const [archivedItems] = useState<ArchivedFile[]>(mockArchivedItems);
  const [selectedItem, setSelectedItem] = useState<ArchivedFile | null>(null);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // New report generation form state
  const [newReport, setNewReport] = useState({
    name: "",
    type: "transaction_report",
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

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <IconFile className="h-4 w-4 text-red-600" />;
      case "csv":
        return <IconFileText className="h-4 w-4 text-green-600" />;
      case "xlsx":
        return <IconFileSpreadsheet className="h-4 w-4 text-blue-600" />;
      case "txt":
        return <IconFileText className="h-4 w-4 text-gray-600" />;
      default:
        return <IconFile className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "download":
        return <IconDownload className="h-4 w-4 text-blue-600" />;
      case "upload":
        return <IconUpload className="h-4 w-4 text-green-600" />;
      case "generated":
        return <IconReport className="h-4 w-4 text-purple-600" />;
      default:
        return <IconFile className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "transaction_report":
        return "default";
      case "bulk_upload":
        return "secondary";
      case "template":
        return "outline";
      case "receipt":
        return "default";
      case "statement":
        return "secondary";
      case "payment_analysis":
        return "default";
      case "approval_report":
        return "secondary";
      case "funding_report":
        return "outline";
      default:
        return "default";
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
      case "transaction_report":
        return "Transaction Report";
      case "payment_analysis":
        return "Payment Analysis";
      case "statement":
        return "Account Statement";
      case "bulk_upload":
        return "Bulk Upload Summary";
      case "approval_report":
        return "Approval Report";
      case "funding_report":
        return "Funding Report";
      default:
        return type.replace("_", " ");
    }
  };

  // Filter items based on selected filters and active tab
  const filteredItems = archivedItems.filter((item) => {
    const matchesTab = activeTab === "all" || item.itemType === activeTab;
    const matchesDate = !dateFilter || item.date.startsWith(dateFilter);
    const matchesAction =
      actionFilter === "all" || item.action === actionFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesTab &&
      matchesDate &&
      matchesAction &&
      matchesCategory &&
      matchesSearch
    );
  });

  // Calculate statistics for the filtered items
  const getStats = () => {
    const documents = filteredItems.filter((f) => f.itemType === "document");
    const reports = filteredItems.filter((f) => f.itemType === "report");
    const downloads = filteredItems.filter(
      (f) => f.action === "download"
    ).length;
    const uploads = filteredItems.filter((f) => f.action === "upload").length;
    const generated = filteredItems.filter(
      (f) => f.action === "generated"
    ).length;
    const totalSize = filteredItems.reduce((sum, f) => sum + f.size, 0);

    return {
      documents: documents.length,
      reports: reports.length,
      downloads,
      uploads,
      generated,
      totalSize,
      total: filteredItems.length,
    };
  };

  const stats = getStats();

  const handleGenerateReport = () => {
    console.log("Generating report:", newReport);
    setShowGenerateDialog(false);
    setNewReport({
      name: "",
      type: "transaction_report",
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
        <h2 className="text-3xl font-bold tracking-tight">Archives</h2>
        <Button onClick={() => setShowGenerateDialog(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <IconFile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.documents} docs, {stats.reports} reports
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <IconDownload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.downloads}</div>
            <p className="text-xs text-muted-foreground">Files downloaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uploads</CardTitle>
            <IconUpload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uploads}</div>
            <p className="text-xs text-muted-foreground">Files uploaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
            <IconReport className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.generated}</div>
            <p className="text-xs text-muted-foreground">Reports generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Items ({stats.total})</TabsTrigger>
          <TabsTrigger value="document">
            Documents ({stats.documents})
          </TabsTrigger>
          <TabsTrigger value="report">Reports ({stats.reports})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconFilter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
              <CardDescription>
                Filter archived items by date, action, category, or search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="date-filter">Date Filter</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action-filter">Action</Label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="download">Downloads</SelectItem>
                      <SelectItem value="upload">Uploads</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-filter">Category</Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="transaction_report">
                        Transaction Reports
                      </SelectItem>
                      <SelectItem value="bulk_upload">Bulk Uploads</SelectItem>
                      <SelectItem value="template">Templates</SelectItem>
                      <SelectItem value="receipt">Receipts</SelectItem>
                      <SelectItem value="statement">Statements</SelectItem>
                      <SelectItem value="payment_analysis">
                        Payment Analysis
                      </SelectItem>
                      <SelectItem value="approval_report">
                        Approval Reports
                      </SelectItem>
                      <SelectItem value="funding_report">
                        Funding Reports
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search items..."
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
                      setActionFilter("all");
                      setCategoryFilter("all");
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

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>Archived Items</CardTitle>
              <CardDescription>
                {filteredItems.length} items found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedItem(item)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getFileIcon(item.fileType)}
                          <div>
                            <div className="font-medium">{item.fileName}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {item.fileType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getActionIcon(item.action)}
                          <span className="capitalize">{item.action}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryColor(item.category)}>
                          {getReportTypeName(item.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.status ? (
                          <Badge
                            variant={getStatusColor(item.status)}
                            className="flex items-center space-x-1 w-fit"
                          >
                            {getStatusIcon(item.status)}
                            <span>{item.status}</span>
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatFileSize(item.size)}</TableCell>
                      <TableCell>{formatDate(item.date)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                    <SelectItem value="transaction_report">
                      Transaction Report
                    </SelectItem>
                    <SelectItem value="payment_analysis">
                      Payment Analysis
                    </SelectItem>
                    <SelectItem value="statement">Account Statement</SelectItem>
                    <SelectItem value="bulk_upload">
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

      {/* Item Details Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.itemType === "report"
                ? "Report Details"
                : "File Details"}
            </DialogTitle>
            <DialogDescription>
              Complete information about this archived item
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    ID
                  </Label>
                  <p className="font-mono">{selectedItem.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    File Name
                  </Label>
                  <p className="font-medium">{selectedItem.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    File Type
                  </Label>
                  <div className="flex items-center space-x-2">
                    {getFileIcon(selectedItem.fileType)}
                    <Badge variant="outline" className="uppercase">
                      {selectedItem.fileType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Action
                  </Label>
                  <div className="flex items-center space-x-2">
                    {getActionIcon(selectedItem.action)}
                    <span className="capitalize">{selectedItem.action}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Category
                  </Label>
                  <Badge variant={getCategoryColor(selectedItem.category)}>
                    {getReportTypeName(selectedItem.category)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    File Size
                  </Label>
                  <p>{formatFileSize(selectedItem.size)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="bg-muted/50 p-3 rounded-lg">
                  {selectedItem.description}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Date & Time
                </Label>
                <p>{formatDate(selectedItem.date)}</p>
              </div>

              {selectedItem.status && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge
                    variant={getStatusColor(selectedItem.status)}
                    className="flex items-center space-x-1 w-fit"
                  >
                    {getStatusIcon(selectedItem.status)}
                    <span>{selectedItem.status}</span>
                  </Badge>
                </div>
              )}

              {selectedItem.dateRange && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Report Date Range
                  </Label>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p>
                      From:{" "}
                      {new Date(selectedItem.dateRange.from).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                    <p>
                      To:{" "}
                      {new Date(selectedItem.dateRange.to).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  </div>
                </div>
              )}

              {selectedItem.downloadCount !== undefined && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Download Count
                  </Label>
                  <p>{selectedItem.downloadCount} times</p>
                </div>
              )}

              {selectedItem.uploadedBy && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Uploaded By
                  </Label>
                  <p>{selectedItem.uploadedBy}</p>
                </div>
              )}

              {selectedItem.generatedBy && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Generated By
                  </Label>
                  <p>{selectedItem.generatedBy}</p>
                </div>
              )}

              {selectedItem.parameters && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Report Parameters
                  </Label>
                  <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                    <p>
                      • Include failed transactions:{" "}
                      {selectedItem.parameters.includeFailedTransactions
                        ? "Yes"
                        : "No"}
                    </p>
                    <p>
                      • Include refunds:{" "}
                      {selectedItem.parameters.includeRefunds ? "Yes" : "No"}
                    </p>
                    <p>
                      • Group by method:{" "}
                      {selectedItem.parameters.groupByMethod ? "Yes" : "No"}
                    </p>
                    <p>
                      • Include charts:{" "}
                      {selectedItem.parameters.includeCharts ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                {selectedItem.status === "completed" ||
                selectedItem.itemType === "document" ? (
                  <Button className="flex-1">
                    <IconDownload className="h-4 w-4 mr-2" />
                    Download{" "}
                    {selectedItem.itemType === "report" ? "Report" : "File"}
                  </Button>
                ) : null}
                <Button variant="outline" className="flex-1 bg-transparent">
                  <IconShare3 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
