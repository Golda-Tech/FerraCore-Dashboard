"use client"

import { useState, useEffect } from "react"
import { IconPlus, IconSearch, IconDownload, IconEdit, IconTrash, IconUserPlus, IconShield, IconUser, IconCrown } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
import { LoginResponse } from "@/types/auth";
import { getUser } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

/* ---- shape that matches backend ---- */
type BackendUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  userRoles: "SUPER_ADMIN" | "GA_ADMIN" | "BUSINESS_ADMIN" | "BUSINESS_FINANCE" | "BUSINESS_OPERATOR"
  isFirstTimeUser?: boolean
  phone?: string
  organization: {
    name: string
    businessType: string
    address: string
    registrationNumber: string
    taxId: string
    website: string
  }
  subscription: {
    plan: string
    status: "ACTIVE" | "INACTIVE" | "PENDING"
    billingCycle: string
    nextBilling: string
    callbackUrl: string
    whitelistedNumber1: string
    whitelistedNumber2: string
    whitelistedNumber3: string
    whitelistedNumber4: string
    amount: number
    currency: string
  }
  apiCredentials: {
    subscriptionKey: string
    subscriptionSecret: string
  }
  summary: {
    partnerId: string
    partnerName: string
    totalCountTransactions: string
    totalSuccessfulAmountTransactions: number
    failedTransactionsCount: string
    successfulTransactionsCount: string
  }
}

/* ---- table row shape ---- */
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "SUPER_ADMIN" | "GA_ADMIN" | "BUSINESS_ADMIN" | "BUSINESS_FINANCE" | "BUSINESS_OPERATOR"
  status: "ACTIVE" | "INACTIVE" | "PENDING"
  lastLogin: string
  createdAt: string
  transactionCount: number
  totalVolume: number
}

