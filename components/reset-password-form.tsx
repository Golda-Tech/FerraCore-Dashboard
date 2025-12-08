"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconLoader,
  IconCheck,
  IconX,
  IconLock,
  IconEye,
  IconEyeOff,
  IconAlertCircle,
} from "@tabler/icons-react";

import { resetPassword } from "@/lib/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    error?: string;
  }>({ success: false });
  const [email, setEmail] = useState(searchParams.get("email") || "");

  useEffect(() => {
    if (searchParams.get("email")) {
      setEmail(searchParams.get("email") || "");
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const validateForm = () => {
    if (!tempPassword.trim()) {
      return "Email is required";
    }
if (!tempPassword.trim()) {
      return "Temporary password is required";
    }
    if (!newPassword.trim()) {
      return "New password is required";
    }
    if (!confirmPassword.trim()) {
      return "Please confirm your new password";
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return passwordError;
    }

    if (newPassword !== confirmPassword) {
      return "Passwords do not match";
    }

    if (tempPassword === newPassword) {
      return "New password must be different from temporary password";
    }

    return null;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    return strength;
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength <= 2) return { label: "Weak", color: "bg-red-500" };
    if (strength <= 3) return { label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { label: "Good", color: "bg-blue-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setResetResult({
        success: false,
        error: validationError,
      });
      setShowResultDialog(true);
      return;
    }

    setLoading(true);

    try {

      const response = await resetPassword({
          email,
        tempPassword,
        newPassword,
      });


      setResetResult({
        success: true,
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
                      "Password change failed. Please try again.";

                    console.error("Reset error:", {
                      status: err.response?.status,
                      type: problem?.type,
                      title: problem?.title,
                      detail: problem?.detail,
                      instance: problem?.instance,
                      timestamp: problem?.timestamp,
                    });

      setResetResult({
        success: false,
        error:
          problem?.detail ||
          "Password reset failed. Please try again.",
      });
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowResultDialog(false);
    if (resetResult.success) {
      router.push("/login");
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="w-full">

                  <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground whitespace-nowrap">
                      Reset your password
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Enter the temporary password sent via email and reset your password with a new one for a personalized experience.
                    </p>
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
          <Label htmlFor="tempPassword">Temporary Password</Label>
          <div className="relative">
            <Input
              id="tempPassword"
              type={showTempPassword ? "text" : "password"}
              placeholder="Enter temporary password from email"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              disabled={loading}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowTempPassword(!showTempPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showTempPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showNewPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {newPassword && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strengthInfo.color} transition-all duration-300`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{strengthInfo.label}</span>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Password must contain:</p>
                <ul className="space-y-1 ml-4">
                  <li className={newPassword.length >= 8 ? "text-green-600" : ""}>
                    • At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : ""}>
                    • One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? "text-green-600" : ""}>
                    • One lowercase letter
                  </li>
                  <li className={/\d/.test(newPassword) ? "text-green-600" : ""}>
                    • One number
                  </li>
                  <li
                    className={
                      /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    • One special character
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <IconAlertCircle className="h-3 w-3" />
              Passwords do not match
            </p>
          )}
          {confirmPassword && newPassword === confirmPassword && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <IconCheck className="h-3 w-3" />
              Passwords match
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              Resetting Password...
            </>
          ) : (
            <>
              <IconLock className="mr-2 h-4 w-4" />
              Reset Password
            </>
          )}
        </Button>
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
                  <h3 className="text-lg font-semibold">Resetting Password</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please wait while we update your password...
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
                  resetResult.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {resetResult.success ? (
                  <IconCheck className="h-6 w-6 text-green-600" />
                ) : (
                  <IconX className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <DialogTitle>
                  {resetResult.success
                    ? "Password Reset Successfully!"
                    : "Password Reset Failed"}
                </DialogTitle>
                <DialogDescription>
                  {resetResult.success
                    ? "Your password has been updated."
                    : "There was an error resetting your password."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {resetResult.success ? (
              <Alert>
                <IconCheck className="h-4 w-4" />
                <AlertDescription>
                  You can now sign in with your new password.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <IconX className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {resetResult.error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {resetResult.success ? (
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
               {/** <Button
                  onClick={() => router.push("/login")}
                  className="w-full sm:w-auto"
                >
                  Sign In Instead
                </Button>**/}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}