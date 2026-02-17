"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { register, getUser } from "@/lib/auth";
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
import {
  IconLoader,
  IconCheck,
  IconX,
  IconUserPlus,
  IconMail,
  IconCalculator,
  IconRuler,
} from "@tabler/icons-react";

enum PlanType {
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  PAYOUTS = "PAYOUTS",
  RECURRING_PAYMENTS = "RECURRING_PAYMENTS",
  ENTERPRISE_FULL_ACCESS = "ENTERPRISE_FULL_ACCESS",
}

enum UserType {
  SUPER_ADMIN = "SUPER_ADMIN",
  GA_ADMIN = "GA_ADMIN",
  BUSINESS_ADMIN = "BUSINESS_ADMIN",
  BUSINESS_FINANCE = "BUSINESS_FINANCE",
  BUSINESS_OPERATOR = "BUSINESS_OPERATOR",
}

interface RegisterRequest {
  firstname: string;
  lastname: string;
  email: string;
  organizationName: string;
  registeredBy: string;
  mobileNumber: string;
  planType: PlanType;
  userType: UserType;
  transactionFee?: number;
  cappedAmount?: number;
}

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [registeredBy, setRegisteredBy] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [organizationName, setOrganizationName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [planType, setPlanType] = useState<PlanType | "">("");
  const [userType, setUserType] = useState<UserType | "">("");
  const [transactionFee, setTransactionFee] = useState<string>("");
  const [cappedAmount, setCappedAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [registerResult, setRegisterResult] = useState<{
    success: boolean;
    error?: string;
    userData?: any;
  }>({ success: false });

  useEffect(() => {
    const user = getUser();
    setRegisteredBy(user?.email ?? "");
    setCurrentUserRole(user?.role ?? "");
  }, []);

  // Determine if a user type should be disabled based on current user's role
  const isUserTypeDisabled = (type: UserType): boolean => {
    switch (currentUserRole) {
      case "SUPER_ADMIN":
        // SUPER_ADMIN can create any user type - none disabled
        return false;
      case "GA_ADMIN":
        // GA_ADMIN cannot create SUPER_ADMIN
        return type === UserType.SUPER_ADMIN;
      default:
        // All other roles cannot create SUPER_ADMIN or GA_ADMIN
        return type === UserType.SUPER_ADMIN || type === UserType.GA_ADMIN;
    }
  };

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
      let cleaned = num.replace(/\D/g, "");
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
        registeredBy: registeredBy.trim(),
        mobileNumber: cleanMobileNumber(mobileNumber),
        planType: planType as PlanType,
        userType: userType as UserType,
        transactionFee: transactionFee ? parseFloat(transactionFee) : undefined,
        cappedAmount: cappedAmount ? parseFloat(cappedAmount) : undefined,
      } as RegisterRequest);

      setRegisterResult({
        success: true,
        userData: data,
      });

      setShowResultDialog(true);
    } catch (err: any) {
      const problem = err.response?.data;

      const userMsg =
       err.response?.data.message ||
        problem?.detail ||
        problem?.title ||
        problem?.message ||
        err.response?.statusText ||
        err.message ||
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
        error: userMsg || problem?.detail || "Registration failed. Please try again.",
      });
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowResultDialog(false);
    if (registerResult.success) {
      setEmail("");
      setFirstname("");
      setLastname("");
      setOrganizationName("");
      setMobileNumber("");
      setPlanType("");
      setUserType("");
      setTransactionFee("");
      setCappedAmount("");
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 5000);
    }
  };

  const resetForm = () => {
    setEmail("");
    setFirstname("");
    setLastname("");
    setOrganizationName("");
    setMobileNumber("");
    setPlanType("");
    setUserType("");
    setTransactionFee("");
    setCappedAmount("");
    setShowResultDialog(false);
    setRegisterResult({ success: false });
  };

  // Helper to get helper text based on role
  const getRoleHelperText = () => {
      console.log("Current user role:", currentUserRole); // Debug log
    switch (currentUserRole) {
      case "SUPER_ADMIN":
        return "As SUPER ADMIN, you can assign any role";
      case "GA_ADMIN":
        return "As GA ADMIN, you cannot create SUPER ADMIN users";
      default:
        return "You can only create Business-level roles (BUSINESS_ADMIN, BUSINESS_FINANCE, BUSINESS_OPERATOR)";
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
              Onboard New Business Partner
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Provide the details below to register a new business in the system.
            </p>
            {currentUserRole && (
              <p className="text-xs text-muted-foreground">
                Logged in as: <span className="font-medium">{currentUserRole.replace("_", " ")}</span>
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <div className="flex items-center">
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
                  onChange={(e) =>
                    setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 9))
                  }
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
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
                    <SelectItem value={PlanType.PAYMENT_REQUEST}>
                      PAYMENT REQUEST
                    </SelectItem>
                    <SelectItem value={PlanType.PAYOUTS}>PAYOUTS</SelectItem>
                    <SelectItem value={PlanType.RECURRING_PAYMENTS}>
                      RECURRING PAYMENTS
                    </SelectItem>
                    <SelectItem value={PlanType.ENTERPRISE_FULL_ACCESS}>
                      ENTERPRISE FULL ACCESS
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select
                  onValueChange={(value) => setUserType(value as UserType)}
                  value={userType}
                  disabled={loading}
                >
                  <SelectTrigger id="userType">
                    <SelectValue placeholder="Choose user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={UserType.SUPER_ADMIN}
                      disabled={isUserTypeDisabled(UserType.SUPER_ADMIN)}
                    >
                      SUPER ADMIN
                      {isUserTypeDisabled(UserType.SUPER_ADMIN) && ""}
                    </SelectItem>
                    <SelectItem
                      value={UserType.GA_ADMIN}
                      disabled={isUserTypeDisabled(UserType.GA_ADMIN)}
                    >
                      GA ADMIN
                      {isUserTypeDisabled(UserType.GA_ADMIN) && ""}
                    </SelectItem>
                    <SelectItem
                      value={UserType.BUSINESS_ADMIN}
                      disabled={isUserTypeDisabled(UserType.BUSINESS_ADMIN)}
                    >
                      BUSINESS ADMIN
                    </SelectItem>
                    <SelectItem
                      value={UserType.BUSINESS_FINANCE}
                      disabled={isUserTypeDisabled(UserType.BUSINESS_FINANCE)}
                    >
                      BUSINESS FINANCE
                    </SelectItem>
                    <SelectItem
                      value={UserType.BUSINESS_OPERATOR}
                      disabled={isUserTypeDisabled(UserType.BUSINESS_OPERATOR)}
                    >
                      BUSINESS OPERATOR
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{getRoleHelperText()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
                <div className="relative">
                  <IconCalculator className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                                       id="transactionFee"
                                       type="text"
                                       inputMode="decimal"
                                       pattern="[0-9]*\.?[0-9]*"
                                       placeholder="1.75"
                                       className="pl-10"
                                        value={transactionFee}
                                       onChange={(e) => {
                                         const value = e.target.value.replace(/[^0-9.]/g, '');
                                         const parts = value.split('.');
                                         // Keep first part as is, keep everything after first decimal point
                                         const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
                                         setTransactionFee(sanitized);
                                       }}
                                        disabled={loading}
                                     />

                </div>
                <p className="text-xs text-muted-foreground">Enter as percentage (e.g., 1.75 for 1.75%)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cappedAmount">Capped Amount (GHS)</Label>
                <div className="relative">
                  <IconRuler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cappedAmount"
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    placeholder="30.00"
                    className="pl-10"
                    value={cappedAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      const parts = value.split('.');
                      // Keep first part as is, keep everything after first decimal point
                      const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
//                       handleInputChange("amount", sanitized);
                      setCappedAmount(sanitized);
                    }}
                    disabled={loading}
                  />

                </div>
                <p className="text-xs text-muted-foreground">Maximum fee limit in GHS (e.g., 30)</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              className="w-full max-w-md rounded-lg bg-black text-white font-semibold py-2.5 hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
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
          </div>
        </form>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconLoader className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Creating Your Account</h3>
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

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
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
              <Alert>
                <IconMail className="h-4 w-4" />
                <AlertDescription>
                  You will receive an email with your account details and
                  instructions to complete your registration.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <IconX className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {registerResult.error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-center">
            {registerResult.success ? (
              <Button
                onClick={handleCloseDialog}
                className="w-full sm:w-auto sm:min-w-[120px]"
              >
                OK
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowResultDialog(false)}
                className="w-full sm:w-auto sm:min-w-[120px]"
              >
                Try Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showBanner && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow">
          ✅ Account created successfully!
        </div>
      )}
    </>
  );
}