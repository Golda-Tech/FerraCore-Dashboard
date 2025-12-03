"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/lib/auth";
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
  COLLECTIONS = "COLLECTIONS",
  DISBURSEMENTS = "DISBURSEMENTS",
  PREAPPROVALS = "PREAPPROVALS",
  ALL_INCLUSIVE = "ALL_INCLUSIVE",
}

interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  organizationName: string;
  mobileNumber: string;
  planType: PlanType;
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
      } as RegisterRequest);

      setRegisterResult({
        success: true,
        userData: data,
      });

      setShowResultDialog(true);

      // Navigate to dashboard after showing success
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setRegisterResult({
        success: false,
        error:
          err.response?.data?.message ||
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
      router.push("/dashboard");
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
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              type="text"
              placeholder=""
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
              placeholder=""
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
            placeholder="you@mail.com"
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
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-background text-sm text-muted-foreground h-10">
              +233
            </span>
            <Input
              id="mobileNumber"
              type="tel"
              placeholder="244123456"
              className="rounded-l-none"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
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
              <SelectItem value={PlanType.COLLECTIONS}>Collections</SelectItem>
              <SelectItem value={PlanType.DISBURSEMENTS}>Disbursements</SelectItem>
              <SelectItem value={PlanType.PREAPPROVALS}>Pre-approvals</SelectItem>
              <SelectItem value={PlanType.ALL_INCLUSIVE}>All-inclusive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
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
            className="underline hover:text-primary"
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
                    ? "Welcome! Your account has been created and you are now signed in."
                    : "There was an error creating your account."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {registerResult.success ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      Account Details
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Name:</span>
                      <span className="font-medium text-green-800">
                        {firstname} {lastname}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Email:</span>
                      <span className="font-medium text-green-800">
                        {email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Status:</span>
                      <Badge
                        variant="outline"
                        className="text-green-700 border-green-300"
                      >
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <Alert>
                  <IconMail className="h-4 w-4" />
                  <AlertDescription>
                    You may receive a welcome email shortly. Your account is
                    ready to use!
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
                Continue to Dashboard
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
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full sm:w-auto"
                >
                  Sign In Instead
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
