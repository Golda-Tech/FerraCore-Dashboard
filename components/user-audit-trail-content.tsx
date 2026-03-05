"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Download,
  Eye,
  ArrowLeft,
  Clock,
  Activity,
  User,
  Globe,
  Calendar,
  Timer,
  Shield,
  MoreHorizontal,
  RefreshCw,
  LogIn,
  LogOut,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface AuditEvent {
  action: string;
  menu: string;
  ipAddress: string;
  durationSeconds: number;
  metadata: string;
  timestamp: string;
}

interface AuditTrailResponse {
  userId: number;
  userEmail: string;
  partnerId: string;
  partnerName: string;
  lastLoginAt: string;
  lastLogoutAt: string;
  lastLoginIp: string;
  totalSessionSeconds: number;
  recentEvents: AuditEvent[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDateTime(dt: string | null | undefined): string {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

function getActionBadgeVariant(
  action: string
): "default" | "secondary" | "destructive" | "outline" {
  const a = (action || "").toUpperCase();
  if (a.includes("LOGIN")) return "default";
  if (a.includes("LOGOUT")) return "secondary";
  if (a.includes("CREATE") || a.includes("ADD")) return "default";
  if (a.includes("DELETE") || a.includes("REMOVE")) return "destructive";
  if (a.includes("UPDATE") || a.includes("EDIT")) return "outline";
  return "secondary";
}

function getActionIcon(action: string) {
  const a = (action || "").toUpperCase();
  if (a.includes("LOGIN")) return <LogIn className="h-3.5 w-3.5" />;
  if (a.includes("LOGOUT")) return <LogOut className="h-3.5 w-3.5" />;
  if (a.includes("VIEW")) return <Eye className="h-3.5 w-3.5" />;
  return <Activity className="h-3.5 w-3.5" />;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function UserAuditTrailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailParam = searchParams.get("email") ?? "";
  const nameParam = searchParams.get("name") ?? "";

  const [audit, setAudit] = useState<AuditTrailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* search field */
  const [searchEmail, setSearchEmail] = useState(emailParam);
  const [currentEmail, setCurrentEmail] = useState(emailParam);
  const [currentName, setCurrentName] = useState(nameParam);

  /* detail dialog */
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  /* ---- fetch audit trail ---- */
  const fetchAudit = useCallback(
    async (email: string) => {
      if (!email) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<AuditTrailResponse>(
          `/api/v1/auth/audit-trail`,
          { params: { email } }
        );
        setAudit(res.data);
        setCurrentEmail(email);
        if (res.data.partnerName) setCurrentName(res.data.partnerName);
      } catch (err: any) {
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.statusText ||
          err.message ||
          "Failed to fetch audit trail";
        setError(msg);
        setAudit(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* auto-load if email was passed via query param */
  useEffect(() => {
    if (emailParam) {
      fetchAudit(emailParam);
    }
  }, [emailParam, fetchAudit]);

  /* ---- search handler ---- */
  const handleSearch = () => {
    const trimmed = searchEmail.trim();
    if (!trimmed) return;
    fetchAudit(trimmed);
  };

  /* ---- export PDF ---- */
  const handleExportPDF = () => {
    if (!audit) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("User Audit Trail Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text(`User: ${currentName || audit.userEmail}`, 14, 34);
    doc.text(`Email: ${audit.userEmail}`, 14, 40);
    doc.text(`Partner: ${audit.partnerName || "—"}`, 14, 46);
    doc.text(`Last Login: ${formatDateTime(audit.lastLoginAt)}`, 14, 52);
    doc.text(`Last Logout: ${formatDateTime(audit.lastLogoutAt)}`, 14, 58);
    doc.text(`Last IP: ${audit.lastLoginIp || "—"}`, 14, 64);
    doc.text(
      `Total Session: ${formatDuration(audit.totalSessionSeconds)}`,
      14,
      70
    );

    const rows = (audit.recentEvents || []).map((e) => [
      formatDateTime(e.timestamp),
      e.action || "—",
      e.menu || "—",
      e.ipAddress || "—",
      formatDuration(e.durationSeconds),
      e.metadata || "—",
    ]);

    autoTable(doc, {
      startY: 78,
      head: [["Timestamp", "Action", "Menu", "IP Address", "Duration", "Metadata"]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.save(
      `audit-trail-${audit.userEmail}-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };

  /* ---- export CSV ---- */
  const handleExportCSV = () => {
    if (!audit) return;

    const header = "Timestamp,Action,Menu,IP Address,Duration,Metadata";
    const rows = (audit.recentEvents || []).map((e) =>
      [
        formatDateTime(e.timestamp),
        `"${(e.action || "").replace(/"/g, '""')}"`,
        `"${(e.menu || "").replace(/"/g, '""')}"`,
        e.ipAddress || "",
        formatDuration(e.durationSeconds),
        `"${(e.metadata || "").replace(/"/g, '""')}"`,
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `audit-trail-${audit.userEmail}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/user-management")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              User Audit Trail
            </h2>
            {currentName && (
              <p className="text-muted-foreground text-sm">
                {currentName} — {currentEmail}
              </p>
            )}
          </div>
        </div>

        {/* Export */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={!audit}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPDF}>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search / Find user */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Find User</CardTitle>
          <CardDescription>
            Enter a user&apos;s email address to view their audit trail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter user email…"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                className="pl-8"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !searchEmail.trim()}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading audit trail…
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit data */}
      {audit && !loading && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Last Login
                </CardTitle>
                <LogIn className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {formatDateTime(audit.lastLoginAt)}
                </div>
                <p className="text-xs text-muted-foreground">
                  IP: {audit.lastLoginIp || "—"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Last Logout
                </CardTitle>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {formatDateTime(audit.lastLogoutAt)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Partner: {audit.partnerName || "—"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Session Time
                </CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(audit.totalSessionSeconds)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cumulative duration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Events
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(audit.recentEvents || []).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recent activity events
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User info bar */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-medium">{audit.userId}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{audit.userEmail}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Partner ID:</span>
                  <span className="font-medium">
                    {audit.partnerId || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Partner:</span>
                  <span className="font-medium">
                    {audit.partnerName || "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Activity log for {audit.userEmail}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Menu</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(audit.recentEvents || []).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No events found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      audit.recentEvents.map((evt, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="whitespace-nowrap text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatDateTime(evt.timestamp)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getActionBadgeVariant(evt.action)}
                              className="flex items-center gap-1 w-fit"
                            >
                              {getActionIcon(evt.action)}
                              {evt.action || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>{evt.menu || "—"}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {evt.ipAddress || "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatDuration(evt.durationSeconds)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setSelectedEvent(evt)}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Total row */}
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                <span>
                  Showing {(audit.recentEvents || []).length} event(s)
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty state when no email entered yet and no data */}
      {!audit && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Shield className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">
            No Audit Trail Loaded
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Use the search box above to enter a user&apos;s email, or navigate
            here from the Users Management screen.
          </p>
        </div>
      )}

      {/* Event detail dialog */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => {
          if (!open) setSelectedEvent(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              Detailed information about this audit event
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Action
                  </Label>
                  <p className="font-medium">{selectedEvent.action || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Menu</Label>
                  <p className="font-medium">{selectedEvent.menu || "—"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Timestamp
                  </Label>
                  <p className="font-medium">
                    {formatDateTime(selectedEvent.timestamp)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    IP Address
                  </Label>
                  <p className="font-medium font-mono text-sm">
                    {selectedEvent.ipAddress || "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Duration
                  </Label>
                  <p className="font-medium">
                    {formatDuration(selectedEvent.durationSeconds)}
                  </p>
                </div>
              </div>

              {selectedEvent.metadata && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Metadata
                  </Label>
                  <div className="mt-1 rounded-md bg-muted p-3">
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {selectedEvent.metadata}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

