"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconBuildingBank,
  IconCash,
  IconDeviceMobile,
  IconInfoCircle,
  IconLoader,
  IconArrowLeft,
  IconCheck,
} from "@tabler/icons-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function NewCollectionContent() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("mobile_money");
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionSuccess, setCollectionSuccess] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    phoneNumber: "",
    provider: "",
    accountNumber: "",
    bankName: "",
    amount: "",
    reference: "",
    description: "",
  });

  const calculateFee = (amount: number) => {
    const feeRate = 0.005; // 0.5%
    const minFee = 1.0;
    return Math.max(amount * feeRate, minFee);
  };

  const fee = formData.amount
    ? calculateFee(Number.parseFloat(formData.amount))
    : 0;
  const totalAmount = formData.amount
    ? Number.parseFloat(formData.amount) + fee
    : 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCollecting(true);

    // Simulate API call
    setTimeout(() => {
      setIsCollecting(false);
      setCollectionSuccess(true);

      // Redirect to collections page after 3 seconds
      setTimeout(() => {
        router.push("/collections");
      }, 3000);
    }, 3000);
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      phoneNumber: "",
      provider: "",
      accountNumber: "",
      bankName: "",
      amount: "",
      reference: "",
      description: "",
    });
    setSelectedMethod("mobile_money");
    setCollectionSuccess(false);
  };

  if (collectionSuccess) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/collections")}
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <IconCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Collection Request Sent!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your collection request has been successfully initiated.
                    {selectedMethod === "mobile_money"
                      ? " The customer will receive a prompt on their phone to approve the payment."
                      : " The payment will be processed from the customer's bank account."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button onClick={resetForm} className="w-full">
                    Create Another Collection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/collections")}
                    className="w-full"
                  >
                    View All Collections
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/collections")}
        >
          <IconArrowLeft className="h-4 w-4 mr-2" />
          Back to Collections
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          New Collection Request
        </h1>
        <p className="text-muted-foreground">
          Create a new payment collection request from a customer
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Collection Details</CardTitle>
              <CardDescription>
                Enter the customer and payment information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      <RadioGroupItem
                        value="bank_transfer"
                        id="bank_transfer"
                      />
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

                <Separator />

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        placeholder="Enter customer name"
                        value={formData.customerName}
                        onChange={(e) =>
                          handleInputChange("customerName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Customer Email</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        placeholder="customer@example.com"
                        value={formData.customerEmail}
                        onChange={(e) =>
                          handleInputChange("customerEmail", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Payment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (GHS) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) =>
                          handleInputChange("amount", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        placeholder="Optional reference"
                        value={formData.reference}
                        onChange={(e) =>
                          handleInputChange("reference", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Method-specific fields */}
                {selectedMethod === "mobile_money" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Mobile Money Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number *</Label>
                        <Input
                          id="phoneNumber"
                          placeholder="+233 XX XXX XXXX"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            handleInputChange("phoneNumber", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="provider">Network Provider *</Label>
                        <Select
                          value={formData.provider}
                          onValueChange={(value) =>
                            handleInputChange("provider", value)
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mtn">MTN</SelectItem>
                            <SelectItem value="vodafone">Vodafone</SelectItem>
                            <SelectItem value="airteltigo">
                              AirtelTigo
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Alert>
                      <IconInfoCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Mobile Money Process:</strong> The customer will
                        receive a prompt on their phone to approve this payment
                        request. They'll need to enter their PIN to complete the
                        transaction.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {selectedMethod === "bank_transfer" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Bank Account Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number *</Label>
                        <Input
                          id="accountNumber"
                          placeholder="Enter account number"
                          value={formData.accountNumber}
                          onChange={(e) =>
                            handleInputChange("accountNumber", e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Select
                          value={formData.bankName}
                          onValueChange={(value) =>
                            handleInputChange("bankName", value)
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bank" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="first_bank">
                              First Bank
                            </SelectItem>
                            <SelectItem value="gcb">GCB Bank</SelectItem>
                            <SelectItem value="ecobank">Ecobank</SelectItem>
                            <SelectItem value="absa">Absa Bank</SelectItem>
                            <SelectItem value="standard_chartered">
                              Standard Chartered
                            </SelectItem>
                            <SelectItem value="cal_bank">CAL Bank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Alert>
                      <IconInfoCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Bank Transfer Process:</strong> The payment will
                        be directly debited from the customer's bank account.
                        Processing may take 1-3 business days.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                <Separator />

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Payment description (optional)"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isCollecting}
                >
                  {isCollecting ? (
                    <>
                      <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                      Processing Collection Request...
                    </>
                  ) : (
                    <>
                      <IconCash className="mr-2 h-4 w-4" />
                      Send Collection Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Collection Summary</CardTitle>
              <CardDescription>Review your collection request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">
                    {formData.customerName || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium capitalize flex items-center gap-1">
                    {selectedMethod === "mobile_money" ? (
                      <IconDeviceMobile className="h-3 w-3" />
                    ) : (
                      <IconBuildingBank className="h-3 w-3" />
                    )}
                    {selectedMethod.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    GHS {formData.amount || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Collection Fee:</span>
                  <span className="font-medium">GHS {fee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Net Amount:</span>
                  <span className="text-green-600">
                    GHS {(totalAmount - fee).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  * Amount you'll receive after fees
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Collection Fee:</span>
                <span className="font-medium">0.5%</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Fee:</span>
                <span className="font-medium">GHS 1.00</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum Fee:</span>
                <span className="font-medium">No limit</span>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Fees are automatically deducted from the collected amount
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• SSL encrypted transactions</p>
              <p>• PCI DSS compliant processing</p>
              <p>• Real-time fraud monitoring</p>
              <p>• Customer data protection</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
