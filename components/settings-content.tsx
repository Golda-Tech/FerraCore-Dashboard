"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User, Building2, Shield, Key, Eye, EyeOff, Copy,Calendar,CreditCard,Smartphone, Mail, Bell,RefreshCw, Check, AlertTriangle, Info, Globe } from "lucide-react";

import { getUserProfile, fetchNewKeys } from "@/lib/auth";


export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showSubscriptionSecret, setShowSubscriptionSecret] = useState(false);
  const [showClientToken, setShowClientToken] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copied, setCopied] = useState("");

  /* ---- live data ---- */
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {
   getUserProfile()
     .then(setUser)
     .catch(setError)
     .finally(() => setLoading(false));
 }, []);

  if (loading) return <p className="p-8">Loading profile…</p>;
  if (error) return error && <p className="p-8 text-red-600">{String(error)}</p>;
  if (!user) return null;

  /* ---- helpers ---- */
  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const generateNewKey = async () => {
    setIsGeneratingKey(true);
    try {
      fetchNewKeys().then((data) => setUser({ ...user, apiCredentials: data.apiCredentials }));

    } catch (err: any) {
      // surface error to user (toast, banner, etc.)
      console.error("Regenerate failed", err);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  /* ----------  RENDER  ---------- */
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>
      {user.isFirstTimeUser ? (
        <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-5 w-5 text-blue-600" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Welcome aboard!</p>
            <p>Finish setting up your Profile, Business details and keys to start transacting.</p>
          </div>
        </div>
      ) : null}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2"><User className="h-4 w-4" />Profile</TabsTrigger>
          {user.role === "USER" && (
            <TabsTrigger value="business" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Business</TabsTrigger>
          )}
          <TabsTrigger value="security" className="flex items-center gap-2"><Shield className="h-4 w-4" />Security</TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2"><Key className="h-4 w-4" />API & Keys</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input defaultValue={user.firstName} /></div>
                <div className="space-y-2"><Label>Last Name</Label><Input defaultValue={user.lastName} /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" defaultValue={user.email} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input defaultValue={user.phone} /></div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab (admin only) */}
        {user.role === "USER" && (
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Organization Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Organization Name</Label><Input defaultValue={user.organization.name} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    {user?.organization?.businessType ? (
                      <Select defaultValue={user.organization.businessType.toLowerCase()}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Loading…" />
                        </SelectTrigger>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2"><Label>Website</Label><Input defaultValue={user.organization.website} /></div>
                </div>
                <div className="space-y-2"><Label>Address</Label><Textarea defaultValue={user.organization.address} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Registration Number</Label><Input defaultValue={user.organization.registrationNumber} /></div>
                  <div className="space-y-2"><Label>Tax ID</Label><Input defaultValue={user.organization.taxId} /></div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Enable 2FA</Label><p className="text-sm text-muted-foreground">Use your phone to verify identity</p></div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Keys Tab */}
        <TabsContent value="api" className="space-y-4">
         <div className="grid gap-6">
        <Card>
                      <CardHeader>
                        <CardTitle>Subscription Information</CardTitle>
                        <CardDescription>Your current subscription plan and billing information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Current Plan</Label>
                            <div className="flex items-center space-x-2">
                              <Badge className="bg-green-100 text-green-800">{user.subscription.plan}</Badge>
                              <Badge variant="outline">{user.subscription.status}</Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Billing Cycle</Label>
                            <p className="capitalize">{user.subscription.billingCycle}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                            <p className="font-medium">
                              GHS {user.subscription.amount.toLocaleString()}/{user.subscription.billingCycle}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Next Billing</Label>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <p>{new Date(user.subscription.nextBilling).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                    {/* <Button variant="outline">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Manage Billing
                        </Button> **/}
                      </CardContent>
                    </Card>

          <Card>
            <CardHeader>
            <CardTitle>API Credentials</CardTitle>
             <CardDescription>Your API keys and service credentials for integration</CardDescription>
             </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Subscription Key</Label>
                <div className="flex items-center space-x-2"><Input value={user.apiCredentials.subscriptionKey} readOnly className="font-mono" />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(user.apiCredentials.subscriptionKey, "subscriptionKey")}>{copied === "subscriptionKey" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
                </div>
              </div>

              <div className="space-y-2"><Label>Subscription Secret ID</Label>
                <div className="flex items-center space-x-2">
                  <Input value={showSubscriptionSecret ? user.apiCredentials.subscriptionSecret : "•".repeat(32)} readOnly className="font-mono" />
                  <Button variant="outline" size="sm" onClick={() => setShowSubscriptionSecret(!showSubscriptionSecret)}>{showSubscriptionSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(user.apiCredentials.subscriptionSecret, "subscriptionSecret")}>{copied === "subscriptionSecret" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</Button>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"><AlertTriangle className="h-5 w-5 text-yellow-600" /><div className="text-sm text-yellow-800"><p className="font-medium">Keep credentials secure</p><p>Never share keys in public repos or client-side code.</p></div></div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={generateNewKey} disabled={isGeneratingKey}>{isGeneratingKey ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Generating…</> : "Regenerate Keys"}</Button>
                <a
                  href="https://documenter.getpostman.com/view/3132318/2sB3dLUs4R"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-lg bg-[#ff6c37] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e55a2b] transition-colors"
                >
                  <Globe className="mr-2 h-4 w-4" />
                  API Docs
                </a>
              </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}