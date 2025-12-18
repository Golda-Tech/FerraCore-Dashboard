"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { register, clearAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconLoader,
  IconCheck,
  IconX,
  IconUser,
  IconUserPlus,
  IconMail,
  IconInfoCircle,
} from "@tabler/icons-react";

enum PlanType {
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  PAYOUTS = "PAYOUTS",
  RECURRING_PAYMENTS = "RECURRING_PAYMENTS",
  ENTERPRISE_FULL_ACCESS = "ENTERPRISE_FULL_ACCESS",
}

interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  organizationName: string;
  mobileNumber: string;
  planType: PlanType;
  userType: UserType;
}

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [planType, setPlanType] = useState<PlanType | "">("");
  const [loading, setLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [registerResult, setRegisterResult] = useState<{
    success: boolean;
    error?: string;
    userData?: any;
  }>({ success: false });

  const validateForm = () => {
    if (!firstname.trim() || !lastname.trim()) {
      return "First name and last name are required";
    }
    if (!organizationName.trim()) {
      return "Organization name is required";
    }
    if (!mobileNumber.trim()) {
      return "Mobile number is required";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setRegisterResult({
        success: false,
        error: validationError,
      });
      setShowResultDialog(true);
      return;
    }

    setLoading(true);

    const cleanMobileNumber = (num: string) => {
      // Remove any non-digit characters
      let cleaned = num.replace(/\D/g, "");
      // If it starts with '0', remove it
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      return `233${cleaned}`;
    };

    try {
      const data = await register({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email,
        organizationName: organizationName.trim(),
        mobileNumber: cleanMobileNumber(mobileNumber),
        planType: planType as PlanType,
         userType: userType as UserType,
      } as RegisterRequest);

      setRegisterResult({
        success: true,
        userData: data,
      });

      setShowResultDialog(true);
    } catch (err: any) {
         /*  RFC 7807 (Problem Details) shape  */
                            const problem = err.response?.data;

                            // 1.  Prefer RFC 7807 fields
                            const userMsg =
                              problem?.detail ||                       // "Invalid temporary password."
                              problem?.title ||                        // "Internal Server Error"
                              problem?.message ||                      // fallback
                              err.response?.statusText ||              // "Internal Server Error"
                              err.message ||                           // final fallback
                              "Registration failed. Please try again.";

                            console.error("Register error:", {
                              status: err.response?.status,
                              type: problem?.type,
                              title: problem?.title,
                              detail: problem?.detail,
                              instance: problem?.instance,
                              timestamp: problem?.timestamp,
                            });

      setRegisterResult({
        success: false,
        error:
          problem?.detail ||
          "Registration failed. Please try again.",
      });
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowResultDialog(false);
    if (registerResult.success) {
      // CRITICAL: Clear ALL localStorage and use hard navigation
      if (typeof window !== "undefined") {
        localStorage.clear(); // Clear everything to be absolutely sure
        console.log("Cleared all localStorage");
        
        // Force a hard navigation instead of Next.js routing
        window.location.href = "/login?registered=true";
      }
    }
  };

  const resetForm = () => {
    setEmail("");
    setFirstname("");
    setLastname("");
    setOrganizationName("");
    setMobileNumber("");
    setPlanType("");
    setShowResultDialog(false);
    setRegisterResult({ success: false });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-4">

      <div className="w-full">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
          Onboard New Business Entity
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Provide the details below to register a new business in the system.
        </p>
      </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              type="text"
              placeholder="First Name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastname">Last Name</Label>
            <Input
              id="lastname"
              type="text"
              placeholder="Last Name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            type="text"
            placeholder="Your Company Inc."
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <div className="flex items-center">
            {/* country code - non-editable but readable */}
            <span
              aria-hidden="true"
              className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground h-10"
            >
              +233
            </span>
            <Input
              id="mobileNumber"
              type="tel"
              inputMode="numeric"
              placeholder="244 123 456"
              className="rounded-l-none"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="planType">Select Plan</Label>
          <Select
            onValueChange={(value) => setPlanType(value as PlanType)}
            value={planType}
            disabled={loading}
          >
            <SelectTrigger id="planType">
              <SelectValue placeholder="Choose a plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PlanType.PAYMENT_REQUEST}>PAYMENT REQUEST</SelectItem>
              <SelectItem value={PlanType.PAYOUTS}>PAYOUTS</SelectItem>
              <SelectItem value={PlanType.RECURRING_PAYMENTS}>RECURRING PAYMENTS</SelectItem>
              <SelectItem value={PlanType.ENTERPRISE_FULL_ACCESS}>ENTERPRISE FULL ACCESS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors" disabled={loading}>
          {loading ? (
            <>
              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              <IconUserPlus className="mr-2 h-4 w-4" />
              Create Account
            </>
          )}
        </Button>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-rose-600 hover:text-rose-600"
            tabIndex={loading ? -1 : 0}
          >
            Sign In
          </a>
        </p>
      </form>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconLoader className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Creating Your Account
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please wait while we set up your account...
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  registerResult.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {registerResult.success ? (
                  <IconCheck className="h-6 w-6 text-green-600" />
                ) : (
                  <IconX className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <DialogTitle>
                  {registerResult.success
                    ? "Account Created Successfully!"
                    : "Registration Failed"}
                </DialogTitle>
                <DialogDescription>
                  {registerResult.success
                    ? "Please check your email for instructions on the next steps."
                    : "There was an error creating your account."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {registerResult.success ? (
              <>
                <Alert>
                  <IconMail className="h-4 w-4" />
                  <AlertDescription>
                    You will receive an email with your account details and instructions to complete your registration.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <Alert variant="destructive">
                <IconX className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {registerResult.error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {registerResult.success ? (
             <Button onClick={handleCloseDialog} className="w-full sm:w-auto">
                Sign In
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowResultDialog(false)}
                  className="w-full sm:w-auto"
                >
                  Try Again
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}