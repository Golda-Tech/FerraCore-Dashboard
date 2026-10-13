"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  History,
  Info,
  Landmark,
  Loader2,
  RefreshCw,
  Search,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import {
  MtnAccountResponse,
  getPartnerMtnAccount,
  listMtnAccounts,
  mtnErrorMessage,
  switchPartnerMtnAccount,
} from "@/lib/mtn-accounts";
import { toast } from "@/components/ui/use-toast";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type BackendPartner = {
  email: string;
  organization?: { name?: string; partnerId?: string | null };
};

interface RoutingRow {
  organizationId: string;
  organizationName: string;
  email: string;
  accountCode?: string;
  updatedAt?: string;
  loading: boolean;
  error?: string;
}

interface ChangeLogEntry extends MtnAccountResponse {
  changedAt: string;
}

// Stable colour per account code so the same tier looks the same everywhere
const ACCOUNT_STYLES = [
  { bar: "bg-slate-500", badge: "bg-slate-100 text-slate-800 border-slate-200", ring: "ring-slate-400" },
  { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-800 border-amber-200", ring: "ring-amber-400" },
  { bar: "bg-violet-500", badge: "bg-violet-100 text-violet-800 border-violet-200", ring: "ring-violet-400" },
  { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", ring: "ring-emerald-400" },
  { bar: "bg-sky-500", badge: "bg-sky-100 text-sky-800 border-sky-200", ring: "ring-sky-400" },
];

const formatDateParts = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : { date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function AccountRoutingContent() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<string[]>([]);
  const [rows, setRows] = useState<RoutingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);

  /* ---------- lookup ---------- */
  const [lookupId, setLookupId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<MtnAccountResponse | null>(null);
  const [lookupError, setLookupError] = useState("");

  /* ---------- switch dialog ---------- */
  const [switchTargets, setSwitchTargets] = useState<{ organizationId: string; organizationName: string; accountCode?: string }[]>([]);
  const [targetAccount, setTargetAccount] = useState("");
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const role = getUser()?.userRoles;
    if (role && role !== "SUPER_ADMIN" && role !== "GA_ADMIN") {
      router.replace("/dashboard");
    }
  }, [router]);

  const styleFor = useCallback(
    (code?: string) => {
      const idx = Math.max(0, accounts.indexOf(code ?? ""));
      return ACCOUNT_STYLES[idx % ACCOUNT_STYLES.length];
    },
    [accounts]
  );

  /* ---------- load accounts + partners, then each partner's routing ---------- */
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    setSelected(new Set());
    try {
      const [codes, partnersRes] = await Promise.all([
        listMtnAccounts(),
        api.get<BackendPartner[]>("/api/v1/auth/profile/partners"),
      ]);
      setAccounts(codes);

      const seen = new Set<string>();
      const partners: RoutingRow[] = [];
      for (const p of partnersRes.data) {
        const orgId = p.organization?.partnerId;
        if (!orgId || seen.has(orgId)) continue;
        seen.add(orgId);
        partners.push({
          organizationId: orgId,
          organizationName: p.organization?.name || "Unknown",
          email: p.email,
          loading: true,
        });
      }
      partners.sort((a, b) => a.organizationName.localeCompare(b.organizationName));
      setRows(partners);
      setLoading(false);

      const BATCH_SIZE = 5;
      for (let i = 0; i < partners.length; i += BATCH_SIZE) {
        const batch = partners.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(batch.map((p) => getPartnerMtnAccount(p.organizationId)));
        const byId = new Map<string, Partial<RoutingRow>>();
        results.forEach((r, j) => {
          byId.set(
            batch[j].organizationId,
            r.status === "fulfilled"
              ? { accountCode: r.value.accountCode, updatedAt: r.value.updatedAt, loading: false, error: undefined }
              : { loading: false, error: mtnErrorMessage(r.reason, "Unavailable") }
          );
        });
        setRows((prev) => prev.map((row) => (byId.has(row.organizationId) ? { ...row, ...byId.get(row.organizationId) } : row)));
      }
    } catch (err) {
      console.error("Failed to load MTN routing:", err);
      setLoadError(mtnErrorMessage(err, "Failed to load MTN account routing"));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- derived ---------- */
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of accounts) c[a] = 0;
    for (const r of rows) if (r.accountCode) c[r.accountCode] = (c[r.accountCode] ?? 0) + 1;
    return c;
  }, [accounts, rows]);
  const resolvedCount = rows.filter((r) => r.accountCode).length;
  // Nothing to switch to until a second MTN account is configured
  const canSwitch = accounts.length > 1;

  const filteredRows = rows.filter((r) => {
    if (accountFilter && r.accountCode !== accountFilter) return false;
    return `${r.organizationName} ${r.organizationId} ${r.email}`.toLowerCase().includes(searchTerm.toLowerCase());
  });
  const selectableFiltered = filteredRows.filter((r) => r.accountCode);
  const allSelected = selectableFiltered.length > 0 && selectableFiltered.every((r) => selected.has(r.organizationId));

  const toggleRow = (id: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });

  const toggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(selectableFiltered.map((r) => r.organizationId)) : new Set());

  /* ---------- actions ---------- */
  const applyResult = (res: MtnAccountResponse) => {
    setRows((prev) =>
      prev.map((r) =>
        r.organizationId === res.organizationId ? { ...r, accountCode: res.accountCode, updatedAt: res.updatedAt, error: undefined } : r
      )
    );
    setLookupResult((prev) => (prev?.organizationId === res.organizationId ? res : prev));
    if (res.previousAccountCode !== res.accountCode) {
      setChangeLog((prev) => [{ ...res, changedAt: new Date().toISOString() }, ...prev].slice(0, 20));
    }
  };

  const openSwitch = (targets: typeof switchTargets, preset?: string) => {
    setSwitchTargets(targets);
    const current = targets.length === 1 ? targets[0].accountCode : undefined;
    setTargetAccount(preset ?? accounts.find((a) => a !== current) ?? "");
  };

  const handleSwitch = async () => {
    if (!targetAccount || switchTargets.length === 0) return;
    setSwitching(true);
    let ok = 0;
    const failures: string[] = [];
    for (const t of switchTargets) {
      try {
        applyResult(await switchPartnerMtnAccount(t.organizationId, targetAccount));
        ok++;
      } catch (err) {
        failures.push(`${t.organizationName}: ${mtnErrorMessage(err, "failed")}`);
      }
    }
    setSwitching(false);
    setSwitchTargets([]);
    setSelected(new Set());

    if (ok > 0) {
      toast({
        title: "MTN account updated",
        description:
          switchTargets.length === 1
            ? `${switchTargets[0].organizationName} now collects into ${targetAccount}.`
            : `${ok} partner${ok !== 1 ? "s" : ""} moved to ${targetAccount}.`,
      });
    }
    if (failures.length > 0) {
      toast({ title: "Some switches failed", description: failures.join("\n"), variant: "destructive" });
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = lookupId.trim();
    if (!id) return;
    setLookupLoading(true);
    setLookupError("");
    setLookupResult(null);
    try {
      setLookupResult(await getPartnerMtnAccount(id));
    } catch (err) {
      setLookupError(mtnErrorMessage(err, "Lookup failed"));
    } finally {
      setLookupLoading(false);
    }
  };

  const switchSingleCurrent = switchTargets.length === 1 ? switchTargets[0].accountCode : undefined;

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  if (loading && rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 pt-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading MTN account routing…</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Accounts</h2>
            <p className="text-sm text-muted-foreground">
              Choose which MTN account each partner&apos;s collections are routed into
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loadError && (
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {!loading && !loadError && !canSwitch && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Fewer than two MTN account tiers are configured, so partners can&apos;t be switched yet. Other
            tiers appear here once they&apos;re added to the MTN provider configuration on the backend.
          </AlertDescription>
        </Alert>
      )}

      {/* Account lanes: one card per configured MTN account, click to filter */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((code) => {
          const style = styleFor(code);
          const count = counts[code] ?? 0;
          const share = resolvedCount > 0 ? (count / resolvedCount) * 100 : 0;
          const active = accountFilter === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setAccountFilter(active ? null : code)}
              className={`text-left rounded-xl border bg-card p-4 transition-all hover:shadow-md ${active ? `ring-2 ${style.ring}` : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">MTN account</span>
                <Landmark className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold">{code}</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${style.bar} transition-all`} style={{ width: `${share}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {count} partner{count !== 1 ? "s" : ""} · {share.toFixed(0)}%
                {active && " · filtering"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Partners table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Partner Routing</CardTitle>
            <CardDescription>
              Switches apply to the partner&apos;s next payment. Pending transactions finish on their original account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partner, ID or email…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              {accountFilter && (
                <Button variant="ghost" size="sm" onClick={() => setAccountFilter(null)}>
                  Clear filter: {accountFilter}
                </Button>
              )}
            </div>

            {selected.size > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
                <span className="text-sm font-medium">
                  {selected.size} partner{selected.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openSwitch(rows.filter((r) => selected.has(r.organizationId)))}
                  >
                    <Shuffle className="h-3.5 w-3.5 mr-1.5" />
                    Move selected…
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected}
                        disabled={!canSwitch}
                        onCheckedChange={(v) => toggleAll(v === true)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead className="text-center">MTN Account</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No partners found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRows.map((r) => (
                      <TableRow key={r.organizationId} data-state={selected.has(r.organizationId) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selected.has(r.organizationId)}
                            disabled={!r.accountCode || !canSwitch}
                            onCheckedChange={(v) => toggleRow(r.organizationId, v === true)}
                            aria-label={`Select ${r.organizationName}`}
                          />
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="font-medium">{r.organizationName}</div>
                          <div className="text-xs text-muted-foreground break-all">
                            <span className="font-mono">{r.organizationId}</span> · {r.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {r.loading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto text-muted-foreground" />
                          ) : r.error ? (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200" title={r.error}>
                              Unavailable
                            </Badge>
                          ) : (
                            <Badge variant="outline" className={styleFor(r.accountCode).badge}>
                              {r.accountCode}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(() => {
                            const parts = formatDateParts(r.updatedAt);
                            return parts ? (
                              <>
                                <div>{parts.date}</div>
                                <div>{parts.time}</div>
                              </>
                            ) : (
                              formatDate(r.updatedAt)
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={!r.accountCode || !canSwitch}
                            onClick={() => openSwitch([r])}
                            title={canSwitch ? "Switch MTN account" : "Only one account tier is configured"}
                            aria-label={`Switch MTN account for ${r.organizationName}`}
                          >
                            <Shuffle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>
                Showing {filteredRows.length} of {rows.length} partners
              </span>
              {rows.some((r) => r.loading) && (
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Fetching routing…
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Lookup by organization ID */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Look Up Partner
              </CardTitle>
              <CardDescription>Check a partner&apos;s routing by organization ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleLookup} className="flex gap-2">
                <Input
                  placeholder="e.g. ORG-000123"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  className="font-mono"
                />
                <Button type="submit" disabled={lookupLoading || !lookupId.trim()}>
                  {lookupLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                </Button>
              </form>
              {lookupError && <p className="text-sm text-red-600">{lookupError}</p>}
              {lookupResult && (
                <div className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{lookupResult.organizationName}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-muted-foreground">{lookupResult.organizationId}</span>
                    <Badge variant="outline" className={styleFor(lookupResult.accountCode).badge}>
                      {lookupResult.accountCode}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Updated {formatDate(lookupResult.updatedAt)}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={!canSwitch}
                    onClick={() => openSwitch([lookupResult])}
                  >
                    <Shuffle className="h-3.5 w-3.5 mr-1.5" />
                    Switch account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Changes made in this session */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Switches
              </CardTitle>
              <CardDescription>Changes made in this session</CardDescription>
            </CardHeader>
            <CardContent>
              {changeLog.length === 0 ? (
                <p className="text-sm text-muted-foreground">No switches yet.</p>
              ) : (
                <ul className="space-y-3">
                  {changeLog.map((c, i) => (
                    <li key={`${c.organizationId}-${c.changedAt}-${i}`} className="text-sm">
                      <div className="font-medium">{c.organizationName}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className={styleFor(c.previousAccountCode).badge}>
                          {c.previousAccountCode}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className={styleFor(c.accountCode).badge}>
                          {c.accountCode}
                        </Badge>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(c.changedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Switch dialog (single or bulk) */}
      <Dialog open={switchTargets.length > 0} onOpenChange={(open) => !open && !switching && setSwitchTargets([])}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch MTN Account</DialogTitle>
            <DialogDescription>
              {switchTargets.length === 1 ? (
                <>
                  Route collections for{" "}
                  <span className="font-semibold text-foreground">{switchTargets[0].organizationName}</span>
                </>
              ) : (
                <>
                  Route collections for{" "}
                  <span className="font-semibold text-foreground">{switchTargets.length} partners</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-center gap-3 rounded-lg bg-muted/50 p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Current</p>
                {switchSingleCurrent ? (
                  <Badge variant="outline" className={styleFor(switchSingleCurrent).badge}>
                    {switchSingleCurrent}
                  </Badge>
                ) : (
                  <Badge variant="outline">Mixed</Badge>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-4" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">New</p>
                <Badge variant="outline" className={styleFor(targetAccount).badge}>
                  {targetAccount || "—"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAccount">Route to</Label>
              <Select value={targetAccount} onValueChange={setTargetAccount} disabled={switching}>
                <SelectTrigger id="targetAccount" className="w-full">
                  <SelectValue placeholder="Choose an MTN account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                      {a === switchSingleCurrent && " (current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {switchTargets.length > 1 && (
              <div className="max-h-28 overflow-y-auto rounded-md border p-2 text-xs text-muted-foreground">
                {switchTargets.map((t) => (
                  <div key={t.organizationId} className="flex justify-between py-0.5">
                    <span>{t.organizationName}</span>
                    <span>{t.accountCode}</span>
                  </div>
                ))}
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Takes effect on the next payment. In-flight transactions stay on the account they were sent on.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSwitchTargets([])} disabled={switching}>
              Cancel
            </Button>
            <Button
              onClick={handleSwitch}
              disabled={switching || !targetAccount || (switchTargets.length === 1 && targetAccount === switchSingleCurrent)}
            >
              {switching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Switching…
                </>
              ) : (
                <>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Confirm Switch
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
