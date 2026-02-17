"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated, clearAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
  IconUser,
  IconLogin,
  IconMail,
  IconEye,
  IconEyeOff,
  IconShieldCheck,
} from "@tabler/icons-react";

import { verifyLoginOtp, login, sendLoginOtp } from "@/lib/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loginResult, setLoginResult] = useState<{
    success: boolean;
    error?: string;
    userData?: any;
  }>({ success: false });
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  // Check if user is coming from registration
  const isFromRegistration = searchParams.get("registered") === "true";

  useEffect(() => {
    console.log("LoginForm mounted");
    console.log("isFromRegistration:", isFromRegistration);
    console.log("Current localStorage token:", localStorage.getItem("token"));
    console.log("Current localStorage user:", localStorage.getItem("user"));
    
    // If coming from registration, clear any existing auth and DON'T redirect
    if (isFromRegistration) {
      console.log("User coming from registration - clearing auth");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("After clear - token:", localStorage.getItem("token"));
      console.log("After clear - user:", localStorage.getItem("user"));
      return;
    }
    
    // Only redirect to dashboard if authenticated AND not from registration
    const hasToken = !!localStorage.getItem("token");
    console.log("Has token:", hasToken);
    
    if (hasToken) {
      console.log("User already authenticated - redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [router, isFromRegistration]);

  useEffect(() => {
    if (isFromRegistration) {
      setShowRegistrationSuccess(true);
      // Remove the query param from URL without reloading the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [isFromRegistration]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendLoginOtp(email, password, "EMAIL", "LOGIN");
      setStep('otp');
      setOtpSent(true);
      setResendCooldown(60); // 60 second cooldown
    } catch (err: any) {
         // 1.  Network / timeout
          if (err.code === "ECONNABORTED") {
            console.error("OTP send timed out");
          }
          // 2.  Axios error with server payload
          const msg = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.title || err.response?.statusText;
          // 3.  Fallback
          const userMsg = msg || err.message || "Failed to send OTP. Please try again.";

          console.error("OTP send error:", { code: err.code, status: err.response?.status, message: userMsg });

      setLoginResult({
        success: false,
        error: userMsg || "Failed to send OTP. Please try again.",
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
      const data = await verifyLoginOtp(email, "EMAIL", otp);
      console.log("verify otp response:", data);

      console.log("Password reset status:", data.passwordResetRequired);
      console.log("First time user status:", data.firstTimeUser);

     if (data.passwordResetRequired) {
         console.log("Password reset required - redirecting to reset page");
      return router.push(`/reset-password?email=${encodeURIComponent(email)}`);
     }

    if (data.firstTimeUser) {
            console.log("First time user - redirecting to settings page");
       setLoginResult({ success: true, userData: data });
       setShowResultDialog(true);
      return setTimeout(() => router.push("/settings"), 1500);
     }

   if (!data.passwordResetRequired && !data.firstTimeUser) {
            console.log("Regular login - redirecting to dashboard");
       setLoginResult({ success: true, userData: data });
       setShowResultDialog(true);
      return setTimeout(() => router.push("/dashboard"), 1500);
     }
    } catch (err: any) {

                 // 1.  Network / timeout
                  if (err.code === "ECONNABORTED") {
                    console.error("OTP verify timed out");
                  }
                  // 2.  Axios error with server payload
                  const msg = err.response?.data?.message || err.response?.statusText;
                  // 3.  Fallback
                  const userMsg = msg || err.message || "Invalid OTP. Please check your code and try again.";

                  console.error("OTP verify:", { code: err.code, status: err.response?.status, message: userMsg });
      setLoginResult({
        success: false,
        error: userMsg || "Invalid OTP. Please check your code and try again.",
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
      await sendLoginOtp(email, password, "EMAIL", "LOGIN");
      setResendCooldown(60);
    } catch (err: any) {
      setLoginResult({
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
    setOtpSent(false);
    setResendCooldown(0);
  };

  const handleCloseDialog = () => {
    setShowResultDialog(false);
    if (loginResult.success) {
      router.push("/dashboard");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setOtp("");
    setStep('email');
    setOtpSent(false);
    setResendCooldown(0);
    setShowResultDialog(false);
    setLoginResult({ success: false });
  };

  return (
    <>
      {showRegistrationSuccess && (
        <Alert className="mb-4 border-green-500 text-green-700">
          <IconCheck className="h-4 w-4" />
          <AlertDescription>
            Registration successful! Please sign in to continue.
          </AlertDescription>
        </Alert>
      )}
      {step === 'email' ? (
        <form onSubmit={handleRequestOTP} className="grid gap-4">

        <div className="w-full">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-950 dark:text-white whitespace-nowrap">
                  Login
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Welcome back, Please login to continue
                </p>
              </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-gray-950 dark:text-white font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="text-gray-950 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-gray-950 dark:text-white font-medium">Password</Label>
            <div className="relative">
            <Input
              id="password"
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="text-gray-950 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <IconEye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
            </div>
          </div>

           <div className="text-right text-sm">
                      <a
                        href="/forgot-password"
                        className="text-rose-600 hover:text-rose-700 font-medium"
                        tabIndex={loading ? -1 : 0}
                      >
                        Forgotten Password?
                      </a>
                    </div>

          <Button type="submit" className="w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors" disabled={loading}>
            {loading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <IconMail className="mr-2 h-4 w-4" />
                Send OTP
              </>
            )}
          </Button>

        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="grid gap-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
              <IconMail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-950 dark:text-white">Check your email</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-sm font-medium text-gray-950 dark:text-white">{email}</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="otp" className="text-center text-gray-950 dark:text-white font-medium">
              Enter verification code
            </Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={loading}
                className="gap-2"
                containerClassName="group"
              >
                <InputOTPGroup className="flex gap-2">
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className={cn(
                        "h-14 w-12 rounded-xl border-2 border-input bg-background text-xl font-semibold",
                        "transition-all duration-200",
                        "focus:border-primary focus:bg-accent focus:ring-2 focus:ring-primary/20",
                        "dark:border-gray-700 dark:bg-gray-800 dark:text-white",
                        "group-focus-within:border-primary group-hover:border-primary/50"
                      )}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors" disabled={loading || otp.length !== 6}>
            {loading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <IconShieldCheck className="mr-2 h-4 w-4" />
                Verify & Sign In
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">
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
        </form>
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
                  <h3 className="text-lg font-semibold text-gray-950 dark:text-white">
                    {step === 'email' ? 'Sending OTP' : 'Verifying Code'}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                    {step === 'email' 
                      ? 'Please wait while we send your verification code...'
                      : 'Please wait while we verify your code...'}
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
                  loginResult.success ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {loginResult.success ? (
                  <IconCheck className="h-6 w-6 text-green-600" />
                ) : (
                  <IconX className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <DialogTitle>
                  {loginResult.success ? "Welcome Back!" : "Verification Failed"}
                </DialogTitle>
                <DialogDescription>
                  {loginResult.success
                    ? "You have been successfully signed in."
                    : "There was an error with your verification."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {loginResult.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <IconUser className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    Account Details
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Email:</span>
                    <span className="font-medium text-green-800">{email}</span>
                  </div>
                  {loginResult.userData?.name && (
                    <div className="flex justify-between">
                      <span className="text-green-700">Name:</span>
                      <span className="font-medium text-green-800">
                        {loginResult.userData.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <IconX className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {loginResult.error}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {loginResult.success ? (
              <Button onClick={handleCloseDialog} className="w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors sm:w-auto">
                Continue to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setShowResultDialog(false)}
                  className="w-full w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors sm:w-auto"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => {
                    setShowResultDialog(false);
                    resetForm();
                  }}
                  className="w-full w-full rounded-lg bg-rose-600 text-white font-semibold py-2.5 hover:bg-rose-700 transition-colors sm:w-auto"
                >
                  OK
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}