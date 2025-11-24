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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconLoader,
  IconCheck,
  IconX,
  IconUser,
  IconUserPlus,
  IconEye,
  IconEyeOff,
  IconMail,
  IconInfoCircle,
} from "@tabler/icons-react";
import { RegisterRequest } from "@/types/auth";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [registerResult, setRegisterResult] = useState<{
    success: boolean;
    error?: string;
    userData?: any;
  }>({ success: false });

  const validateForm = () => {
    if (password !== confirm) {
      return "Passwords do not match";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (!firstname.trim() || !lastname.trim()) {
      return "First name and last name are required";
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

    try {
      const data = await register({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email,
        password,
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
    setPassword("");
    setFirstname("");
    setLastname("");
    setConfirm("");
    setShowResultDialog(false);
    setRegisterResult({ success: false });
  };

  const passwordsMatch = password === confirm;
  const passwordStrength =
    password.length >= 8 ? "Strong" : password.length >= 6 ? "Medium" : "Weak";
  const passwordColor =
    password.length >= 8
      ? "text-green-600"
      : password.length >= 6
      ? "text-yellow-600"
      : "text-red-600";

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
          {password && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Strength:</span>
              <span className={passwordColor}>{passwordStrength}</span>
              <Badge
                variant="outline"
                className={`text-xs ${passwordColor} border-current`}
              >
                {password.length}/8+ chars
              </Badge>
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              type={showConfirmPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={loading}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {confirm && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Passwords:</span>
              <span
                className={passwordsMatch ? "text-green-600" : "text-red-600"}
              >
                {passwordsMatch ? "Match" : "Don't match"}
              </span>
              {passwordsMatch && (
                <IconCheck className="h-3 w-3 text-green-600" />
              )}
            </div>
          )}
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
