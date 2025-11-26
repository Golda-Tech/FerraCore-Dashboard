"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/auth";
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

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

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
      await sendLoginOtp(email,password, "EMAIL", "LOGIN");
      setStep('otp');
      setOtpSent(true);
      setResendCooldown(60); // 60 second cooldown
    } catch (err: any) {
      setLoginResult({
        success: false,
        error: err.message || "Failed to send OTP. Please try again.",
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

      setLoginResult({
        success: true,
        userData: data,
      });

      setShowResultDialog(true);

      // Navigate to dashboard after showing success
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setLoginResult({
        success: false,
        error: err.message || "Invalid OTP. Please check your code and try again.",
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
      {step === 'email' ? (
        <form onSubmit={handleRequestOTP} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              placeholder="biz@mail.com"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
            <Input
              id="password"
              value={password}
              type={showPassword ? "text" : "password"}
              placeholder="Your account password"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
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
                            <IconEyeOff className="h-4 w-4" />
                          ) : (
                            <IconEye className="h-4 w-4" />
                          )}
                      </Button>
                      </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
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

          <div className="text-center text-sm">
            <a
              href="/forgot-password"
              className="underline hover:text-primary"
              tabIndex={loading ? -1 : 0}
            >
              Need help?
            </a>{" "}
            |{" "}
            <a
              href="/register"
              className="underline hover:text-primary"
              tabIndex={loading ? -1 : 0}
            >
              Create Account
            </a>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="grid gap-4">
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

          <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
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
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendCooldown > 0 || loading}
                className="underline hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={loading}
                className="underline hover:text-primary"
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
                  <h3 className="text-lg font-semibold">
                    {step === 'email' ? 'Sending OTP' : 'Verifying Code'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
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
                  onClick={() => {
                    setShowResultDialog(false);
                    resetForm();
                  }}
                  className="w-full sm:w-auto"
                >
                  Start Over
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}