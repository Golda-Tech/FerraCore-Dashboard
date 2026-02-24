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
import { getUser } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  /* ---------- read user from localStorage on mount ---------- */
  useEffect(() => {
    const stored = getUser();
    console.log("user response:", stored?.organizationName);
    setOrgName(stored?.organizationName ?? "");
  }, []);

  /* ---------- fetch partners (only once orgName is ready) ---------- */
  useEffect(() => {
    // Don't fetch until orgName is populated
    if (!orgName) return;

    let cancelled = false;

    async function loadPartners() {
      setLoading(true);
      try {
        const res = await api.get<BackendUser[]>(
          `/api/v1/auth/profile/users?organizationName=${encodeURIComponent(orgName)}`
        );
        const data = res.data;

        if (!cancelled) {
          setUsers(data.map((u) => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.userRoles,
            status: u.subscription.status,
            lastLogin: "Never",
            createdAt: new Date().toISOString().split("T")[0],
            transactionCount: Number(u.summary?.totalCountTransactions ?? 0),
            totalVolume: u.summary?.totalSuccessfulAmountTransactions ?? 0,
          })));
        }
      } catch (err: any) {
        if (!cancelled) {
          const problem = err.response?.data;
          const userMsg =
            problem?.detail ||
            problem?.title ||
            problem?.message ||
            err.response?.statusText ||
            err.message ||
            "Failed to fetch partners";
          console.error(userMsg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPartners();

    return () => { cancelled = true; };
  }, [orgName])

  /* ---------- loading ---------- */
  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {/* spinning ring */}
            <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">Loading Users…</p>
        </div>
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

  /* ---------- export to PDF ---------- */
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text("Users Management Report", 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
    doc.text(`Organization: ${orgName || "Unknown"}`, 14, 36)
    doc.setFontSize(12)
    doc.text(`Total Users: ${users.length}`, 14, 46)
    doc.text(`Active Users: ${users.filter((u) => u.status === "ACTIVE").length}`, 14, 54)

    const tableData = filteredUsers.map((u) => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      u.role.replace("_", " "),
      u.status,
      u.transactionCount.toLocaleString(),
      `₵${u.totalVolume.toLocaleString()}`,
    ])

    autoTable(doc, {
      startY: 62,
      head: [["Name", "Email", "Role", "Status", "Transactions", "Volume (GHS)"]],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    })

    doc.save(`users-report-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  /* ---------- export to CSV ---------- */
  const handleExportCSV = () => {
    const csvContent = [
      "Name,Email,Role,Status,Transactions,Volume (GHS)",
      ...filteredUsers.map((u) =>
        [
          `${u.firstName} ${u.lastName}`,
          u.email,
          u.role.replace("_", " "),
          u.status,
          u.transactionCount.toLocaleString(),
          u.totalVolume.toLocaleString(),
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `users-report-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
          <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground">
            Manage users and their roles within {orgName || "your organization"}
          </p>
        </div>
      </div>

      {/* stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><IconUser className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.length}</div><p className="text-xs text-muted-foreground">Onboarded</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Active Users</CardTitle><IconShield className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter((u) => u.status === "ACTIVE").length}</div><p className="text-xs text-muted-foreground">Currently active</p></CardContent></Card>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPDF}>
                <IconDownload className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <IconDownload className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
         {/* <Button size="sm"><IconPlus className="mr-2 h-4 w-4" />Add Partner</Button> **/}
        </div>
      </div>

      {/* table */}
      <Card><CardHeader><CardTitle>Users</CardTitle><CardDescription>Manage user accounts and permissions</CardDescription></CardHeader><CardContent>
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