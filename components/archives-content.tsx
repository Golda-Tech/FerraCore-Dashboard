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
import {
  IconDownload,
  IconUpload,
  IconFile,
  IconFileText,
  IconFileSpreadsheet,
  IconSearch,
  IconFilter,
  IconShare3,
} from "@tabler/icons-react";

interface ArchivedFile {
  id: string;
  fileName: string;
  fileType: "pdf" | "csv" | "xlsx" | "txt";
  action: "download" | "upload";
  size: number;
  date: string;
  description: string;
  category:
    | "transaction_report"
    | "bulk_upload"
    | "template"
    | "receipt"
    | "statement";
  downloadCount?: number;
  uploadedBy?: string;
}

const mockArchivedFiles: ArchivedFile[] = [
  {
    id: "FILE-2024-001",
    fileName: "transaction_report_january_2024.pdf",
    fileType: "pdf",
    action: "download",
    size: 2048576, // 2MB
    date: "2024-01-15T10:30:00Z",
    description: "Monthly transaction report for January 2024",
    category: "transaction_report",
    downloadCount: 3,
  },
  {
    id: "FILE-2024-002",
    fileName: "bulk_payments_batch_001.csv",
    fileType: "csv",
    action: "upload",
    size: 512000, // 500KB
    date: "2024-01-14T14:20:00Z",
    description: "Bulk payment file for vendor payments",
    category: "bulk_upload",
    uploadedBy: "John Smith",
  },
  {
    id: "FILE-2024-003",
    fileName: "payment_template_v2.xlsx",
    fileType: "xlsx",
    action: "download",
    size: 25600, // 25KB
    date: "2024-01-13T09:15:00Z",
    description: "Updated payment template with new fields",
    category: "template",
    downloadCount: 12,
  },
  {
    id: "FILE-2024-004",
    fileName: "account_statement_december.pdf",
    fileType: "pdf",
    action: "download",
    size: 1536000, // 1.5MB
    date: "2024-01-12T16:45:00Z",
    description: "Account statement for December 2023",
    category: "statement",
    downloadCount: 1,
  },
  {
    id: "FILE-2024-005",
    fileName: "salary_payments_jan.csv",
    fileType: "csv",
    action: "upload",
    size: 768000, // 750KB
    date: "2024-01-11T11:30:00Z",
    description: "Monthly salary payment batch",
    category: "bulk_upload",
    uploadedBy: "Sarah Johnson",
  },
  {
    id: "FILE-2024-006",
    fileName: "receipt_TXN-2024-001.pdf",
    fileType: "pdf",
    action: "download",
    size: 102400, // 100KB
    date: "2024-01-10T08:20:00Z",
    description: "Payment receipt for transaction TXN-2024-001",
    category: "receipt",
    downloadCount: 2,
  },
];

export function ArchivesContent() {
  const [archivedFiles] = useState<ArchivedFile[]>(mockArchivedFiles);
  const [selectedFile, setSelectedFile] = useState<ArchivedFile | null>(null);
  const [dateFilter, setDateFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
      default:
        return "default";
    }
  };

  // Filter files based on selected filters
  const filteredFiles = archivedFiles.filter((file) => {
    const matchesDate = !dateFilter || file.date.startsWith(dateFilter);
    const matchesAction =
      actionFilter === "all" || file.action === actionFilter;
    const matchesCategory =
      categoryFilter === "all" || file.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDate && matchesAction && matchesCategory && matchesSearch;
  });

  // Calculate statistics for the filtered date range
  const getDateRangeStats = () => {
    const downloads = filteredFiles.filter(
      (f) => f.action === "download"
    ).length;
    const uploads = filteredFiles.filter((f) => f.action === "upload").length;
    const totalSize = filteredFiles.reduce((sum, f) => sum + f.size, 0);

    return { downloads, uploads, totalSize, total: filteredFiles.length };
  };

  const stats = getDateRangeStats();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Archives</h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <IconFile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In selected range</p>
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
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <IconFileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(stats.totalSize)}
            </div>
            <p className="text-xs text-muted-foreground">Storage used</p>
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
            Filter archived files by date, action, category, or search
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search files..."
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

      {/* Files Table */}
      <Card>
        <CardHeader>
          <CardTitle>Archived Files</CardTitle>
          <CardDescription>{filteredFiles.length} files found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow
                  key={file.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedFile(file)}
                >
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.fileType)}
                      <div>
                        <div className="font-medium">{file.fileName}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {file.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {file.fileType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getActionIcon(file.action)}
                      <span className="capitalize">{file.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryColor(file.category)}>
                      {file.category.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{formatDate(file.date)}</TableCell>
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

      {/* File Details Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>File Details</DialogTitle>
            <DialogDescription>
              Complete information about this archived file
            </DialogDescription>
          </DialogHeader>

          {selectedFile && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    File ID
                  </Label>
                  <p className="font-mono">{selectedFile.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    File Name
                  </Label>
                  <p className="font-medium">{selectedFile.fileName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    File Type
                  </Label>
                  <div className="flex items-center space-x-2">
                    {getFileIcon(selectedFile.fileType)}
                    <Badge variant="outline" className="uppercase">
                      {selectedFile.fileType}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Action
                  </Label>
                  <div className="flex items-center space-x-2">
                    {getActionIcon(selectedFile.action)}
                    <span className="capitalize">{selectedFile.action}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Category
                  </Label>
                  <Badge variant={getCategoryColor(selectedFile.category)}>
                    {selectedFile.category.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    File Size
                  </Label>
                  <p>{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Description
                </Label>
                <p className="bg-muted/50 p-3 rounded-lg">
                  {selectedFile.description}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Date & Time
                </Label>
                <p>{formatDate(selectedFile.date)}</p>
              </div>

              {selectedFile.downloadCount && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Download Count
                  </Label>
                  <p>{selectedFile.downloadCount} times</p>
                </div>
              )}

              {selectedFile.uploadedBy && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Uploaded By
                  </Label>
                  <p>{selectedFile.uploadedBy}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <IconDownload className="h-4 w-4 mr-2" />
                  Download File
                </Button>
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
