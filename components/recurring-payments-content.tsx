"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader,
  AlertCircle,
  RefreshCw,
  User,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { getUserInfo, getCommissionFees } from "@/lib/payment";
import { detectNetworkProvider } from "@/lib/helpers";
import { useRouter } from "next/navigation";
import {
  createSubscription,
  authorizeOtp,
  resendOtp,
  getSubscriptionStatus,
} from "@/lib/recurring";
import type { UserInfo } from "@/types/payment";
import type { LoginResponse } from "@/types/auth";
import type {
  RecurringPaymentSubscriptionResponse,
  AuthorizeOtpResponse,
  RecurringPaymentStatusResponse,
} from "@/types/recurring";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const RETURN_URL = "https://ferracore.tech/api/v1/recurring-payments/callback";

const STEPS = [
  { label: "Customer & Mandate", icon: User },
  { label: "OTP Authorization", icon: ShieldCheck },
  { label: "Check Status", icon: RefreshCw },
] as const;

const CYCLES = [
  { value: "DLY", label: "Daily" },
  { value: "WKL", label: "Weekly" },
  { value: "MON", label: "Monthly" },
] as const;

const NETWORKS = [
  { value: "MTN", label: "MTN", image: "/mtn-momo.png" },
  { value: "VOD", label: "Telecel", image: "/telecel-cash.webp" },
  { value: "AIR", label: "AirtelTigo", image: "/airtel-tigo.png" },
] as const;

