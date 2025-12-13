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

import { getUserProfile, fetchNewKeys, updateProfile, updateOrganization, updateCallbackUrl } from "@/lib/auth";


export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showSubscriptionSecret, setShowSubscriptionSecret] = useState(false);
  const [showClientToken, setShowClientToken] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copied, setCopied] = useState("");
  const [businessType, setBusinessType] = useState(""); // empty on first render
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(true);

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

  useEffect(() => {
     if (user?.organization?.businessType) {
       setBusinessType(user.organization.businessType.toLowerCase());
     }
   }, [user]); // re-run when user loads


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

  /* ----------  TRACK CHANGES  ---------- */
  const handleFieldChange = () => setDirty(true);

  /* ----------  PROFILE  ---------- */
  const saveProfile = async () => {
      setSaving(true);
      try{
    const updated = await updateProfile({
      firstName: (document.getElementById("firstName") as HTMLInputElement).value,
      lastName: (document.getElementById("lastName") as HTMLInputElement).value,
      email: (document.getElementById("email") as HTMLInputElement).value,
      phone: (document.getElementById("phone") as HTMLInputElement).value,
    });
    setUser(updated);
    } catch (err: any) {
      console.error("Save profile failed", err);
    } finally {
      setSaving(false);
    }
  };

  /* ----------  BUSINESS  ---------- */
  const saveBusiness = async () => {
      setSaving(true);
      try{
    const updated = await updateOrganization({
      businessType: businessType,
      website: (document.getElementById("website") as HTMLInputElement).value,
      address: (document.getElementById("address") as HTMLTextAreaElement).value,
      registrationNumber: (document.getElementById("regNumber") as HTMLInputElement).value,
      taxId: (document.getElementById("taxId") as HTMLInputElement).value,
    });
    setDirty(false); // success → green "Saved"
    setUser(updated);
    } catch (err: any) {
        setDirty(true); // error → back to "Save Changes"
      console.error("Save organization details failed", err);
    } finally {
      setSaving(false);
    }
  };

  /* ----------  CALLBACK  ---------- */
  const saveCallback = async () => {
      setSaving(true);
      try{
    const updated = await updateCallbackUrl(
    {
          callbackUrl: (document.getElementById("callbackUrl") as HTMLInputElement).value;
    setUser(updated);
    setDirty(false); // success → green "Saved"
    } catch (err: any) {
         setDirty(true); // error → back to "Save Changes"
      console.error("Save callback URL failed", err);
    } finally {
      setSaving(false);
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2"><User className="h-4 w-4" />Profile</TabsTrigger>
          {user.role === "USER" && (
            <TabsTrigger value="business" className="flex items-center gap-2"><Building2 className="h-4 w-4" />Business</TabsTrigger>
          )}
         {/* <TabsTrigger value="security" className="flex items-center gap-2"><Shield className="h-4 w-4" />Security</TabsTrigger> **/}
          <TabsTrigger value="api" className="flex items-center gap-2"><Key className="h-4 w-4" />API & Keys</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>First Name</Label><Input id = "firstName" defaultValue={user.firstName} onChange={handleFieldChange}/></div>
                <div className="space-y-2"><Label>Last Name</Label><Input id = "lastName" defaultValue={user.lastName} onChange={handleFieldChange} /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" id = "email" defaultValue={user.email} onChange={handleFieldChange}/></div>
              <div className="space-y-2"><Label>Phone</Label><Input id = "phone" defaultValue={user.phone}  onChange={handleFieldChange} /></div>
             <Button
                               onClick={saveProfile}
                               disabled={saving}
                               className="w-36"
                             >
                               {saving ? (
                                 <span className="flex items-center justify-center space-x-1 w-full">
                                   <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
                                   <span className="h-1 w-1 animate-pulse rounded-full bg-white animation-delay-150" />
                                   <span className="h-1 w-1 animate-pulse rounded-full bg-white animation-delay-300" />
                                 </span>
                               ) : dirty ? (
                                 "Save Changes"
                               ) : (
                                 <span className="flex items-center space-x-1">
                                   <Check className="h-4 w-4 text-green-300" />
                                   <span className="text-green-300">Saved</span>
                                 </span>
                               )}
                             </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab (admin only) */}
        {user.role === "USER" && (
          <TabsContent value="business" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Organization Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label>Organization Name</Label><Input id="orgName" defaultValue={user.organization.name} onChange={handleFieldChange}/></div>
                <div className="grid grid-cols-2 gap-4">

                    <div className="space-y-2">
                      <Label>Business Type</Label>
                      <Select
                        value={businessType}
                        onValueChange={(val) => {
                            setBusinessType(val);
                            handleFieldChange(); // ← flips label
                          }}
                        disabled={!user?.organization?.businessType}
                      >
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
                    </div>
                  <div className="space-y-2"><Label>Website</Label><Input id ="website" defaultValue={user.organization.website}  onChange={handleFieldChange}/></div>
                </div>
                <div className="space-y-2"><Label>Address</Label><Textarea id = "address" defaultValue={user.organization.address}  onChange={handleFieldChange}/></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Registration Number</Label><Input id = "regNumber" defaultValue={user.organization.registrationNumber}  onChange={handleFieldChange}/></div>
                  <div className="space-y-2"><Label>Tax ID</Label><Input id = "taxId" defaultValue={user.organization.taxId} /></div>
                </div>
                <Button
                  onClick={saveBusiness}
                  disabled={saving}
                  className="w-36"
                >
                  {saving ? (
                    <span className="flex items-center justify-center space-x-1 w-full">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
                      <span className="h-1 w-1 animate-pulse rounded-full bg-white animation-delay-150" />
                      <span className="h-1 w-1 animate-pulse rounded-full bg-white animation-delay-300" />
                    </span>
                  ) : dirty ? (
                    "Save Changes"
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Check className="h-4 w-4 text-green-300" />
                      <span className="text-green-300">Saved</span>
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Security Tab */}
       {/* <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5"><Label>Enable 2FA</Label><p className="text-sm text-muted-foreground">Use your phone to verify identity</p></div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>*/}

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
                          {/*<div className="space-y-2">
                            <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                            <p className="font-medium">
                              GHS {user.subscription.amount.toLocaleString()}/{user.subscription.billingCycle}
                            </p>
                          </div> **/}
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

                <div className="space-y-2">
                  <Label>X-Callback-Url</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="callbackUrl"
                      value={user?.subscription?.callbackUrl ?? ""}
                      onChange={(e) => {setUser({ ...user, subscription: { ...user.subscription, callbackUrl: e.target.value } });handleFieldChange();}}
                      placeholder="https://my.app/webhook"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(callbackUrl, "callbackUrl")}
                    >
                      {copied === "callbackUrl" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

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
              <Button
                                onClick={saveCallback}
                                disabled={saving}
                                className="w-36"
                              >
                                {saving ? (
                                  <span className="flex items-center justify-center space-x-1 w-full">
                                    <span className="h-1 w-1 animate-pulse rounded-full bg-white" />
                                    <span className="h-1 w-1 animate-pulse rounded-full bg-white animation-delay-150" />
                                    <span className="h-1 w-1 animate-pulse rounded-full bg-white animation-delay-300" />
                                  </span>
                                ) : dirty ? (
                                  "Save Changes"
                                ) : (
                                  <span className="flex items-center space-x-1">
                                    <Check className="h-4 w-4 text-green-300" />
                                    <span className="text-green-300">Saved</span>
                                  </span>
                                )}
                              </Button>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}