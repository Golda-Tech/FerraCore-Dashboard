"use client";

import type React from "react";

import { useState } from "react";
import {
  IconCloudUpload,
  IconDownload,
  IconFileSpreadsheet,
  IconLoader,
  IconX,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const sampleData = [
  {
    recipient: "0244123456",
    recipientType: "Mobile Money",
    network: "MTN Ghana",
    amount: 500,
    status: "Valid",
    name: "John Doe",
  },
  {
    recipient: "0201234567",
    recipientType: "Mobile Money",
    network: "Vodafone",
    amount: 750,
    status: "Valid",
    name: "Jane Smith",
  },
  {
    recipient: "1234567890123456",
    recipientType: "Bank Account",
    network: "GCB Bank",
    amount: 250,
    status: "Invalid",
    name: "Unknown",
  },
  {
    recipient: "0267890123",
    recipientType: "Mobile Money",
    network: "AirtelTigo",
    amount: 1000,
    status: "Valid",
    name: "Bob Johnson",
  },
  {
    recipient: "9876543210987654",
    recipientType: "Bank Account",
    network: "Ecobank Ghana",
    amount: 300,
    status: "Valid",
    name: "Alice Brown",
  },
];

export default function BulkUploadPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<
    typeof sampleData | null
  >(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setValidationResults(null);
    }
  };

  const downloadTemplate = () => {
    // Create CSV content for the template
    const csvContent = `Recipient,Recipient Type,Network/Bank,Amount,Description
0244123456,Mobile Money,MTN Ghana,500.00,Sample mobile money payment
1234567890123456,Bank Account,GCB Bank,750.00,Sample bank transfer
0201234567,Mobile Money,Vodafone,300.00,Another mobile money payment`;

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "bulk_payment_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate file processing
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Simulate validation results
    setValidationResults(sampleData);
    setIsProcessing(false);
  };

  const validRecords =
    validationResults?.filter((record) => record.status === "Valid") || [];
  const invalidRecords =
    validationResults?.filter((record) => record.status === "Invalid") || [];
  const totalAmount = validRecords.reduce(
    (sum, record) => sum + record.amount,
    0
  );
  const totalFees = Math.round(totalAmount * 0.005 * 100) / 100;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">
          Bulk Upload Payout
        </h1>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-transparent"
          onClick={downloadTemplate}
        >
          <IconDownload className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCloudUpload className="h-5 w-5" />
              Upload Excel/CSV File
            </CardTitle>
            <CardDescription>
              Upload a file containing recipient details, payment types,
              networks/banks, and amounts for bulk payout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <IconFileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drop your file here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports .xlsx, .xls, .csv files up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                </div>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconFileSpreadsheet className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {uploadedFile.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({(uploadedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setValidationResults(null);
                    }}
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {uploadedFile && !validationResults && (
                <Button
                  onClick={processFile}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      Processing File...
                    </>
                  ) : (
                    "Process & Validate"
                  )}
                </Button>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {validationResults && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>Total Records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {validationResults.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>Valid Records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {validRecords.length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>Invalid Records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {invalidRecords.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Validation Results</CardTitle>
                <CardDescription>
                  Review the validation results before proceeding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Network/Bank</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResults.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">
                            {record.recipient}
                          </TableCell>
                          <TableCell>{record.recipientType}</TableCell>
                          <TableCell>{record.network}</TableCell>
                          <TableCell>₵{record.amount.toFixed(2)}</TableCell>
                          <TableCell>{record.name}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === "Valid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {record.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        Total Amount:
                      </span>
                      <span className="ml-2 font-medium">
                        ₵{totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Processing Fees:
                      </span>
                      <span className="ml-2 font-medium">
                        ₵{totalFees.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Grand Total:
                      </span>
                      <span className="ml-2 font-medium">
                        ₵{(totalAmount + totalFees).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Valid Records:
                      </span>
                      <span className="ml-2 font-medium">
                        {validRecords.length}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1">Submit for Approval</Button>
                  <Button variant="outline">Save as Draft</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