export function UserManagementContent() {
 const [orgName, setOrgName] = useState<string>("");
 const [user, setUser] = useState<LoginResponse | null>(null);

    useEffect(() => {
      const stored = getUser();
      setUser(stored);
      console.log("user response:", stored?.organizationName);
      setOrgName(stored?.organizationName ?? "");
    }, []);

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)




  /* ---------- fetch partners ---------- */
  useEffect(() => {
    async function loadPartners() {
      try {

          // 1. Axios puts the result directly in 'data'
            const res = await api.get<BackendUser[]>(`/api/v1/auth/profile/users?organizationName=${encodeURIComponent(orgName)}`);

            // 2. Axios doesn't use .ok or .json().
            // If the request fails, it jumps straight to the catch block.
            const data = res.data;

        setUsers(data.map((u) => ({
          id: u.id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.userRoles,
          status: u.subscription.status,
          lastLogin: "Never", // backend does not provide it
          createdAt: new Date().toISOString().split("T")[0], // placeholder
          transactionCount: Number(u.summary?.totalCountTransactions ?? 0),
          totalVolume: u.summary?.totalSuccessfulAmountTransactions ?? 0,
        })))
      } catch (err) {
          const problem = err.response?.data;

                                      // 1.  Prefer RFC 7807 fields
                                      const userMsg =
                                        problem?.detail ||                       // "Invalid temporary password."
                                        problem?.title ||                        // "Internal Server Error"
                                        problem?.message ||                      // fallback
                                        err.response?.statusText ||              // "Internal Server Error"
                                        err.message ||                           // final fallback
                                        "Failed to fetch partners";

console.error(userMsg);
      } finally {
        setLoading(false)
      }
    }
    loadPartners()
  }, [orgName])

  /* ---------- loading ---------- */
  if (loading)
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p className="text-sm text-muted-foreground">Loading partners…</p>
      </div>
    )

  /* ---------- filters ---------- */
  const filteredUsers = users.filter((u) => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesStatus = statusFilter === "all" || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  /* ---------- helpers ---------- */
  const getRoleIcon = (r: string) => {
    switch (r) {
      case "SUPER_ADMIN": return <IconCrown className="h-4 w-4" />
      case "GA_ADMIN": return <IconShield className="h-4 w-4" />
      default: return <IconUser className="h-4 w-4" />
    }
  }
  const getRoleBadgeVariant = (r: string) => (r === "SUPER_ADMIN" ? "destructive" : r === "GA_ADMIN" ? "default" : "secondary")
  const getStatusBadgeVariant = (s: string) =>
    s === "ACTIVE" ? "default" : s === "INACTIVE" ? "secondary" : "outline"

  /* ---------- actions ---------- */
  const handleAddUser = () => { /* stub */ }
  const handleEditUser = () => { /* stub */ }
  const handleDeleteUser = (id: string) => setUsers((u) => u.filter((x) => x.id !== id))
  const handleStatusChange = (id: string, status: "ACTIVE" | "INACTIVE") =>
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, status } : x)))

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Partner Management</h2>
          <p className="text-muted-foreground">Manage partners and their roles</p>
        </div>
      </div>

      {/* stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Partners</CardTitle><IconUser className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.length}</div><p className="text-xs text-muted-foreground">Onboarded</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Partners</CardTitle><IconShield className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter((u) => u.status === "ACTIVE").length}</div><p className="text-xs text-muted-foreground">Currently active</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Approval</CardTitle><IconUserPlus className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter((u) => u.status === "PENDING").length}</div><p className="text-xs text-muted-foreground">Awaiting activation</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Administrators</CardTitle><IconCrown className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter((u) => u.role === "GA_ADMIN" || u.role === "SUPER_ADMIN").length}</div><p className="text-xs text-muted-foreground">GA & Super Admin</p></CardContent></Card>
      </div>

      {/* filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative"><IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search partners..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 w-[300px]" /></div>
          <Select value={roleFilter} onValueChange={setRoleFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Roles" /></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="SUPER_ADMIN">Super Admin</SelectItem><SelectItem value="GA_ADMIN">GA Admin</SelectItem><SelectItem value="BUSINESS_ADMIN">Business Admin</SelectItem><SelectItem value="BUSINESS_FINANCE">Business Finance</SelectItem><SelectItem value="BUSINESS_OPERATOR">Business Operator</SelectItem></SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem><SelectItem value="PENDING">Pending</SelectItem></SelectContent></Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm"><IconDownload className="mr-2 h-4 w-4" />Export</Button>
          <Button size="sm"><IconPlus className="mr-2 h-4 w-4" />Add Partner</Button>
        </div>
      </div>

      {/* table */}
      <Card><CardHeader><CardTitle>Users ({filteredUsers.length})</CardTitle><CardDescription>Manage user accounts and permissions</CardDescription></CardHeader><CardContent>
        <Table><TableHeader><TableRow><TableHead>Partner</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Transactions</TableHead><TableHead>Volume (GHS)</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell><div className="font-medium">{u.firstName} {u.lastName}</div><div className="text-sm text-muted-foreground">{u.email}</div></TableCell>
                <TableCell><Badge variant={getStatusBadgeVariant(u.role)} className="flex items-center gap-1 w-fit">{getRoleIcon(u.role)}{u.role.replace("_", " ")}</Badge></TableCell>
                <TableCell><Badge variant={getStatusBadgeVariant(u.status)}>{u.status}</Badge></TableCell>
                <TableCell>{u.transactionCount.toLocaleString()}</TableCell>
                <TableCell>₵{u.totalVolume.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">Actions</Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setSelectedUser(u); setIsEditUserOpen(true) }}><IconEdit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                      {u.status === "PENDING" && <DropdownMenuItem onClick={() => handleStatusChange(u.id, "ACTIVE")}><IconUserPlus className="mr-2 h-4 w-4" />Activate</DropdownMenuItem>}
                      {u.status === "ACTIVE" && <DropdownMenuItem onClick={() => handleStatusChange(u.id, "INACTIVE")}><IconUser className="mr-2 h-4 w-4" />Deactivate</DropdownMenuItem>}
                      <AlertDialog><AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}><IconTrash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete Partner</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete {u.firstName} {u.lastName}?</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(u.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent></AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  )
}