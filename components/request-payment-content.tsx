"use client"

import type React from "react"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Smartphone, CreditCard, AlertCircle, CheckCircle, Loader,ArrowRight, UserCheck, ClockIcon, User,Check, ShieldCheck, RefreshCw, XCircle } from "lucide-react"
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
import { LoginResponse } from "@/types/auth";
import { cn } from "@/lib/utils"
import { getUser } from "@/lib/auth";
import { getCommissionFees } from "@/lib/payment";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp"
import { v4 as uuid } from "uuid";


export function RequestPaymentContent() {
  const router = useRouter()
  const [lastTransaction, setLastTransaction] = useState<{ provider?: string; transactionRef?: string } | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [refreshedStatus, setRefreshedStatus] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState("mobile_money")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPending, setIsPending] = useState(true);   // true until you hear "success"
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
const [fees, setFees] = useState<{
  percentage: number;
  fixed?: number; // Make optional
  cappedAmount: number;
} | null>(null)
   const [showReference, setReference] = useState("")
  const [showOtpDialog, setShowOtpDialog] = useState(false)
  const [otp, setOtp] = useState("")
  const [isOtpSending, setIsOtpSending] = useState(false)
  const [isOtpVerifying, setIsOtpVerifying] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)
  const [organizationName, setOrganizationName] = useState<string>("");

  // Debounce timer ref
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Ref for auto-focus
  const phoneInputRef = useRef<HTMLInputElement>(null);


  const [user, setUser] = useState<LoginResponse | null>(null);
    useEffect(() => {
        const stored = getUser();
        console.log("Stored user:", stored);
        setUser(stored);
         if (stored?.organizationName) {
              setOrganizationName(stored.organizationName);
            }
      }, []);

   // Auto-focus phone input on mount
   useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

   // Fetch commission fees when organizationName is available
      useEffect(() => {
        async function fetchFees() {
          if (!organizationName) {
            console.log("No organization name available yet");
            return;
          }

          try {
            console.log("Fetching commission fees for partner:", organizationName);
            const data = await getCommissionFees(organizationName);

            // Use exact values from API without rounding
            // If API returns "1.10", we keep it as 1.10 (not 1.1)
            const exactPercentage = parseFloat(data.transactionFee);
            const exactCappedAmount = parseFloat(data.cappedAmount);

            console.log("Fetched fees (exact):", {
              percentage: exactPercentage,
              cappedAmount: exactCappedAmount
            });

            setFees({
              percentage: exactPercentage,
              cappedAmount: exactCappedAmount
            });
          } catch (err) {
            console.error("Failed to fetch fees:", err);
            // Fallback to default fees if API fails
            setFees({ percentage: 1.75, cappedAmount: 30.00 });
          }
        }

        fetchFees();
      }, [organizationName]);



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
    network: "mtn", // Default to MTN
    };
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const refId = uuid();

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

  // Auto-fetch name when phone number changes (debounced)
  const fetchNameAutomatically = useCallback(async (phoneNumber: string) => {
    // Expect 9 digits (without the leading 0)
    if (!phoneNumber || phoneNumber.length < 9) {
      setFormData(prev => ({ ...prev, customerName: "" }));
      return;
    }

    setIsFetchingName(true);
    setFetchError(null);

    try {
      // Concatenate 233 + 9-digit number (e.g., 23324XXXXXXX)
      const fullNumber = `233${phoneNumber}`;
      const data: UserInfo = await getUserInfo(fullNumber);
      setFormData(prev => ({ ...prev, customerName: data.accountName }));

      // Optionally request OTP after successful name fetch
      // requestOtpCode(fullNumber);
    } catch (err: any) {
      setFormData(prev => ({ ...prev, customerName: "" }));
      setFetchError("Unable to fetch customer name");
    } finally {
      setIsFetchingName(false);
    }
  }, []);

  const handlePhoneNumberChange = (value: string) => {
    // Allow only digits, max 9 characters (without the 0 prefix)
    const digitsOnly = value.replace(/\D/g, "").slice(0, 9);
    handleInputChange("phoneNumber", digitsOnly);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for auto-fetch (800ms delay after user stops typing)
    if (digitsOnly.length === 9) {
      const timer = setTimeout(() => {
        fetchNameAutomatically(digitsOnly);
      }, 800);
      setDebounceTimer(timer);
    } else {
      setFormData(prev => ({ ...prev, customerName: "" }));
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Concatenate 233 + 9-digit number for API
      const fullMobileNumber = `233${formData.phoneNumber}`;

      // Prepare payment request payload
      const paymentRequest = {
        provider: formData.network.toUpperCase(),      // e.g., "MTN"
        collectionRef: formData.reference || `INV-${Date.now()}`,
        mobileNumber: fullMobileNumber,
        initiatedBy: user?.email ?? "", // or throw / return early if missing
        initiationPartnerId: user?.organizationId ?? "", //
        amount: Number(formData.amount),
        currency: "GHS",
        partyIdType: "MSISDN",
        payerMessage: formData.description,
        payeeNote: "Thank you for your payment",
      };

      // Call the payment API
      const paymentResponse = await createPayment(paymentRequest, {
        "X-Callback-Url": "https://ferracore.tech/api/v1/payments/mtn/callback ",
        "X-Reference-Id": refId,
        "X-Target-Environment": "poc"
      });
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
        /*  RFC 7807 (Problem Details) shape  */
                            const problem = err.response?.data;
                            console.log("Error response data:", err.response?.data.message);

                            // 1.  Prefer RFC 7807 fields
                            const userMsg =
                            err.response?.data.message ||                 // some APIs put the message here
                              problem?.detail ||                       // "Invalid temporary password."
                              problem?.errors?.amount ||                       // "Invalid temporary password."
                              problem?.title ||                        // "Internal Server Error"
                              problem?.message ||                      // fallback
                              err.response?.statusText ||              // "Internal Server Error"
                              err.message ||                           // final fallback
                              "An unexpected error occurred";

                            console.error("Payment error:", {
                              status: err.response?.status,
                              type: problem?.type,
                              title: problem?.title,
                              detail: problem?.detail,
                              instance: problem?.instance,
                              timestamp: problem?.timestamp,
                            });

      console.error("Payment failed:", problem?.detail || err.message);
      setIsPending(true);
      setErrorMessage(userMsg|| "An unexpected error occurred");
      setShowError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate fee dynamically based on fetched fees
    const calculateFee = (amount: number): number => {
      if (!fees) return 0;

      // Calculate percentage fee
      const percentageFee = amount * (fees.percentage / 100);

      // Apply cap if applicable
      if (fees.cappedAmount > 0 && percentageFee > fees.cappedAmount) {
        return fees.cappedAmount;
      }

  console.log(`Calculated fee for amount GHS ${amount}: GHS ${percentageFee} (Percentage: ${fees.percentage}%, Cap: GHS ${fees.cappedAmount})`);

      return percentageFee;
    };

  const amount = Number.parseFloat(formData.amount) || 0
  const fee = calculateFee(amount);
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


  const requestOtpCode = async (fullNumber: string) => {
    setIsOtpSending(true);
    try {
      await sendOtp(fullNumber, "SMS", "PAYMENT");
      setShowOtpDialog(false); // remember to flip this to true when SMS services are restored!
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
                     disabled={true} // Lock the select to prevent changes
                   >
                     <SelectTrigger className="h-10 sm:h-9">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="+233">🇬🇭 Ghana (+233)</SelectItem>
                       <SelectItem value="+234" disabled className="opacity-50 cursor-not-allowed">🇳🇬 Nigeria (+234)</SelectItem>
                       <SelectItem value="+254" disabled className="opacity-50 cursor-not-allowed">🇰🇪 Kenya (+254)</SelectItem>
                       <SelectItem value="+256" disabled className="opacity-50 cursor-not-allowed">🇺🇬 Uganda (+256)</SelectItem>
                       <SelectItem value="+255" disabled className="opacity-50 cursor-not-allowed">🇹🇿 Tanzania (+255)</SelectItem>
                     </SelectContent>
                   </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-2 relative">
                    <Label htmlFor="phoneNumber" className="text-sm">Mobile Number *</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="flex items-center">
                          <span className="absolute left-3 text-gray-500 text-sm font-medium select-none">233</span>
                          <Input
                            ref={phoneInputRef}
                            id="phoneNumber"
                            type="text"
                            inputMode="numeric"
                            placeholder="24XXXXXXX"
                            value={formData.phoneNumber}
                            onChange={(e) => handlePhoneNumberChange(e.target.value)}
                            maxLength={9}
                            required
                            className="h-10 sm:h-9 pl-12 pr-10"
                          />
                        </div>
                        {isFetchingName && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader className="h-4 w-4 animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Enter 9 digits (e.g., 24XXXXXXX).</p>
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
                      placeholder={isFetchingName ? "Fetching name..." : "Customer name will appear here"}
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
                     type="text"
                     inputMode="decimal"
                     pattern="[0-9]*\.?[0-9]*"
                     placeholder="0.00"
                     className="h-10 sm:h-9"
                     value={formData.amount}
                     onChange={(e) => {
                       const value = e.target.value.replace(/[^0-9.]/g, '');
                       const parts = value.split('.');
                       // Keep first part as is, keep everything after first decimal point
                       const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
                       handleInputChange("amount", sanitized);
                     }}
                     required
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
                      <li>Request expires after 5 minutes if not paid</li>
                    </ul>
                  </div>
                </div>
              </div>
            {/* Payment Summary - Updated with dynamic fees */}
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
                                      <span>Service Fee ({fees ? `${fees.percentage}%` : '...'}):</span>
                                      <span className="font-medium">GHS {fee.toFixed(2)}</span>
                                    </div>
                                    {fees && fee >= fees.cappedAmount && (
                                      <div className="text-xs text-amber-600 dark:text-amber-400">
                                        * Fee capped at GHS {fees.cappedAmount.toFixed(2)}
                                      </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between text-sm text-muted-foreground dark:text-gray-400">
                                       <span>Customer Pays:</span>
                                       <span>GHS {(amount + fee).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-medium text-green-600 dark:text-green-400">
                                      <span>You Receive:</span>
                                      <span>GHS {(amount - fee).toFixed(2)}</span>
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
         onPointerDownOutside={(e) => e.preventDefault()}
         onEscapeKeyDown={(e) => e.preventDefault()}
       >
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
             {/* dynamic icon + colour */}
             <div
               className={cn(
                 "h-8 w-8 rounded-full flex items-center justify-center",
                 refreshedStatus === "FAILED"   ? "bg-red-100" :
                 refreshedStatus === "PENDING"  ? "bg-amber-100"
                                              : "bg-green-100"
               )}
             >
               {refreshedStatus === "FAILED"   ? <XCircle   className="h-4 w-4 text-red-600" /> :
                refreshedStatus === "PENDING"  ? <ClockIcon className="h-4 w-4 text-amber-600" />
                                              : <CheckCircle className="h-4 w-4 text-green-600" />}
             </div>

             {refreshedStatus === "FAILED"   ? "Payment Failed" :
              refreshedStatus === "PENDING"  ? "Payment Pending"
                                            : "Payment Request Sent"}
           </DialogTitle>

           <DialogDescription className="text-sm">
             {refreshedStatus === "FAILED"   ? "The payment could not be completed." :
              refreshedStatus === "PENDING"  ? "Awaiting final confirmation."
                                            : "Your payment request has been successfully sent to customer."}
           </DialogDescription>
         </DialogHeader>

         {/* dynamic background */}
         <div
           className={cn(
             "border rounded-lg p-3 sm:p-4",
             refreshedStatus === "FAILED"   ? "bg-red-50   border-red-200 dark:bg-red-900   dark:border-red-700" :
             refreshedStatus === "PENDING"  ? "bg-amber-50 border-amber-200 dark:bg-amber-900 dark:border-amber-700"
                                            : "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700"
           )}
         >
           <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
             <div className="flex justify-between"><span>Customer:</span><span className="font-medium">{formData.customerName}</span></div>
             <div className="flex justify-between"><span>Phone:</span><span className="font-medium">233 {formData.phoneNumber}</span></div>
             <div className="flex justify-between"><span>Amount:</span><span className="font-medium">GHS {amount.toFixed(2)}</span></div>
             <div className="flex justify-between"><span>Network:</span><span className="font-medium uppercase">{formData.network}</span></div>
             <div className="flex justify-between items-center"><span>Reference:</span><span className="font-mono text-xs tracking-tight">{showReference}</span></div>

             {refreshedStatus && (
               <div className="flex justify-between">
                 <span>Current Status:</span>
                 <span className="font-medium">{refreshedStatus}</span>
               </div>
             )}
           </div>
         </div>

         {/* buttons unchanged */}
         <div className="flex flex-col sm:flex-row gap-3">
           <Button
             variant="outline"
             className="flex-1 bg-transparent order-2 sm:order-1"
             onClick={refreshTransactionStatus}
             disabled={statusLoading}
           >
             {statusLoading
               ? <Loader className="mr-2 h-4 w-4 animate-spin" />
               : <RefreshCw className="mr-2 h-4 w-4" />}
             Check Status
           </Button>
           <Button className="flex-1 order-1 sm:order-2" onClick={() => { setShowSuccess(false); router.push("/payments"); }}>
             View Payments
           </Button>
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
              <div className="flex items-start gap-2 text-sm">
                {/* label stays on one line */}
                <span className="shrink-0 font-semibold text-red-700">Error Message:</span>

                {/* message wraps naturally */}
                <span className="break-words text-red-900">{errorMessage}</span>
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
                    network: "mtn", // Reset to MTN default
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
              We've sent a one-time password to 233{formData.phoneNumber}. Please enter it below.
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
                  const fullNumber = `233${formData.phoneNumber}`
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