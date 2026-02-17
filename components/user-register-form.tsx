"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { registerUser, getUser } from "@/lib/auth";
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
  IconUser,
  IconUserPlus,
  IconMail,
  IconPhone,
  IconBuilding,
} from "@tabler/icons-react";

enum UserType {
  SUPER_ADMIN = "SUPER_ADMIN",
  GA_ADMIN = "GA_ADMIN",
  BUSINESS_ADMIN = "BUSINESS_ADMIN",
  BUSINESS_FINANCE = "BUSINESS_FINANCE",
  BUSINESS_OPERATOR = "BUSINESS_OPERATOR",
}

interface RegisterUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  mobileNumber: string;
  userType: UserType;
  organizationName: string;
  registeredBy: string;
}

export function RegisterUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [registeredBy, setRegisteredBy] = useState<string>("");
  const [organizationName, setOrganizationName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userType, setUserType] = useState<UserType | "">("");
  const [loading, setLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [registerResult, setRegisterResult] = useState<{
    success: boolean;
    error?: string;
    userData?: any;
  }>({ success: false });
  const [showBanner, setShowBanner] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Get current user info on mount
  useEffect(() => {
    const user = getUser();
    setRegisteredBy(user?.email ?? "");
    setOrganizationName(user?.organizationName ?? "");
    setCurrentUserRole(user?.role ?? "");
  }, []);

  // Determine if a role should be disabled based on current user's role
  const isRoleDisabled = (role: UserType): boolean => {
    switch (currentUserRole) {
      case "SUPER_ADMIN":
        // SUPER_ADMIN can create any role, none disabled
        return false;
      case "GA_ADMIN":
        // GA_ADMIN can create any role except SUPER_ADMIN
        return role === UserType.SUPER_ADMIN;
      default:
        // All other roles can only create BUSINESS_ADMIN, BUSINESS_FINANCE, BUSINESS_OPERATOR
        return role === UserType.SUPER_ADMIN || role === UserType.GA_ADMIN;
    }
  };

  const validateForm = () => {
    if (!firstname.trim() || !lastname.trim()) {
      return "First name and last name are required";
    }
    if (!email.trim()) {
      return "Email is required";
    }
    if (!phoneNumber.trim()) {
      return "Phone number is required";
    }
    if (!userType) {
      return "User type is required";
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

    const cleanPhoneNumber = (num: string) => {
      let cleaned = num.replace(/\D/g, "");
      if (cleaned.startsWith("0")) {
        cleaned = cleaned.substring(1);
      }
      return `233${cleaned}`;
    };

    try {
      const data = await registerUser({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email,
        mobileNumber: cleanPhoneNumber(phoneNumber),
        userType: userType as UserType,
        organizationName: organizationName.trim(),
        registeredBy: registeredBy.trim(),
      } as RegisterUserRequest);

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
      // Reset form
      setEmail("");
      setFirstname("");
      setLastname("");
      setPhoneNumber("");
      setUserType("");
      // Show success banner
      setShowBanner(true);
      // Auto-hide after 5s
      setTimeout(() => setShowBanner(false), 5000);
    }
  };

  const resetForm = () => {
    setEmail("");
    setFirstname("");
    setLastname("");
    setPhoneNumber("");
    setUserType("");
    setShowResultDialog(false);
    setRegisterResult({ success: false });
  };

  return (
    <>
      {/* Center container with max width */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-gray-100">
              Register New User
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add a new user to {organizationName || "your organization"}.
            </p>
            {currentUserRole && (
              <p className="text-xs text-muted-foreground">
                Logged in as: <span className="font-medium">{currentUserRole.replace("_", " ")}</span>
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Fields */}
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

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="flex items-center">
                <span
                  aria-hidden="true"
                  className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-sm text-muted-foreground h-10"
                >
                  +233
                </span>
                <div className="relative flex-1">
                  <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    inputMode="numeric"
                    placeholder="244 123 456"
                    className="rounded-l-none pl-10"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 9))
                    }
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Organization (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization</Label>
              <div className="relative">
                <IconBuilding className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="organizationName"
                  type="text"
                  value={organizationName}
                  readOnly
                  className="pl-10 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                User will be added to this organization
              </p>
            </div>

            {/* User Type - Role based permissions */}
            <div className="space-y-2">
              <Label htmlFor="userType">User Role</Label>
              <Select
                onValueChange={(value) => setUserType(value as UserType)}
                value={userType}
                disabled={loading}
              >
                <SelectTrigger id="userType">
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={UserType.SUPER_ADMIN}
                    disabled={isRoleDisabled(UserType.SUPER_ADMIN)}
                  >
                    SUPER ADMIN
                    {isRoleDisabled(UserType.SUPER_ADMIN) && " (Restricted)"}
                  </SelectItem>
                  <SelectItem
                    value={UserType.GA_ADMIN}
                    disabled={isRoleDisabled(UserType.GA_ADMIN)}
                  >
                    GA ADMIN
                    {isRoleDisabled(UserType.GA_ADMIN) && " (Restricted)"}
                  </SelectItem>
                  <SelectItem
                    value={UserType.BUSINESS_ADMIN}
                    disabled={isRoleDisabled(UserType.BUSINESS_ADMIN)}
                  >
                    BUSINESS ADMIN
                  </SelectItem>
                  <SelectItem
                    value={UserType.BUSINESS_FINANCE}
                    disabled={isRoleDisabled(UserType.BUSINESS_FINANCE)}
                  >
                    BUSINESS FINANCE
                  </SelectItem>
                  <SelectItem
                    value={UserType.BUSINESS_OPERATOR}
                    disabled={isRoleDisabled(UserType.BUSINESS_OPERATOR)}
                  >
                    BUSINESS OPERATOR
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {currentUserRole === "SUPER_ADMIN"
                  ? "As SUPER ADMIN, you can assign any role"
                  : currentUserRole === "GA_ADMIN"
                  ? "As GA ADMIN, you cannot create SUPER ADMIN users"
                  : "You can only create Business-level roles"}
              </p>
            </div>
          </div>

          {/* Submit Button - Centered with max width */}
          <div className="flex justify-center pt-2">
            <Button
              type="submit"
              className="w-full max-w-md rounded-lg bg-black text-white font-semibold py-2.5 hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                  Creating User...
                </>
              ) : (
                <>
                  <IconUserPlus className="mr-2 h-4 w-4" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm mx-4">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconLoader className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Creating User Account</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please wait while we set up the user account...
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
                    ? "User Created Successfully!"
                    : "Registration Failed"}
                </DialogTitle>
                <DialogDescription>
                  {registerResult.success
                    ? "The user will receive an email with login instructions."
                    : "There was an error creating the user account."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {registerResult.success ? (
              <Alert>
                <IconMail className="h-4 w-4" />
                <AlertDescription>
                  An email has been sent to {email} with account details and
                  instructions to complete registration.
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
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowResultDialog(false)}
                  className="w-full sm:w-auto sm:min-w-[120px]"
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  onClick={resetForm}
                  className="w-full sm:w-auto sm:min-w-[120px]"
                >
                  Reset Form
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showBanner && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded shadow">
          ✅ User created successfully!
        </div>
      )}
    </>
  );
}