/* ------------------------------------------------------------------ */
/*  Stepper header                                                     */
/* ------------------------------------------------------------------ */
function StepperHeader({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={step.label}>
            {idx > 0 && (
              <div
                className={cn(
                  "h-0.5 w-10 sm:w-16 transition-colors",
                  done ? "bg-primary" : "bg-muted"
                )}
              />
            )}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-muted/40 text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <StepIcon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center max-w-[5rem] leading-tight",
                  active
                    ? "text-primary"
                    : done
                    ? "text-primary/80"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function RecurringPaymentsContent() {
  /* ---------- shared state ---------- */
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setUser(getUser());
  }, []);

  /* ---------- step 1 state ---------- */
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isFetchingName, setIsFetchingName] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<"" | "DLY" | "WKL" | "MON">("");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState("");
  const [networkProvider, setNetworkProvider] = useState<"MTN" | "VOD" | "AIR">(
    "MTN"
  );
  const [reference, setReference] = useState("");
  const [resumable, setResumable] = useState<"Y" | "N">("Y");
  const [cycleSkip, setCycleSkip] = useState<"Y" | "N">("N");
  const [isCreating, setIsCreating] = useState(false);

  const [subscriptionRes, setSubscriptionRes] =
    useState<RecurringPaymentSubscriptionResponse | null>(null);

  /* ---------- fee state ---------- */
  const [fees, setFees] = useState<{
    percentage: number;
    cappedAmount: number;
    recurringFee: number;
  } | null>(null);

  // Fetch commission fees when user is available
  useEffect(() => {
    async function fetchFees() {
      const orgName = user?.organizationName;
      if (!orgName) return;
      try {
        const data = await getCommissionFees(orgName);
        setFees({
          percentage: parseFloat(data.transactionFee),
          cappedAmount: parseFloat(data.cappedAmount),
          recurringFee: parseFloat(data.recurringFee || "0"),
        });
      } catch (err) {
        console.error("Failed to fetch fees:", err);
        setFees({ percentage: 1.75, cappedAmount: 30.0, recurringFee: 0 });
      }
    }
    fetchFees();
  }, [user?.organizationName]);

  // Calculate recurring fee dynamically (percentage-based, capped by cappedAmount)
  const parsedAmount = Number.parseFloat(amount) || 0;
  const calculateRecurringFee = (amt: number) => {
    if (!fees || amt <= 0) return { recurringFee: 0, isCapped: false };
    const rawRecurringFee = amt * (fees.recurringFee / 100);
    const isCapped = fees.cappedAmount > 0 && rawRecurringFee > fees.cappedAmount;
    return {
      recurringFee: isCapped ? fees.cappedAmount : rawRecurringFee,
      isCapped,
    };
  };
  const { recurringFee, isCapped } = calculateRecurringFee(parsedAmount);
  const totalCustomerPays = parsedAmount + recurringFee;

  /* ---------- step 2 state ---------- */
  const [otpValue, setOtpValue] = useState("");
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpRes, setOtpRes] = useState<AuthorizeOtpResponse | null>(null);

  /* ---------- step 3 state ---------- */
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusRes, setStatusRes] = useState<RecurringPaymentStatusResponse | null>(null);

  const router = useRouter();

  /* ---------- dialogs ---------- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");

  const showDialog = (
    type: "success" | "error",
    title: string,
    msg: string
  ) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogMessage(msg);
    setDialogOpen(true);
  };

  /* ================================================================ */
  /*  Step 1A — Name enquiry                                           */
  /* ================================================================ */
  const fetchCustomerName = useCallback(async (phone: string) => {
    if (!phone || phone.length < 9) {
      setCustomerName("");
      return;
    }
    setIsFetchingName(true);
    setFetchError(null);
    try {
      const full = `233${phone}`;
      const data: UserInfo = await getUserInfo(full);
      setCustomerName(data.accountName);
    } catch {
      setCustomerName("");
      setFetchError("Unable to fetch customer name");
    } finally {
      setIsFetchingName(false);
    }
  }, []);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    setPhoneNumber(digits);

    // Auto-detect network provider from MSISDN prefix
    const detected = detectNetworkProvider(digits);
    if (detected && detected !== "GMO") {
      setNetworkProvider(detected as "MTN" | "VOD" | "AIR");
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (digits.length === 9) {
      debounceRef.current = setTimeout(() => fetchCustomerName(digits), 800);
    } else {
      setCustomerName("");
      setFetchError(null);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /* ================================================================ */
  /*  Step 1B — Create mandate (subscription)                          */
  /* ================================================================ */
  const handleCreateMandate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount || !endDate || !reference) return;
    if (!cycle) {
      showDialog("error", "Validation Error", "Please select a payment cycle before continuing.");
      return;
    }
    setIsCreating(true);
    try {
      const res = await createSubscription({
        customerNumber: `233${phoneNumber}`,
        customerName,
        amount: Number(amount),
        cycle,
        startDate: startDate.includes("T") ? startDate : `${startDate} ${new Date().toTimeString().split(" ")[0]}`,
        endDate: endDate.includes("T") ? endDate : `${endDate} ${new Date().toTimeString().split(" ")[0]}`,
        networkProvider,
        reference,
        returnUrl: RETURN_URL,
        resumable,
        cycleSkip,
        createdBy: user?.email || "",
        partnerId: user?.organizationId || "",
      });
      setSubscriptionRes(res);
      showDialog("success", "Mandate Created", res.message || "OTP has been sent to the customer.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to create subscription";
      showDialog("error", "Error", msg);
    } finally {
      setIsCreating(false);
    }
  };

  const goToStep2 = () => {
    setDialogOpen(false);
    setStep(1);
  };

  /* ================================================================ */
  /*  Step 2 — OTP authorization                                       */
  /* ================================================================ */
  const handleAuthorizeOtp = async () => {
    if (!subscriptionRes || !otpValue) return;
    setIsAuthorizing(true);
    try {
      const res = await authorizeOtp({
        subscriptionId: subscriptionRes.subscriptionId,
        authCode: otpValue,
      });
      setOtpRes(res);
      showDialog("success", "OTP Verified", res.message || "Subscription authorized successfully.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "OTP verification failed";
      showDialog("error", "Verification Failed", msg);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleResendOtp = async () => {
    if (!subscriptionRes) return;
    setIsResending(true);
    try {
      const res = await resendOtp(subscriptionRes.subscriptionId);
      setSubscriptionRes(res);
      setOtpValue("");
      showDialog("success", "OTP Resent", res.message || "A new OTP has been sent to the customer.");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "Failed to resend OTP";
      showDialog("error", "Error", msg);
    } finally {
      setIsResending(false);
    }
  };

  const goToStep3 = () => {
    setDialogOpen(false);
    setStep(2);
  };

  /* ================================================================ */
  /*  Check subscription status                                        */
  /* ================================================================ */
  const handleCheckStatus = async () => {
    if (!subscriptionRes?.subscriptionId) return;
    setIsCheckingStatus(true);
    try {
      const res = await getSubscriptionStatus(subscriptionRes.subscriptionId);
      console.log("Subscription status response:", res);
      setStatusRes(res);
    } catch (err: any) {
      console.error("Failed to check status:", err);
      showDialog(
        "error",
        "Status Check Failed",
        err.response?.data?.message || err.message || "Could not fetch status"
      );
    } finally {
      setIsCheckingStatus(false);
    }
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <StepperHeader current={step} />

      {/* -------- STEP 1 -------- */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Customer Lookup &amp; Subscription
            </CardTitle>
            <CardDescription>
              Enter customer mobile number, verify their name, then set up the
              recurring payment mandate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMandate} className="space-y-6">
              {/* -- Phone -- */}
              <div className="space-y-2">
                <Label htmlFor="phone">Customer Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-medium">
                    +233
                  </div>
                  <div className="relative flex-1">
                    <Input
                      id="phone"
                      placeholder="24XXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      maxLength={9}
                      className="pr-10"
                    />
                    {isFetchingName && (
                      <Loader className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                {fetchError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {fetchError}
                  </p>
                )}
              </div>

              {/* -- Customer Name (read‑only) -- */}
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  value={customerName}
                  readOnly
                  placeholder="Auto‑populated after phone lookup"
                  className="bg-muted"
                />
              </div>

              {customerName && (
                <>
                  <Separator />

                  {/* -- Amount -- */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount <span className="text-xs text-muted-foreground">(GHS)</span>
                    </Label>
                    <Input
                        id="amount"
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*\.?[0-9]*"
                        placeholder="0.00"
                        className="h-10 sm:h-9"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                  </div>

                  {/* -- Payment Summary (fee breakdown) -- */}
                  {parsedAmount > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-base sm:text-lg font-medium">Payment Summary</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-3">
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                          <span>Payment Amount:</span>
                          <span className="font-medium">GHS {parsedAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                          <span>Recurring Fee ({fees ? `${fees.recurringFee}%` : '...'}):</span>
                          <span className="font-medium">GHS {recurringFee.toFixed(2)}</span>
                        </div>
                        {isCapped && fees && (
                          <div className="text-xs text-amber-600 dark:text-amber-400">
                            * Fee capped at GHS {fees.cappedAmount.toFixed(2)}
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-sm font-semibold text-gray-900 dark:text-gray-100">
                          <span>Customer Pays:</span>
                          <span>GHS {totalCustomerPays.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* -- Cycle -- */}
                  <div className="space-y-2">
                    <Label>Cycle <span className="text-destructive">*</span></Label>
                    <Select
                      value={cycle}
                      onValueChange={(v) =>
                        setCycle(v as "DLY" | "WKL" | "MON")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        {CYCLES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* -- Dates -- */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* -- Network -- */}
                  <div className="space-y-2">
                    <Label>Network Provider</Label>
                    <div className="flex gap-3">
                      {NETWORKS.map((n) => (
                        <button
                          key={n.value}
                          type="button"
                          onClick={() =>
                            setNetworkProvider(
                              n.value as "MTN" | "VOD" | "AIR"
                            )
                          }
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-colors cursor-pointer",
                            networkProvider === n.value
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/30"
                          )}
                        >
                          <img
                            src={n.image}
                            alt={n.label}
                            className="h-8 w-8 object-contain"
                          />
                          <span className="text-xs font-medium">
                            {n.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* -- Reference -- */}
                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      placeholder="Enter a unique reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      required
                    />
                  </div>

                  {/* -- Toggles (commented out) -- */}
                  {/*
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="resumable" className="text-sm">
                        Resumable
                      </Label>
                      <Switch
                        id="resumable"
                        checked={resumable === "Y"}
                        onCheckedChange={(v) =>
                          setResumable(v ? "Y" : "N")
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <Label htmlFor="cycleSkip" className="text-sm">
                        Cycle Skip
                      </Label>
                      <Switch
                        id="cycleSkip"
                        checked={cycleSkip === "Y"}
                        onCheckedChange={(v) =>
                          setCycleSkip(v ? "Y" : "N")
                        }
                      />
                    </div>
                  </div>
                  */}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCreating || !amount || !endDate || !reference || !cycle}
                  >
                    {isCreating ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Creating Mandate…
                      </>
                    ) : (
                      <>
                        Create Mandate
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {/* -------- STEP 2 -------- */}
      {step === 1 && subscriptionRes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">OTP Authorization</CardTitle>
            <CardDescription>
              An OTP has been sent to the customer. Enter it below to authorize
              the subscription.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Read‑only summary */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadOnlyField
                label="Subscription ID"
                value={subscriptionRes.subscriptionId}
              />
              <ReadOnlyField
                label="Customer Name"
                value={subscriptionRes.customerName}
              />
              <ReadOnlyField
                label="Customer Number"
                value={subscriptionRes.customerNumber}
              />
              <ReadOnlyField
                label="Cycle"
                value={
                  CYCLES.find((c) => c.value === subscriptionRes.cycle)
                    ?.label ?? subscriptionRes.cycle
                }
              />
            </div>

            <Separator />

            {/* OTP input */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Enter OTP</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={5}
                  value={otpValue}
                  onChange={setOtpValue}
                >
                  <InputOTPGroup className="gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="h-14 w-14 text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-md first:rounded-l-md last:rounded-r-md shadow-sm"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Enter the 5-digit OTP sent to the customer
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                disabled={isAuthorizing || otpValue.length < 5}
                onClick={handleAuthorizeOtp}
              >
                {isAuthorizing ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                disabled={isResending}
                onClick={handleResendOtp}
              >
                {isResending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* -------- STEP 3 -------- */}
      {step === 2 && subscriptionRes && (
        <div className={cn("grid gap-6 items-stretch", statusRes ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-3xl mx-auto")}>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">Check Status</CardTitle>
              <CardDescription>
                Retrieve the current subscription status and transaction details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex flex-col flex-1">
              <div className="grid gap-4 sm:grid-cols-2">
                <ReadOnlyField
                  label="Subscription ID"
                  value={subscriptionRes.subscriptionId}
                />
                <ReadOnlyField
                  label="Network"
                  value={
                    NETWORKS.find(
                      (n) => n.value === subscriptionRes.networkProvider
                    )?.label ?? subscriptionRes.networkProvider
                  }
                />
                <ReadOnlyField
                  label="Customer Number"
                  value={subscriptionRes.customerNumber}
                />
                <ReadOnlyField
                  label="Customer Name"
                  value={subscriptionRes.customerName}
                />
                <ReadOnlyField
                  label="Amount (GHS)"
                  value={totalCustomerPays > 0 ? totalCustomerPays.toFixed(2) : String(subscriptionRes.billingAmount || subscriptionRes.amount)}
                />
                <ReadOnlyField
                  label="Current Status"
                  value={subscriptionRes.status}
                  badge
                />
              </div>

              <div className="flex-1" />

              <Button
                className="w-full"
                disabled={isCheckingStatus}
                onClick={handleCheckStatus}
              >
                {isCheckingStatus ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Fetching Status…
                  </>
                ) : statusRes ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Subscription Status
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Get Subscription Status
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* -------- Status Response Card -------- */}
          {statusRes && (
            <Card className="flex flex-col border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/40 dark:via-emerald-950/30 dark:to-teal-950/20 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-green-800 dark:text-green-200">
                      Subscription Status
                    </CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-400">
                      {statusRes.profile.status || "Retrieved"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex flex-col flex-1">
                {/* Profile details */}
                <div className="space-y-3">
                  <PaymentDetailRow
                    label="Subscription ID"
                    value={statusRes.profile.uniqRefId}
                  />
                  <PaymentDetailRow
                    label="Customer Number"
                    value={statusRes.profile.customerNumber}
                  />
                  <PaymentDetailRow
                    label="Amount"
                    value={
                      statusRes.profile.amount
                        ? new Intl.NumberFormat("en-GH", {
                            style: "currency",
                            currency: "GHS",
                          }).format(Number(statusRes.profile.amount))
                        : "—"
                    }
                    bold
                  />
                  <PaymentDetailRow
                    label="Cycle"
                    value={
                      CYCLES.find((c) => c.value === statusRes.profile.cycle)
                        ?.label ?? statusRes.profile.cycle
                    }
                  />
                  <PaymentDetailRow
                    label="Network"
                    value={
                      NETWORKS.find((n) => n.value === statusRes.profile.nw)
                        ?.label ?? statusRes.profile.nw
                    }
                  />
                  <PaymentDetailRow
                    label="Start Date"
                    value={statusRes.profile.startDate}
                  />
                  <PaymentDetailRow
                    label="End Date"
                    value={statusRes.profile.endDate}
                  />
                  <PaymentDetailRow
                    label="Status"
                    value={statusRes.profile.status}
                    isBadge
                  />
                  <PaymentDetailRow
                    label="Completed"
                    value={statusRes.profile.completed ? "Yes" : "No"}
                  />
                </div>

                {/* Transactions */}
                {statusRes.transactions && statusRes.transactions.length > 0 && (
                  <>
                    <Separator className="bg-green-200 dark:bg-green-800" />
                    <div>
                      <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 mb-2">
                        Transactions ({statusRes.transactions.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {statusRes.transactions.map((tx, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-green-200 dark:border-green-800 p-2 text-xs space-y-1"
                          >
                            <div className="flex justify-between">
                              <span className="text-green-700 dark:text-green-300 font-medium">Trans ID</span>
                              <span className="font-mono text-green-950 dark:text-green-50">{tx.transId || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700 dark:text-green-300 font-medium">Status</span>
                              <Badge variant="secondary" className="text-xs">{tx.transStatus || "—"}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700 dark:text-green-300 font-medium">Date</span>
                              <span className="font-mono text-green-950 dark:text-green-50">{tx.transDate || "—"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-green-700 dark:text-green-300 font-medium">Message</span>
                              <span className="text-right text-green-950 dark:text-green-50">{tx.transMsg || "—"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex-1" />

                <Separator className="bg-green-200 dark:bg-green-800" />

                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => { window.location.href = "/recurring-payment-summary"; }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  View Recurring Payment Summary
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* -------- DIALOG -------- */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) setDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
              )}
              {dialogTitle}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-2">
            {/* OTP Resend success → just dismiss */}
            {dialogType === "success" && dialogMessage.toLowerCase().includes("otp") && dialogMessage.toLowerCase().includes("resend") && (
              <Button onClick={() => setDialogOpen(false)}>
                OK
              </Button>
            )}

            {/* After step 1 success → go to step 2 (skip if OTP resend) */}
            {dialogType === "success" && step === 0 && subscriptionRes && !(dialogMessage.toLowerCase().includes("otp") && dialogMessage.toLowerCase().includes("resend")) && (
              <Button onClick={goToStep2}>
                OK &amp; Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {/* After step 2 success → go to step 3 (skip if OTP resend) */}
            {dialogType === "success" && step === 1 && otpRes && !(dialogMessage.toLowerCase().includes("otp") && dialogMessage.toLowerCase().includes("resend")) && (
              <Button onClick={goToStep3}>
                OK &amp; Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}

            {/* Error → show close button */}
            {dialogType === "error" && (
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Read-only field helper                                             */
/* ------------------------------------------------------------------ */
function ReadOnlyField({
  label,
  value,
  badge: isBadge,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {isBadge ? (
        <div>
          <Badge variant="secondary">{value}</Badge>
        </div>
      ) : (
        <Input value={value} readOnly className="bg-muted" />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Payment detail row helper (colourful)                              */
/* ------------------------------------------------------------------ */
function PaymentDetailRow({
  label,
  value,
  color,
  bgColor,
  bold,
  isBadge,
}: {
  label: string;
  value: string;
  color?: string;
  bgColor?: string;
  bold?: boolean;
  isBadge?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between rounded-lg px-3 py-2", bgColor || "bg-transparent")}>
      <span className="text-xs font-medium text-green-800 dark:text-green-200 shrink-0 mr-3">{label}</span>
      {isBadge ? (
        <Badge variant="secondary" className={cn("text-xs", color)}>
          {value}
        </Badge>
      ) : (
        <span className={cn("text-sm font-mono text-right break-all text-green-950 dark:text-green-50", color, bold && "font-bold text-base")}>
          {value || "—"}
        </span>
      )}
    </div>
  );
}


