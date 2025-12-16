"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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
  IconMail,
  IconShieldCheck,
} from "@tabler/icons-react";

import { sendResetOtp, verifyResetOtp, forgotPassword } from "@/lib/auth";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    error?: string;
  }>({ success: false });

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendResetOtp(email, "EMAIL", "LOGIN");
      setStep('otp');
      setResendCooldown(60);
    } catch (err: any) {
      const problem = err.response?.data;
      const userMsg =
        problem?.detail ||
        problem?.title ||
        problem?.message ||
        err.response?.statusText ||
        err.message ||
        "Failed to send OTP. Please try again.";

      console.error("OTP send error:", {
        status: err.response?.status,
        type: problem?.type,
        title: problem?.title,
        detail: problem?.detail,
      });

      setResetResult({
        success: false,
        error: userMsg,
      });
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyResetOtp(email, "EMAIL", otp);
      setStep('password');
    } catch (err: any) {
      const problem = err.response?.data;
      const userMsg =
        problem?.detail ||
        problem?.title ||
        problem?.message ||
        err.response?.statusText ||
        err.message ||
        "Invalid OTP. Please check your code and try again.";

      console.error("OTP verify error:", {
        status: err.response?.status,
        type: problem?.type,
        title: problem?.title,
        detail: problem?.detail,
      });

      setResetResult({
        success: false,
        error: userMsg,
      });
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
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
      await forgotPassword({
        email,
        tempPassword: "",
        newPassword,
      });

      setResetResult({
        success: true,
      });

      setShowResultDialog(true);
    } catch (err: any) {
      const problem = err.response?.data;
      const userMsg =
        problem?.detail ||
        problem?.title ||
        problem?.message ||
        err.response?.statusText ||
        err.message ||
        "Password change failed. Please try again.";

      console.error("Reset error:", {
        status: err.response?.status,
        type: problem?.type,
        title: problem?.title,
        detail: problem?.detail,
      });

      setResetResult({
        success: false,
        error: userMsg,
      });
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      await sendResetOtp(email, "EMAIL", "PASSWORD_RESET");
      setResendCooldown(60);
    } catch (err: any) {
      setResetResult({
        success: false,
        error: err.message || "Failed to resend OTP. Please try again.",
      });
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp("");
    setResendCooldown(0);
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
      {step === 'email' && (
        <div className="grid gap-4">
          <div className="w-full">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground whitespace-nowrap">
                Forgot your password?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your email and we'll send you a verification code.
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

          <Button 
            onClick={handleRequestOTP}
            className="w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors" 
            disabled={loading}
          >
            {loading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Sending Code...
              </>
            ) : (
              <>
                <IconMail className="mr-2 h-4 w-4" />
                Send Verification Code
              </>
            )}
          </Button>
        </div>
      )}

      {step === 'otp' && (
        <div className="grid gap-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
              <IconMail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Check your email</h3>
            <p className="text-sm text-muted-foreground">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-sm font-medium">{email}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="otp" className="text-center">
              Enter verification code
            </Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button 
            onClick={handleVerifyOTP}
            className="w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors" 
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <IconShieldCheck className="mr-2 h-4 w-4" />
                Verify Code
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                className="text-rose-600 hover:text-rose-700 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={loading}
                className="text-rose-600 hover:text-rose-700 font-medium underline"
              >
                Change email
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'password' && (
        <div className="grid gap-4">
          <div className="w-full">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground whitespace-nowrap">
                Set New Password
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a strong password for your account.
              </p>
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

          <Button 
            onClick={handleResetPassword}
            className="w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors" 
            disabled={loading}
          >
            {loading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              <>
                <IconLock className="mr-2 h-4 w-4" />
                Change Password
              </>
            )}
          </Button>
        </div>
      )}

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
                    {step === 'email' && 'Sending Code'}
                    {step === 'otp' && 'Verifying Code'}
                    {step === 'password' && 'Resetting Password'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {step === 'email' && 'Please wait while we send your verification code...'}
                    {step === 'otp' && 'Please wait while we verify your code...'}
                    {step === 'password' && 'Please wait while we update your password...'}
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
                    ? "Password Changed Successfully!"
                    : "Operation Failed"}
                </DialogTitle>
                <DialogDescription>
                  {resetResult.success
                    ? "Your password has been updated."
                    : "There was an error processing your request."}
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
                Go to Sign In
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowResultDialog(false)}
                className="w-full sm:w-auto"
              >
                {step === 'password' ? 'Try Again' : 'OK'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}