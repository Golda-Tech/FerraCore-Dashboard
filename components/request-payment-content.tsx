"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Smartphone, CreditCard, AlertCircle, CheckCircle, Loader, User,ShieldCheck, XCircle } from "lucide-react"
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
import { getUserInfo, createPayment, sendOtp, verifyOtp, getTransactionStatus } from "@/lib/payment"
import { UserInfo } from "@/types/payment"
import { send } from "process"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp"


export function RequestPaymentContent() {
  const router = useRouter()
  const [lastTransaction, setLastTransaction] = useState<{ provider?: string; transactionRef?: string } | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [refreshedStatus, setRefreshedStatus] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState("mobile_money")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPending, setIsPending] = useState(true);   // true until you hear “success”
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showReference, setReference] = useState("")
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otp, setOtp] = useState("")
  const [isOtpSending, setIsOtpSending] = useState(false)
  const [isOtpVerifying, setIsOtpVerifying] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)


  const [formData, setFormData] = useState(()=>{
      const today = new Date().toISOString().split("T")[0];
return{
    customerName: "",
    customerEmail: "",
    phoneNumber: "",
    countryCode: "+233",
    amount: "",
    reference: "",
    description: "",
    dueDate: today,
    network: "",
    };
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

 const telcos = [
   {
     name: 'MTN',
     image: '/mtn-momo.png', // Your MTN logo path
     alt: 'MTN Mobile Money'
   },
   {
     name: 'Telecel Cash',
     image: '/telecel-cash.webp', // Your Telecel logo path
     alt: 'Telecel Cash'
   },
   {
     name: 'AirtelTigo',
     image: '/airtel-tigo.png', // Your AirtelTigo logo path
     alt: 'AirtelTigo'
   },
   {
     name: 'G-Money',
     image: '/gmoney.jpg', // Your G-Money logo path
     alt: 'G-Money'
   }
 ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const fullMobileNumber = `${formData.countryCode.replace("+", "")}${formData.phoneNumber}`;

      // Prepare payment request payload
      const paymentRequest = {
        provider: formData.network.toUpperCase(),      // e.g., "MTN"
        collectionRef: formData.reference || `INV-${Date.now()}`,
        mobileNumber: fullMobileNumber,
        amount: Number(formData.amount),
        currency: "GHS",                               // or "EUR" if applicable
        partyIdType: "MSISDN",
        payerMessage: formData.description,
        payeeNote: "Thank you for your payment",
      };

      // Call the payment API
      const paymentResponse = await createPayment(paymentRequest);
      setIsPending(false);                              // <-- success

      // Optionally store or show the transactionRef
      console.log("Payment response:", paymentResponse);


     // Save minimal info to allow status refresh later
    const provider = paymentRequest.provider
    const transactionRef =
       paymentResponse.transactionRef ||
       paymentRequest.collectionRef
     setLastTransaction({ provider, transactionRef })
     setRefreshedStatus(null)
     setReference(transactionRef);



      setShowSuccess(true);
    } catch (err: any) {
      console.error("Payment failed:", err);
      setIsPending(true);
      setErrorMessage(err?.response?.data?.message || err.message || "An unexpected error occurred");
      setShowError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const amount = Number.parseFloat(formData.amount) || 0
  const fee = amount * 0.015 // 1.5% fee
  const totalAmount = amount + fee

  const [isFetchingName, setIsFetchingName] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);


 const refreshTransactionStatus = async () => {
    if (!lastTransaction?.provider || !lastTransaction?.transactionRef) return
    setStatusLoading(true)
    try {
      const statusData = await getTransactionStatus(
        lastTransaction.provider,
        lastTransaction.transactionRef
      )
      // try to show a readable status
      const status = statusData?.status || "Unknown"
      setRefreshedStatus(status)
    } catch (err) {
      console.error("Failed to refresh transaction status:", err)
      setRefreshedStatus("Unable to fetch status")
    } finally {
      setStatusLoading(false)
    }
  }

  const handleFetchName = async () => {
    if (!formData.phoneNumber) return;
    setIsFetchingName(true);
    setFetchError(null);

    try {
      // Concatenate country code and phone number **without the '+'**
      const fullNumber = `${formData.countryCode.replace("+", "")}${formData.phoneNumber}`;
      const data: UserInfo = await getUserInfo(fullNumber); 
      setFormData(prev => ({ ...prev, customerName: data.accountName }));

      //Request OTP
      requestOtpCode(fullNumber);
    } catch (err: any) {
      setFetchError("Unable to fetch customer name");
    } finally {
      setIsFetchingName(false);
    }
  };


  const requestOtpCode = async (fullNumber: string) => {
    setIsOtpSending(true);
    try {
      await sendOtp(fullNumber, "SMS", "PAYMENT");
      setShowOtpDialog(true);
    } catch (err) {
      // ✅ only OTP failure here
      setFetchError("Could not send OTP. Please try again.");
    } finally {
      setIsOtpSending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className = "rounded-full hover:bg-gray-100 dark:hover:bg-gray-600">
          <ArrowLeft className="h-5 w-5" />
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


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-1 space-y-2">
                                    <Label className="text-sm">Select Network *</Label>
                                      <RadioGroup
                                        value={formData.network}
                                        onValueChange={(v) => handleInputChange("network", v)}
                                        className="grid grid-cols-4 gap-4"      /* 4 columns on desktop */
                                      >
                                        {telcos.map((t) => (
                                          <div key={t.name}>
                                            <RadioGroupItem value={t.name.toLowerCase().replace(/\s+/g, "")} id={t.name} className="peer sr-only" />
                                            <Label
                                              htmlFor={t.name}
                                              className=" flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer
                                                           /* default text colour – always visible */
                                                           text-gray-900 dark:text-white
                                                           /* hover state */
                                                           hover:bg-gray-50 dark:hover:bg-gray-800
                                                           /* checked (selected) state */
                                                           peer-data-[state=checked]:border-blue-600
                                                           peer-data-[state=checked]:bg-blue-50
                                                           dark:peer-data-[state=checked]:bg-blue-950     /* keep blue tint in dark */
                                                           /* keep text contrasting when checked */
                                                           peer-data-[state=checked]:text-gray-900
                                                           dark:peer-data-[state=checked]:text-white
                                                           transition-colors"
                                            >
                                              <img src={t.image} alt={t.alt} className="h-12 w-12 object-contain " />
                                              <span className="text-xs text-center">{t.name}</span>
                                            </Label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                      </div>
                </div>
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
                  <div className="sm:col-span-2 space-y-2 relative">
                    <Label htmlFor="phoneNumber" className="text-sm">Mobile Number *</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="phoneNumber"
                        placeholder="24 XXX XXXX"
                        value={formData.phoneNumber}
                        onChange={(e) =>{
                            const digitsOnly = e.target.value.replace(/\D/g, "").slice(0,10);
                            handleInputChange("phoneNumber", digitsOnly)
                            }}
                         maxLength={10}
                        required
                        className="h-10 sm:h-9 flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleFetchName}
                        disabled={!formData.phoneNumber || isFetchingName}
                        size="sm"
                        className="h-10 w-10 p-0 flex items-center justify-center"
                      >
                        {isFetchingName ? <Loader className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                    {fetchError && <p className="text-xs text-red-600 mt-1">{fetchError}</p>}
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
                      placeholder="Customer name will appear here"
                      value={formData.customerName}
                      readOnly
                      required
                      className="h-10 sm:h-9 bg-gray-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-sm">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="c******@email.com"
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
                      readOnly
                      className="h-10 sm:h-9 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference" className="text-sm">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Invoice prefix or Business Initials (e.g. FCC)"
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
                    <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                        <span>Payment Amount:</span>
                        <span className="font-medium">GHS {amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                        <span>Service Fee (1.5%):</span>
                        <span className="font-medium">GHS {fee.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium text-green-600 dark:text-green-400">
                        <span>You Receive:</span>
                        <span>GHS {(amount - fee).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground dark:text-gray-400">
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
        <DialogContent
        className="max-w-md mx-4 sm:mx-auto"
        modal={true}          // disables outside-click close
        onPointerDownOutside={(e) => e.preventDefault()} // extra safety
        onEscapeKeyDown={(e) => e.preventDefault()} >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center
                                           ${isPending ? 'bg-amber-100' : 'bg-green-100'}`}>
                <CheckCircle className={`h-4 w-4 ${isPending ? 'text-amber-600' : 'text-green-600'}`} />
              </div>
              Payment Request Sent
            </DialogTitle>
            <DialogDescription className="text-sm">Your payment request has been successfully sent to customer.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3 sm:p-4">
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
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
                  <span className="font-medium uppercase">{formData.network}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reference:</span>
                  <span className="font-medium font-mono text-xs tracking-tight">{showReference}</span>
                </div>
                {refreshedStatus && (
                 <div className="flex justify-between">
                   <span>Current Status:</span>
                   <span className="font-medium">{refreshedStatus}</span>
                 </div>
               )}
              </div>
            </div>


            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent order-2 sm:order-1"
                onClick={async () => {
                  await refreshTransactionStatus()
                }}
              >
                {statusLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                Check Status
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

      {/* // Error dialog    */}
      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              Payment Request Failed
            </DialogTitle>
            <DialogDescription className="text-sm">There was an error sending your payment request. Please try again.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Error Message:</span>
                  <span className="font-medium">{errorMessage}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent order-2 sm:order-1"
                disabled
                onClick={() => {
                  setShowError(false)
                  // Reset form
                  setFormData({
                    customerName: "",
                    customerEmail: "",
                    phoneNumber: "",
                    countryCode: "+233",
                    amount: "",
                    reference: "",
                    description: "",
                      dueDate: new Date().toISOString().split("T")[0],
                    network: "",
                  })
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Check Status
              </Button>

              <Button
                className="flex-1 order-1 sm:order-2"
                disabled
                onClick={() => {
                  setShowError(false)
                  router.push("/payments")
                }}
              >
                View Payments
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* OTP Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
            <DialogDescription>
              We’ve sent a one-time password to {formData.phoneNumber}. Please enter it below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}   // ✅ this will update your state
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button
              disabled={otp.length < 6 || isOtpVerifying}
              onClick={async () => {
                setIsOtpVerifying(true)
                try {
                  const fullNumber = `${formData.countryCode.replace("+", "")}${formData.phoneNumber}`
                  await verifyOtp(fullNumber, "SMS", otp) // <-- your backend OTP API
                  setIsOtpVerified(true)
                  setShowOtpDialog(false)
                } catch (err) {
                  setFetchError("Invalid OTP, please try again.")
                  setShowOtpDialog(false)
                } finally {
                  setIsOtpVerifying(false)
                }
              }}
              className="w-full"
            >
              {isOtpVerifying ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>


             
  )
}