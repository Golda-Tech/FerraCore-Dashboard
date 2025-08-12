"use client";

import type React from "react";

import { useState } from "react";
import {
  IconCreditCard,
  IconLoader,
  IconPhone,
  IconWallet,
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

export default function SinglePaymentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientType: "mobile-money",
    recipient: "",
    network: "",
    amount: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert("Payment initiated successfully!");
  };

  const calculateFees = (amount: number) => {
    return Math.round(amount * 0.005 * 100) / 100; // 0.5% fee
  };

  const amount = Number.parseFloat(formData.amount) || 0;
  const fees = calculateFees(amount);
  const total = amount + fees;

  const mobileNetworks = ["MTN Ghana", "Vodafone", "AirtelTigo"];
  const banks = [
    "GCB Bank",
    "Ecobank Ghana",
    "Standard Chartered",
    "Absa Bank",
    "Fidelity Bank",
    "CAL Bank",
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Single Payment</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Enter the recipient details and amount for payout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <Label>Payment Type</Label>
                <RadioGroup
                  value={formData.recipientType}
                  onValueChange={(value: any) =>
                    setFormData({
                      ...formData,
                      recipientType: value,
                      network: "",
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile-money" id="mobile-money" />
                    <Label htmlFor="mobile-money">Mobile Money</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank-account" id="bank-account" />
                    <Label htmlFor="bank-account">Bank Account</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient">
                  {formData.recipientType === "mobile-money"
                    ? "Mobile Number"
                    : "Account Number"}
                </Label>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="recipient"
                    placeholder={
                      formData.recipientType === "mobile-money"
                        ? "0244123456"
                        : "1234567890123456"
                    }
                    value={formData.recipient}
                    onChange={(e) =>
                      setFormData({ ...formData, recipient: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="network">
                  {formData.recipientType === "mobile-money"
                    ? "Mobile Network"
                    : "Bank"}
                </Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) =>
                    setFormData({ ...formData, network: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        formData.recipientType === "mobile-money"
                          ? "Select network"
                          : "Select bank"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.recipientType === "mobile-money"
                      ? mobileNetworks
                      : banks
                    ).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₵)</Label>
                <div className="relative">
                  <IconWallet className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="500.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Payment description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Initiate Payment"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>Review your payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Type:</span>
                <span className="capitalize">
                  {formData.recipientType.replace("-", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-mono">
                  {formData.recipient || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {formData.recipientType === "mobile-money"
                    ? "Network:"
                    : "Bank:"}
                </span>
                <span>{formData.network || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-medium">₵{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing Fee:</span>
                <span>₵{fees.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>₵{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <h4 className="font-medium mb-2">Important Notes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Payment requires approval before processing</li>
                <li>• Processing fee is 0.5% of the amount</li>
                <li>• Funds will be debited after approval</li>
                <li>
                  •{" "}
                  {formData.recipientType === "mobile-money"
                    ? "Mobile money"
                    : "Bank"}{" "}
                  transfers typically process within 5 minutes
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
