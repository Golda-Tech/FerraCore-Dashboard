"use client"

import { useState, useEffect } from "react"
import { IconPlus, IconSearch, IconDownload, IconEye, IconTrash, IconUserPlus, IconShield, IconUser, IconCrown, IconLoader } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation";
import api from "@/lib/api"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getUser } from "@/lib/auth"
import { LoginResponse } from "@/types/auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

/* ---- types that mirror backend ---- */
type Summary = {
  partnerId: string
  partnerName: string
  totalCountTransactions: string
  totalSuccessfulAmountTransactions: number
  failedTransactionsCount: string
  successfulTransactionsCount: string
}

type Subscription = {
  plan: string
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  billingCycle: string
  nextBilling: string
  callbackUrl: string | null
  whitelistedNumber1: string | null
  whitelistedNumber2: string | null
  whitelistedNumber3: string | null
  whitelistedNumber4: string | null
  amount: number
  currency: string
}

type Organization = {
  id: string
  name: string
  businessType: string | null
  address: string | null
  partnerId: string | null
  registrationNumber: string | null
  taxId: string | null
  website: string | null
}

type BackendUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  isFirstTimeUser: boolean
  phone: string | null
  userRoles: "SUPER_ADMIN" | "GA_ADMIN" | "BUSINESS_ADMIN" | "BUSINESS_FINANCE" | "BUSINESS_OPERATOR"
  organization: Organization
  subscription: Subscription
  apiCredentials: { subscriptionKey: string; subscriptionSecret: string }
  summary: Summary | null
}

/* ---- API Request Type ---- */
interface SubscriptionManagementRequest {
  organizationId: string
  action: "ACTIVATE" | "DEACTIVATE" | "CANCEL"
}

/* ---- table row shape ---- */
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: BackendUser["userRoles"]
  status: Subscription["status"]
  lastLogin: string
  createdAt: string
  transactionCount: number
  totalVolume: number
  organizationName: string
  organizationId: string  // This comes from u.organization.id
  plan: string
}

/* ---- loading action type ---- */
type LoadingAction = {
  organizationId: string
  action: "activate" | "deactivate" | "cancel" | "view"
} | null

