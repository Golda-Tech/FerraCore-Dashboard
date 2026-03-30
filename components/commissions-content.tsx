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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Percent,
  Coins,
  TrendingUp,
  Building2,
  Pencil,
  Save,
} from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getCommissionFees, updateCommissionFees } from "@/lib/payment";
import { getUser } from "@/lib/auth";
import { LoginResponse } from "@/types/auth";
import { toast } from "@/components/ui/use-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface PartnerBasic {
  id: string;
  email: string;
  organizationName: string;
}

interface CommissionRow {
  partnerName: string;
  email: string;
  transactionFee: string;
  recurringFee: string;
  cappedAmount: string;
  loading: boolean;
  error: boolean;
}

type BackendUser = {
  id: string;
  email: string;
  subscription?: { createdBy?: string | null };
  organization?: { name?: string; partnerId?: string | null };
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function CommissionsContent() {
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null);
  const router = useRouter();

  /* ---------- edit dialog state ---------- */
  const [editOpen, setEditOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<string>("");
  const [editTransactionFee, setEditTransactionFee] = useState("");
  const [editCappedAmount, setEditCappedAmount] = useState("");
  const [editRecurringFee, setEditRecurringFee] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const user = getUser();
    setCurrentUser(user);
  }, []);

  /* ---------- load partners then fetch fees for each ---------- */
  const loadCommissions = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get("/api/v1/auth/profile/partners");
      const data: BackendUser[] = res.data;

      const isSuperAdmin = currentUser?.userRoles === "SUPER_ADMIN";

      let filtered = data;
      if (!isSuperAdmin) {
        filtered = data.filter(
          (u) => u.organization?.name !== "Ferracore Technologies"
        );
      }

      // Exclude internal accounts
      const excludedCreators = [
        "ferracoretech@gmail.com",
        "scronfinkle@gmail.com",
      ];
      filtered = filtered.filter(
        (u) =>
          !excludedCreators.includes(
            u.subscription?.createdBy?.toLowerCase() ?? ""
          )
      );

      // Deduplicate by organization name
      const seen = new Set<string>();
      const partners: PartnerBasic[] = [];
      for (const u of filtered) {
        const orgName = u.organization?.name || "Unknown";
        const key = orgName.toUpperCase();
        if (!seen.has(key)) {
          seen.add(key);
          partners.push({
            id: u.id,
            email: u.email,
            organizationName: orgName,
          });
        }
      }

      // Initialize rows with loading state
      const initial: CommissionRow[] = partners.map((p) => ({
        partnerName: p.organizationName,
        email: p.email,
        transactionFee: "—",
        recurringFee: "—",
        cappedAmount: "—",
        loading: true,
        error: false,
      }));
      setCommissions(initial);
      setLoading(false);

      // Fetch fees for each partner concurrently (batched to avoid overload)
      const BATCH_SIZE = 5;
      for (let i = 0; i < partners.length; i += BATCH_SIZE) {
        const batch = partners.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((p) => getCommissionFees(p.organizationName))
        );

        setCommissions((prev) => {
          const updated = [...prev];
          for (let j = 0; j < batch.length; j++) {
            const idx = i + j;
            const result = results[j];
            if (result.status === "fulfilled") {
              updated[idx] = {
                ...updated[idx],
                transactionFee: result.value.transactionFee,
                recurringFee: result.value.recurringFee,
                cappedAmount: result.value.cappedAmount,
                loading: false,
                error: false,
              };
            } else {
              updated[idx] = {
                ...updated[idx],
                loading: false,
                error: true,
              };
            }
          }
          return updated;
        });
      }
    } catch (err) {
      console.error("Failed to load commissions:", err);
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser !== null) {
      loadCommissions();
    }
  }, [currentUser, loadCommissions]);

  /* ---------- edit handlers ---------- */
  const openEditDialog = (c: CommissionRow) => {
    setEditPartner(c.partnerName);
    setEditTransactionFee(c.transactionFee);
    setEditCappedAmount(c.cappedAmount);
    setEditRecurringFee(c.recurringFee);
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editPartner) return;
    setSaving(true);

    try {
      const updated = await updateCommissionFees(editPartner, {
        transactionFee: editTransactionFee,
        cappedAmount: editCappedAmount,
        recurringFee: editRecurringFee,
      });

      // Update local state
      setCommissions((prev) =>
        prev.map((c) =>
          c.partnerName === editPartner
            ? {
                ...c,
                transactionFee: updated.transactionFee,
                cappedAmount: updated.cappedAmount,
                recurringFee: updated.recurringFee,
              }
            : c
        )
      );

      toast({
        title: "Commission Updated",
        description: `Fees for ${editPartner} have been updated successfully.`,
      });
      setEditOpen(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update commission fees";
      console.error("Failed to update fees:", err);
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  /* ---------- derived ---------- */
  const filteredCommissions = commissions.filter((c) =>
    `${c.partnerName} ${c.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const loadedCount = commissions.filter((c) => !c.loading && !c.error).length;
  const avgTransactionFee =
    loadedCount > 0
      ? commissions
          .filter((c) => !c.loading && !c.error)
          .reduce((sum, c) => sum + parseFloat(c.transactionFee || "0"), 0) /
        loadedCount
      : 0;
  const avgRecurringFee =
    loadedCount > 0
      ? commissions
          .filter((c) => !c.loading && !c.error)
          .reduce((sum, c) => sum + parseFloat(c.recurringFee || "0"), 0) /
        loadedCount
      : 0;
  const avgCappedAmount =
    loadedCount > 0
      ? commissions
          .filter((c) => !c.loading && !c.error)
          .reduce((sum, c) => sum + parseFloat(c.cappedAmount || "0"), 0) /
        loadedCount
      : 0;

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (loading && commissions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">
            Loading commissions…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              RexHub Commissions
            </h2>
            <p className="text-sm text-muted-foreground">
              Partner transaction fees and commission structure
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadCommissions}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Partners
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With commission agreements
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Transaction Fee
            </CardTitle>
            <Percent className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {avgTransactionFee.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {loadedCount} partner{loadedCount !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Capped Amount
            </CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              GHS {avgCappedAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum fee per transaction
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Recurring Fee
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgRecurringFee.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              For recurring payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
          <CardDescription>
            Agreed transaction fees, capped amounts, and recurring fees per
            partner
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Partner</TableHead>
                  <TableHead className="text-center">
                    Transaction Fee (%)
                  </TableHead>
                  <TableHead className="text-center">
                    Capped Amount (GHS)
                  </TableHead>
                  <TableHead className="text-center">
                    Recurring Fee (%)
                  </TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No partners found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCommissions.map((c) => (
                    <TableRow key={c.partnerName}>
                      <TableCell>
                        <div className="font-medium">{c.partnerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {c.loading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin mx-auto text-muted-foreground" />
                        ) : c.error ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="font-semibold text-green-600">
                            {c.transactionFee}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {c.loading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin mx-auto text-muted-foreground" />
                        ) : c.error ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="font-semibold text-amber-600">
                            {parseFloat(c.cappedAmount).toFixed(2)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {c.loading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin mx-auto text-muted-foreground" />
                        ) : c.error ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span className="font-semibold text-purple-600">
                            {c.recurringFee}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {c.loading ? (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-500"
                          >
                            Loading…
                          </Badge>
                        ) : c.error ? (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-600 border-red-200"
                          >
                            Unavailable
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={c.loading || c.error}
                          onClick={() => openEditDialog(c)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <span>
              Showing {filteredCommissions.length} of {commissions.length}{" "}
              partners
            </span>
            {commissions.some((c) => c.loading) && (
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Fetching commission data…
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Commission Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Commission</DialogTitle>
            <DialogDescription>
              Update fees for{" "}
              <span className="font-semibold text-foreground">{editPartner}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="editTransactionFee">Transaction Fee (%)</Label>
              <Input
                id="editTransactionFee"
                type="number"
                step="0.01"
                min="0"
                value={editTransactionFee}
                onChange={(e) => setEditTransactionFee(e.target.value)}
                placeholder="e.g. 1.20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editCappedAmount">Capped Amount (GHS)</Label>
              <Input
                id="editCappedAmount"
                type="number"
                step="0.01"
                min="0"
                value={editCappedAmount}
                onChange={(e) => setEditCappedAmount(e.target.value)}
                placeholder="e.g. 30.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editRecurringFee">Recurring Fee (%)</Label>
              <Input
                id="editRecurringFee"
                type="number"
                step="0.01"
                min="0"
                value={editRecurringFee}
                onChange={(e) => setEditRecurringFee(e.target.value)}
                placeholder="e.g. 1.20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

