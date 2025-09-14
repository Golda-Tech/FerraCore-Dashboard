"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Smartphone, CreditCard, AlertCircle, CheckCircle, Loader } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function RequestPaymentContent() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState("mobile_money")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    phoneNumber: "",
    countryCode: "+233",
    amount: "",
    reference: "",
    description: "",
    dueDate: "",
    network: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      setShowSuccess(true)
    }, 3000)
  }

  const amount = Number.parseFloat(formData.amount) || 0
  const fee = amount * 0.015 // 1.5% fee
  const totalAmount = amount + fee

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Request Payment</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Send a payment request to your customer</p>
        </div>
      </div>

      <div className="w-full max-w-none lg:max-w-4xl xl:max-w-5xl mx-auto">
        <Card className="border-0 sm:border shadow-none sm:shadow-sm">
          <CardHeader className="px-3 sm:px-6 pb-4">
            <CardTitle className="text-lg sm:text-xl">Payment Request Details</CardTitle>
            <CardDescription className="text-sm">Fill in the details to send a payment request to your customer</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Phone Number - Prominent Position */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium flex items-center gap-2">
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                  Customer Mobile Number
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:col-span-1">
                    <Label htmlFor="countryCode" className="text-sm">Country</Label>
                    <Select
                      value={formData.countryCode}
                      onValueChange={(value) => handleInputChange("countryCode", value)}
                    >
                      <SelectTrigger className="h-10 sm:h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+233">🇬🇭 Ghana (+233)</SelectItem>
                        <SelectItem value="+234">🇳🇬 Nigeria (+234)</SelectItem>
                        <SelectItem value="+254">🇰🇪 Kenya (+254)</SelectItem>
                        <SelectItem value="+256">🇺🇬 Uganda (+256)</SelectItem>
                        <SelectItem value="+255">🇹🇿 Tanzania (+255)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm">Mobile Number *</Label>
                    <Input
                      id="phoneNumber"
                      placeholder="24 123 4567"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      required
                      className="h-10 sm:h-9"
                    />
                  </div>
                  <div className="sm:col-span-1 space-y-2">
                    <Label htmlFor="network" className="text-sm">Network *</Label>
                    <Select
                      value={formData.network}
                      onValueChange={(value) => handleInputChange("network", value)}
                      required
                    >
                      <SelectTrigger className="h-10 sm:h-9">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mtn">MTN</SelectItem>
                        <SelectItem value="vodafone">Vodafone</SelectItem>
                        <SelectItem value="airteltigo">AirtelTigo</SelectItem>
                        <SelectItem value="telecel">Telecel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label className="text-sm">Payment Method</Label>
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mobile_money" id="mobile_money" />
                    <Label htmlFor="mobile_money" className="flex items-center gap-2 text-sm">
                      <Smartphone className="h-4 w-4" />
                      Mobile Money
                    </Label>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                          <RadioGroupItem value="bank_transfer" id="bank_transfer" disabled />
                          <Label htmlFor="bank_transfer" className="flex items-center gap-2 cursor-not-allowed text-sm">
                            <CreditCard className="h-4 w-4" />
                            Bank Transfer
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Coming Soon</span>
                          </Label>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bank transfer payments will be available soon!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </RadioGroup>
              </div>

              <Separator />

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium">Customer Information</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm">Customer Name *</Label>
                    <Input
                      id="customerName"
                      placeholder="Enter customer name"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange("customerName", e.target.value)}
                      required
                      className="h-10 sm:h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-sm">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.customerEmail}
                      onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                      className="h-10 sm:h-9"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium">Payment Details</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm">Amount (GHS) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      required
                      className="h-10 sm:h-9"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-sm">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      className="h-10 sm:h-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-sm">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Invoice number or reference"
                    value={formData.reference}
                    onChange={(e) => handleInputChange("reference", e.target.value)}
                    className="h-10 sm:h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this payment for?"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="min-h-[80px] sm:min-h-[60px] resize-none"
                  />
                </div>
              </div>

              <Separator />

              {/* Mobile Money Process Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">How Mobile Money Payment Works:</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside text-xs sm:text-sm">
                      <li>Customer receives SMS with payment request</li>
                      <li>They dial the USSD code or use mobile app</li>
                      <li>Enter their mobile money PIN to authorize</li>
                      <li>You receive instant notification when paid</li>
                      <li>Request expires after 24 hours if not paid</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              {amount > 0 && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-medium">Payment Summary</h3>
                    <div className="bg-gray-50 border rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Payment Amount:</span>
                        <span className="font-medium">GHS {amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Service Fee (1.5%):</span>
                        <span className="font-medium">GHS {fee.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium text-green-600">
                        <span>You Receive:</span>
                        <span>GHS {(amount - fee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Customer Pays:</span>
                        <span>GHS {amount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="order-2 sm:order-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isProcessing ||
                    !formData.customerName ||
                    !formData.phoneNumber ||
                    !formData.amount ||
                    !formData.network
                  }
                  className="order-1 sm:order-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Sending Request...</span>
                      <span className="sm:hidden">Sending...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Send Payment Request</span>
                      <span className="sm:hidden">Send Request</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              Payment Request Sent
            </DialogTitle>
            <DialogDescription className="text-sm">Your payment request has been successfully sent to the customer.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-medium">{formData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-medium">
                    {formData.countryCode} {formData.phoneNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">GHS {amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="font-medium capitalize">{formData.network}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-medium font-mono">PAY-{Date.now().toString().slice(-6)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent order-2 sm:order-1"
                onClick={() => {
                  setShowSuccess(false)
                  // Reset form
                  setFormData({
                    customerName: "",
                    customerEmail: "",
                    phoneNumber: "",
                    countryCode: "+233",
                    amount: "",
                    reference: "",
                    description: "",
                    dueDate: "",
                    network: "",
                  })
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Send Another
              </Button>
              <Button
                className="flex-1 order-1 sm:order-2"
                onClick={() => {
                  setShowSuccess(false)
                  router.push("/payments")
                }}
              >
                View Payments
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}