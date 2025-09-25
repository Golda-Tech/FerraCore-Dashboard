"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  User,
  Building2,
  Shield,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Check,
  AlertTriangle,
  Globe,
  CreditCard,
  Calendar,
  Smartphone,
  Mail,
  Bell,
  Monitor,
} from "lucide-react"

// Mock user data
const mockUser = {
  id: "user_123",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@company.com",
  phone: "+233 24 123 4567",
  role: "admin",
  organization: {
    name: "Acme Corporation",
    businessType: "Technology",
    address: "123 Business Street, Accra, Ghana",
    registrationNumber: "REG-2024-001",
    taxId: "TAX-123456789",
    website: "https://acme.com",
  },
  subscription: {
    plan: "Professional",
    status: "active",
    billingCycle: "monthly",
    nextBilling: "2024-02-15",
    amount: 299,
    currency: "GHS",
  },
  apiCredentials: {
    serviceId: "srv_live_abc123def456",
    clientToken: "ct_live_xyz789uvw012",
    secretKey: "sk_live_mno345pqr678stu901vwx234",
    publicKey: "pk_live_ghi567jkl890",
  },
}

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile")
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [showClientToken, setShowClientToken] = useState(false)
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const [copied, setCopied] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  const generateNewKey = async () => {
    setIsGeneratingKey(true)
    // Simulate API call
    setTimeout(() => {
      setIsGeneratingKey(false)
    }, 2000)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          {mockUser.role === "admin" && (
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business
            </TabsTrigger>
          )}
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API & Keys
          </TabsTrigger>
        </TabsList>


        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={mockUser.firstName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={mockUser.lastName} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={mockUser.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue={mockUser.phone} />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Business Tab */}
        {mockUser.role === "admin" && (
          <TabsContent value="business" className="space-y-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>Manage your organization information and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input id="orgName" defaultValue={mockUser.organization.name} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select defaultValue={mockUser.organization.businessType.toLowerCase()}>
                        <SelectTrigger>
                          <SelectValue />
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
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" defaultValue={mockUser.organization.website} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea id="address" defaultValue={mockUser.organization.address} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regNumber">Registration Number</Label>
                      <Input id="regNumber" defaultValue={mockUser.organization.registrationNumber} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input id="taxId" defaultValue={mockUser.organization.taxId} />
                    </div>
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Configuration</CardTitle>
                  <CardDescription>Configure your payment service settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Currency</Label>
                      <Select defaultValue="GHS">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GHS">Ghana Cedi (GHS)</SelectItem>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Transaction Limit</Label>
                      <Input defaultValue="100,000" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-approve transactions</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve transactions under GHS 1,000
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email notifications for large transactions</Label>
                      <p className="text-sm text-muted-foreground">Get notified for transactions over GHS 10,000</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Button>Save Configuration</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Use your phone to verify your identity when signing in
                    </p>
                  </div>
                  <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                </div>
                {twoFactorEnabled && (
                  <div className="space-y-2">
                    <Label>Phone Number for 2FA</Label>
                    <Input defaultValue={mockUser.phone} />
                    <Button size="sm">Send Verification Code</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Whitelisted IPs */}
            <Card>
              <CardHeader>
                <CardTitle>Whitelisted IPs</CardTitle>
                <CardDescription>
                  Restrict account access to specific IP addresses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newIp">Add New IP</Label>
                  <div className="flex space-x-2">
                    <Input id="newIp" placeholder="e.g. 192.168.0.1" />
                    <Button size="sm">Add</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Example of whitelisted IPs */}
                  {["192.168.0.1", "102.176.45.23"].map((ip, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <p className="font-mono">{ip}</p>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Whitelisted Mobile Numbers */}
            <Card>
              <CardHeader>
                <CardTitle>Whitelisted Mobile Numbers</CardTitle>
                <CardDescription>
                  Only allow login and notifications from verified numbers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newNumber">Add New Number</Label>
                  <div className="flex space-x-2">
                    <Input id="newNumber" placeholder="+233 24 000 0000" />
                    <Button size="sm">Add</Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {["+233 24 123 4567", "+233 20 765 4321"].map((num, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <p className="font-mono">{num}</p>
                      <Button variant="outline" size="sm">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about account activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email alerts for important activities</p>
                    </div>
                  </div>
                  <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive SMS alerts for critical activities</p>
                    </div>
                  </div>
                  <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <div className="space-y-0.5">
                      <Label>Login Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active login sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">Chrome on Windows • Accra, Ghana</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Mobile App</p>
                        <p className="text-sm text-muted-foreground">iPhone • Last seen 2 hours ago</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Revoke
                    </Button>
                  </div>
                </div>
                <Button variant="destructive" size="sm">
                  Sign out all other sessions
                </Button>
              </CardContent>
            </Card>
          </div>
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
                      <Badge className="bg-green-100 text-green-800">{mockUser.subscription.plan}</Badge>
                      <Badge variant="outline">{mockUser.subscription.status}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Billing Cycle</Label>
                    <p className="capitalize">{mockUser.subscription.billingCycle}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <p className="font-medium">
                      GHS {mockUser.subscription.amount.toLocaleString()}/{mockUser.subscription.billingCycle}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Next Billing</Label>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <p>{new Date(mockUser.subscription.nextBilling).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Billing
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Credentials</CardTitle>
                <CardDescription>Your API keys and service credentials for integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Service ID</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={mockUser.apiCredentials.serviceId} readOnly className="font-mono" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(mockUser.apiCredentials.serviceId, "serviceId")}
                            >
                              {copied === "serviceId" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Service ID</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Public Key</Label>
                    <div className="flex items-center space-x-2">
                      <Input value={mockUser.apiCredentials.publicKey} readOnly className="font-mono" />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(mockUser.apiCredentials.publicKey, "publicKey")}
                            >
                              {copied === "publicKey" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Public Key</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Client Token</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={showClientToken ? mockUser.apiCredentials.clientToken : "••••••••••••••••••••••••"}
                        readOnly
                        className="font-mono"
                      />
                      <Button variant="outline" size="sm" onClick={() => setShowClientToken(!showClientToken)}>
                        {showClientToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(mockUser.apiCredentials.clientToken, "clientToken")}
                            >
                              {copied === "clientToken" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Client Token</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Secret Key</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={showSecretKey ? mockUser.apiCredentials.secretKey : "••••••••••••••••••••••••"}
                        readOnly
                        className="font-mono"
                      />
                      <Button variant="outline" size="sm" onClick={() => setShowSecretKey(!showSecretKey)}>
                        {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(mockUser.apiCredentials.secretKey, "secretKey")}
                            >
                              {copied === "secretKey" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy Secret Key</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Keep your credentials secure</p>
                    <p>Never share your secret key or client token in public repositories or client-side code.</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Keys
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Regenerate API Keys</DialogTitle>
                        <DialogDescription>
                          This will generate new API keys and invalidate the current ones. Make sure to update your
                          integrations with the new keys.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={generateNewKey} disabled={isGeneratingKey}>
                          {isGeneratingKey ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            "Regenerate"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    API Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage & Limits</CardTitle>
                <CardDescription>Your current API usage and rate limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Monthly API Calls</Label>
                    <p className="text-2xl font-bold">12,847</p>
                    <p className="text-sm text-muted-foreground">of 50,000 limit</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Rate Limit</Label>
                    <p className="text-2xl font-bold">1,000</p>
                    <p className="text-sm text-muted-foreground">requests per minute</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Webhook Endpoints</Label>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">of 10 allowed</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Data Retention</Label>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
