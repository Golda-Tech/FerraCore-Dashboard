"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated, login } from "@/lib/auth";
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
  IconUser,
  IconLogin,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { LoginRequest } from "@/types/auth";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login({ email, password } as LoginRequest);

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
        error:
          err.response?.data?.message ||
          "Login failed. Please check your credentials and try again.",
      });
      setShowResultDialog(true);
    } finally {
      setLoading(false);
    }
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
    setShowResultDialog(false);
    setLoginResult({ success: false });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            placeholder="you@example.com"
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
              type={showPassword ? "text" : "password"}
              value={password}
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
              Signing In...
            </>
          ) : (
            <>
              <IconLogin className="mr-2 h-4 w-4" />
              Sign In
            </>
          )}
        </Button>

        <div className="text-center text-sm">
          <a
            href="/forgot-password"
            className="underline hover:text-primary"
            tabIndex={loading ? -1 : 0}
          >
            Forgot password?
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
                  <h3 className="text-lg font-semibold">Signing In</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please wait while we authenticate your account...
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
                  {loginResult.success ? "Welcome Back!" : "Sign In Failed"}
                </DialogTitle>
                <DialogDescription>
                  {loginResult.success
                    ? "You have been successfully signed in."
                    : "There was an error signing you in."}
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
                  onClick={() => router.push("/forgot-password")}
                  className="w-full sm:w-auto"
                >
                  Forgot Password?
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