export function UserManagementContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null)
  const [alertOpen, setAlertOpen] = useState<string | null>(null)
  const router = useRouter();

  // Get current logged-in user on mount
  useEffect(() => {
    const user = getUser()
    setCurrentUser(user)
  }, [])

  /* ---------- fetch partners ---------- */
  useEffect(() => {
    async function loadPartners() {
      try {
        const res = await api.get("/api/v1/auth/profile/partners")
        const data: BackendUser[] = res.data

        console.log("Raw API response:", data) // Debug log

        const isSuperAdmin = currentUser?.role === "SUPER_ADMIN"
        let filteredData = data

        if (!isSuperAdmin) {
          filteredData = data.filter((u) => u.organization?.name !== "Ferracore Technologies")
        }

        // Map to User format - ensure organizationId is extracted from organization.id
        const mappedData = filteredData.map((u) => {
          // Extract organizationId from the organization object
          const orgId = u.organization?.partnerId
          const orgName = u.organization?.name || "Unknown"

          if (!orgId) {
            console.warn(`Missing organization ID for user: ${u.email}`, u)
          }

          return {
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.userRoles,
            status: u.subscription?.status || "PENDING",
            lastLogin: "Never",
            createdAt: new Date().toISOString().split("T")[0],
            transactionCount: Number(u.summary?.totalCountTransactions ?? 0),
            totalVolume: u.summary?.totalSuccessfulAmountTransactions ?? 0,
            organizationName: orgName,
            organizationId: orgId || u.id, // Fallback to user id if organization id is missing
            plan: u.subscription?.plan || "N/A",
          }
        })

        console.log("Mapped users with organizationIds:", mappedData.map(u => ({
          name: u.organizationName,
          orgId: u.organizationId
        })))

        setUsers(mappedData)
      } catch (err: any) {
        const msg = err.response?.data?.detail || err.response?.data?.title || err.message || "Failed to load partners"
        console.error("Failed to load partners:", err)
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (currentUser !== null) {
      loadPartners()
    }
  }, [currentUser])

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Partners…</p>
        </div>
      </div>
    )

  /* ---------- filters ---------- */
  const filteredUsers = users.filter((u) => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email} ${u.organizationName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesStatus = statusFilter === "all" || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  /* ---------- helpers ---------- */
  const getRoleIcon = (r: string) => {
    switch (r) {
      case "SUPER_ADMIN":
        return <IconCrown className="h-4 w-4" />
      case "GA_ADMIN":
        return <IconShield className="h-4 w-4" />
      default:
        return <IconUser className="h-4 w-4" />
    }
  }
  const getRoleBadgeVariant = (r: string) => (r === "SUPER_ADMIN" ? "destructive" : r === "GA_ADMIN" ? "default" : "secondary")
  const getStatusBadgeVariant = (s: string) => (s === "ACTIVE" ? "default" : s === "INACTIVE" ? "secondary" : "outline")

  /* ---------- export to PDF ---------- */
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Partner Management Report", 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Generated by: ${currentUser?.email || 'Unknown'} (${currentUser?.role || 'Unknown Role'})`, 14, 36)
    doc.setFontSize(12)
    doc.text(`Total Partners: ${users.length}`, 14, 46)
    doc.text(`Active Partners: ${users.filter((u) => u.status === "ACTIVE").length}`, 14, 54)
    doc.text(`Pending Approval: ${users.filter((u) => u.status === "PENDING").length}`, 14, 62)

    const tableData = filteredUsers.map((u) => [
      u.organizationName,
      u.email,
      u.role.replace("_", " "),
      u.status,
      u.transactionCount.toLocaleString(),
      u.totalVolume.toLocaleString()
    ])

    autoTable(doc, {
      startY: 70,
      head: [["Partner", "Email", "Role", "Status", "Transactions", "Volume (GHS)"]],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    })

    doc.save(`partners-report-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  /* ---------- check if specific action is loading ---------- */
  const isActionLoading = (organizationId: string, action: "activate" | "deactivate" | "cancel" | "view") => {
    return loadingAction?.organizationId === organizationId && loadingAction?.action === action
  }

  /* ---------- manage partner status ---------- */
  const handleManageAction = async (organizationId: string, action: "activate" | "deactivate" | "cancel") => {
    // Validate organizationId before making API call
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Invalid organization ID",
        variant: "destructive",
      })
      return
    }

    setLoadingAction({ organizationId, action })

    try {
      // Map action to API format
      const apiAction: SubscriptionManagementRequest["action"] =
        action === "activate" ? "activate" :
        action === "deactivate" ? "deactivate" :
        "cancel"

      const request: SubscriptionManagementRequest = {
        organizationId,  // This comes from the loadPartners response
        action: apiAction,
      }

      console.log("Sending manage request:", request) // Debug log

      await api.post("/api/v1/subscriptions/manage", request)

      // Update local state based on action
      let newStatus: "ACTIVE" | "INACTIVE" | "PENDING"
      switch (action) {
        case "activate":
          newStatus = "ACTIVE"
          break
        case "deactivate":
          newStatus = "INACTIVE"
          break
        case "cancel":
          setUsers((prev) => prev.filter((u) => u.organizationId !== organizationId))
          toast({
            title: "Success",
            description: "Partner has been cancelled and removed from the list.",
          })
          setAlertOpen(null)
          setLoadingAction(null)
          return
        default:
          newStatus = "PENDING"
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.organizationId === organizationId ? { ...u, status: newStatus } : u
        )
      )

      toast({
        title: "Success",
        description: `Partner has been ${action}d successfully.`,
      })
      setAlertOpen(null)
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.title || err.message || `Failed to ${action} partner`
      console.error(`Failed to ${action} partner:`, err)
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setLoadingAction(null)
    }
  }

  /* ---------- view details ---------- */
  const handleViewDetails = async (organizationId: string) => {
    if (!organizationId) {
      toast({
        title: "Error",
        description: "Invalid organization ID",
        variant: "destructive",
      })
      return
    }

    setLoadingAction({ organizationId, action: "view" })

    // Simulate loading for navigation
    await new Promise(resolve => setTimeout(resolve, 500))

    router.push(`/partner-dashboard/${organizationId}`)
    setLoadingAction(null)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Partner Management</h2>
          <p className="text-muted-foreground">
            Manage partners and their roles
            {currentUser?.role === "SUPER_ADMIN" && (
              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">SUPER_ADMIN View</span>
            )}
          </p>
        </div>
      </div>

      {/* stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Onboarded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.status === "ACTIVE").length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <IconUserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.status === "PENDING").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting activation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <IconCrown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.role === "GA_ADMIN" || u.role === "SUPER_ADMIN").length}</div>
            <p className="text-xs text-muted-foreground">GA & Super Admin</p>
          </CardContent>
        </Card>
      </div>

      {/* filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              <SelectItem value="GA_ADMIN">GA Admin</SelectItem>
              <SelectItem value="BUSINESS_ADMIN">Business Admin</SelectItem>
              <SelectItem value="BUSINESS_FINANCE">Business Finance</SelectItem>
              <SelectItem value="BUSINESS_OPERATOR">Business Operator</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => router.push("/admin-register")}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* table */}
      <Card>
        <CardHeader>
          <CardTitle>Partners</CardTitle>
          <CardDescription>Manage partner accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-center">Transactions</TableHead>
                <TableHead>Volume (GHS)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.organizationName}</div>
                    <div className="text-sm text-muted-foreground">{u.email}</div>
                    {/* Debug: Show org ID in development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-400">ID: {u.organizationId}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(u.role)} className="flex items-center gap-1 w-fit">
                      {getRoleIcon(u.role)}
                      {(u.role || "").replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(u.status)}>{u.status}</Badge>
                  </TableCell>
                  <TableCell>{u.plan}</TableCell>
                  <TableCell className="text-center">{u.transactionCount.toLocaleString()}</TableCell>
                  <TableCell>₵{u.totalVolume.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                       {/*  <DropdownMenuItem
                          onClick={() => handleViewDetails(u.organizationId)}
                          disabled={isActionLoading(u.organizationId, "view")}
                        >
                          {isActionLoading(u.organizationId, "view") ? (
                            <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <IconEye className="mr-2 h-4 w-4" />
                          )}
                          View Details
                        </DropdownMenuItem> */}

                        {u.status === "PENDING" && (
                          <DropdownMenuItem
                            onClick={() => handleManageAction(u.organizationId, "activate")}
                            disabled={isActionLoading(u.organizationId, "activate")}
                          >
                            {isActionLoading(u.organizationId, "activate") ? (
                              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <IconUserPlus className="mr-2 h-4 w-4" />
                            )}
                            Activate
                          </DropdownMenuItem>
                        )}

                        {u.status === "ACTIVE" && (
                          <DropdownMenuItem
                            onClick={() => handleManageAction(u.organizationId, "deactivate")}
                            disabled={isActionLoading(u.organizationId, "deactivate")}
                          >
                            {isActionLoading(u.organizationId, "deactivate") ? (
                              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <IconShield className="mr-2 h-4 w-4" />
                            )}
                            Deactivate
                          </DropdownMenuItem>
                        )}

                        {u.status === "INACTIVE" && (
                          <DropdownMenuItem
                            onClick={() => handleManageAction(u.organizationId, "activate")}
                            disabled={isActionLoading(u.organizationId, "activate")}
                          >
                            {isActionLoading(u.organizationId, "activate") ? (
                              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <IconUserPlus className="mr-2 h-4 w-4" />
                            )}
                            Activate
                          </DropdownMenuItem>
                        )}

                        <AlertDialog
                          open={alertOpen === u.organizationId}
                          onOpenChange={(open) => setAlertOpen(open ? u.organizationId : null)}
                        >
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <IconTrash className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Partner</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel {u.organizationName}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setAlertOpen(null)}>
                                Keep Partner
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleManageAction(u.organizationId, "cancel")}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={isActionLoading(u.organizationId, "cancel")}
                              >
                                {isActionLoading(u.organizationId, "cancel") ? (
                                  <IconLoader className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                Confirm Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}