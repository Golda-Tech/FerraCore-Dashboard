"use client";

import React, { useState, useEffect, useMemo } from "react";
import { PeriodSelector } from "@/components/period-selector";
import { getUser } from "@/lib/auth";
import { LoginResponse } from "@/types/auth";

// Import icons individually to avoid potential issues
import IconBuilding from "@tabler/icons-react/dist/esm/icons/IconBuilding";
import IconArrowLeft from "@tabler/icons-react/dist/esm/icons/IconArrowLeft";
import IconUsers from "@tabler/icons-react/dist/esm/icons/IconUsers";
import IconCreditCard from "@tabler/icons-react/dist/esm/icons/IconCreditCard";
import IconTrendingUp from "@tabler/icons-react/dist/esm/icons/IconTrendingUp";
import IconTrendingDown from "@tabler/icons-react/dist/esm/icons/IconTrendingDown";
import IconCircleCheck from "@tabler/icons-react/dist/esm/icons/IconCircleCheck";
import IconCircleX from "@tabler/icons-react/dist/esm/icons/IconCircleX";
import IconClock from "@tabler/icons-react/dist/esm/icons/IconClock";
import IconSearch from "@tabler/icons-react/dist/esm/icons/IconSearch";
import IconChevronRight from "@tabler/icons-react/dist/esm/icons/IconChevronRight";
import IconMail from "@tabler/icons-react/dist/esm/icons/IconMail";
import IconClipboard from "@tabler/icons-react/dist/esm/icons/IconClipboard";
import IconPhone from "@tabler/icons-react/dist/esm/icons/IconPhone";
import IconCurrencyDollar from "@tabler/icons-react/dist/esm/icons/IconCurrencyDollar";
import IconRefresh from "@tabler/icons-react/dist/esm/icons/IconRefresh";

/* ---------- TYPES ---------- */

export type PartnerStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type Partner = {
  id: string;
  organizationName: string;
  organizationId: string;
  contactEmail: string;
  contactNumber: string;
  businessType: string;
  status: PartnerStatus;
  planType: string;
  currency: string;
  createdAt: string;
};

export type TransactionStat = {
  date: string;
  successful: number;
  failed: number;
  pending: number;
  totalAmount: number;
};

export type PartnerStats = {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalVolume: number;
  successRate: number;
  avgTransactionAmount: number;
  trends: TransactionStat[];
};

/* ---------- MOCK DATA ---------- */

const mockPartners: Partner[] = [
  {
    id: "1",
    organizationName: "Goldatech Ltd",
    organizationId: "ORG-001",
    contactEmail: "admin@goldatech.com",
    contactNumber: "+233201234567",
    businessType: "Technology",
    status: "ACTIVE",
    planType: "ENTERPRISE",
    currency: "GHS",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    organizationName: "Rexpay Solutions",
    organizationId: "ORG-002",
    contactEmail: "admin@rexpay.com",
    contactNumber: "+233209876543",
    businessType: "Fintech",
    status: "ACTIVE",
    planType: "BUSINESS",
    currency: "GHS",
    createdAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "3",
    organizationName: "Ferracore Inc",
    organizationId: "ORG-003",
    contactEmail: "admin@ferracore.com",
    contactNumber: "+233205551234",
    businessType: "Retail",
    status: "INACTIVE",
    planType: "STARTER",
    currency: "GHS",
    createdAt: "2024-03-10T10:00:00Z",
  },
  {
    id: "4",
    organizationName: "Apex Commerce",
    organizationId: "ORG-004",
    contactEmail: "admin@apex.com",
    contactNumber: "+233207778888",
    businessType: "E-Commerce",
    status: "ACTIVE",
    planType: "BUSINESS",
    currency: "GHS",
    createdAt: "2024-04-05T10:00:00Z",
  },
  {
    id: "5",
    organizationName: "NovaPay Africa",
    organizationId: "ORG-005",
    contactEmail: "admin@novapay.com",
    contactNumber: "+233203334444",
    businessType: "Payments",
    status: "SUSPENDED",
    planType: "ENTERPRISE",
    currency: "GHS",
    createdAt: "2024-05-01T10:00:00Z",
  },
];

const generateMockStats = (partnerId: string): PartnerStats => {
  const seed = parseInt(partnerId) * 1234;
  const total = 800 + (seed % 400);
  const successful = Math.floor(total * (0.7 + (seed % 20) / 100));
  const failed = Math.floor(total * 0.1);
  const pending = total - successful - failed;

  const trends: TransactionStat[] = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
    successful: Math.floor(50 + Math.random() * 80),
    failed: Math.floor(5 + Math.random() * 20),
    pending: Math.floor(2 + Math.random() * 15),
    totalAmount: Math.floor(10000 + Math.random() * 50000),
  }));

  return {
    totalTransactions: total,
    successfulTransactions: successful,
    failedTransactions: failed,
    pendingTransactions: pending,
    totalVolume: 250000 + (seed % 150000),
    successRate: parseFloat(((successful / total) * 100).toFixed(1)),
    avgTransactionAmount: parseFloat(
      ((250000 + (seed % 150000)) / total).toFixed(2)
    ),
    trends,
  };
};

/* ---------- STAT CARD ---------- */

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple";
  loading?: boolean;
};

function StatCard({ label, value, sub, icon, color = "blue", loading }: StatCardProps) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</span>
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
      ) : (
        <>
          <span className="text-2xl font-bold">{value}</span>
          {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
        </>
      )}
    </div>
  );
}

/* ---------- MINI BAR ---------- */

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ---------- TREND CHART ---------- */

function TrendChart({ trends }: { trends: TransactionStat[] }) {
  const maxAmount = Math.max(...trends.map((t) => t.totalAmount));

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">Daily Transaction Volume</h3>
      <div className="flex items-end gap-2 h-32">
        {trends.map((t, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full flex flex-col gap-0.5 justify-end"
              style={{ height: "100px" }}
            >
              <div
                className="w-full bg-emerald-500 rounded-t opacity-80"
                style={{ height: `${(t.successful / maxAmount) * 100}px` }}
                title={`Successful: ${t.successful}`}
              />
              <div
                className="w-full bg-red-400 opacity-70"
                style={{ height: `${(t.failed / maxAmount) * 100}px` }}
                title={`Failed: ${t.failed}`}
              />
              <div
                className="w-full bg-amber-400 rounded-b opacity-70"
                style={{ height: `${(t.pending / maxAmount) * 100}px` }}
                title={`Pending: ${t.pending}`}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">{t.date}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-3">
        {[
          { color: "bg-emerald-500", label: "Successful" },
          { color: "bg-red-400", label: "Failed" },
          { color: "bg-amber-400", label: "Pending" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- PARTNER CARD ---------- */

function PartnerCard({ partner, onClick }: { partner: Partner; onClick: () => void }) {
  const statusStyles: Record<PartnerStatus, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    SUSPENDED: "bg-red-100 text-red-600",
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <IconBuilding className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">{partner.organizationName}</p>
            <p className="text-xs text-muted-foreground">{partner.organizationId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[partner.status]}`}
          >
            {partner.status}
          </span>
          <IconChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <IconMail className="w-3 h-3" />
          <span className="truncate">{partner.contactEmail}</span>
        </div>
        <div className="flex items-center gap-1">
          <IconPhone className="w-3 h-3" />
          <span>{partner.contactNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          <IconBuilding className="w-3 h-3" />
          <span>{partner.businessType}</span>
        </div>
        <div className="flex items-center gap-1">
          <IconClipboard className="w-3 h-3" />
          <span>{partner.planType}</span>
        </div>
      </div>
    </button>
  );
}
/* ---------- PARTNER DRILL-DOWN ---------- */

type PartnerDrillDownProps = {
  partner: Partner;
  period: string;
  onBack: () => void;
};

function PartnerDrillDown({ partner, period, onBack }: PartnerDrillDownProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PartnerStats | null>(null);

  const statusStyles: Record<PartnerStatus, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    SUSPENDED: "bg-red-100 text-red-600",
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setStats(generateMockStats(partner.id));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [partner.id, period]);

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          All Partners
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{partner.organizationName}</span>
      </div>

      {/* Partner Info Header */}
      <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <IconBuilding className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{partner.organizationName}</h2>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[partner.status]}`}
              >
                {partner.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{partner.organizationId}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium truncate">{partner.contactEmail}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-medium">{partner.contactNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Business Type</p>
            <p className="font-medium">{partner.businessType}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Plan</p>
            <p className="font-medium">{partner.planType}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Transactions"
          value={stats?.totalTransactions.toLocaleString() ?? "—"}
          icon={<IconCreditCard className="w-4 h-4" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          label="Total Volume"
          value={stats ? `GHS ${stats.totalVolume.toLocaleString()}` : "—"}
          icon={<IconCurrencyDollar className="w-4 h-4" />}
          color="purple"
          loading={loading}
        />
        <StatCard
          label="Success Rate"
          value={stats ? `${stats.successRate}%` : "—"}
          sub={`${stats?.successfulTransactions.toLocaleString()} successful`}
          icon={<IconTrendingUp className="w-4 h-4" />}
          color="green"
          loading={loading}
        />
        <StatCard
          label="Avg. Transaction"
          value={stats ? `GHS ${stats.avgTransactionAmount.toLocaleString()}` : "—"}
          icon={<IconTrendingDown className="w-4 h-4" />}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Breakdown + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Breakdown */}
        <div className="rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Transaction Breakdown</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {[
                {
                  label: "Successful",
                  value: stats?.successfulTransactions ?? 0,
                  max: stats?.totalTransactions ?? 1,
                  color: "bg-emerald-500",
                  icon: <IconCircleCheck className="w-4 h-4 text-emerald-600" />,
                },
                {
                  label: "Failed",
                  value: stats?.failedTransactions ?? 0,
                  max: stats?.totalTransactions ?? 1,
                  color: "bg-red-400",
                  icon: <IconCircleX className="w-4 h-4 text-red-500" />,
                },
                {
                  label: "Pending",
                  value: stats?.pendingTransactions ?? 0,
                  max: stats?.totalTransactions ?? 1,
                  color: "bg-amber-400",
                  icon: <IconClock className="w-4 h-4 text-amber-500" />,
                },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {item.icon}
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                  <MiniBar value={item.value} max={item.max} color={item.color} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trend chart spans 2 cols */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="rounded-xl border bg-card p-5 shadow-sm h-full min-h-[200px] flex items-center justify-center">
              <IconRefresh className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TrendChart trends={stats?.trends ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- MAIN COMPONENT ---------- */

export function PartnersContent() {
  const [period, setPeriod] = useState("7d");
  const [isMobile, setIsMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | "ALL">("ALL");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [user, setUser] = useState<LoginResponse | null>(null);

  useEffect(() => {
    const stored = getUser();
    setUser(stored);

    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredPartners = useMemo(() => {
    return mockPartners.filter((p) => {
      const matchesSearch =
        p.organizationName.toLowerCase().includes(search.toLowerCase()) ||
        p.organizationId.toLowerCase().includes(search.toLowerCase()) ||
        p.contactEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const summary = useMemo(
    () => ({
      total: mockPartners.length,
      active: mockPartners.filter((p) => p.status === "ACTIVE").length,
      inactive: mockPartners.filter((p) => p.status === "INACTIVE").length,
      suspended: mockPartners.filter((p) => p.status === "SUSPENDED").length,
    }),
    []
  );

  const statusStyles: Record<PartnerStatus, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    SUSPENDED: "bg-red-100 text-red-600",
  };

  /* Drill-down view */
  if (selectedPartner) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex justify-end">
            <PeriodSelector value={period} onChange={setPeriod} isMobile={isMobile} />
          </div>
          <PartnerDrillDown
            partner={selectedPartner}
            period={period}
            onBack={() => setSelectedPartner(null)}
          />
        </div>
      </div>
    );
  }

  /* List view */
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Partners</h1>
            <p className="text-muted-foreground">
              Manage and monitor all registered partners
            </p>
          </div>
          <PeriodSelector value={period} onChange={setPeriod} isMobile={isMobile} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Partners"
            value={summary.total}
            icon={<IconUsers className="w-4 h-4" />}
            color="blue"
          />
          <StatCard
            label="Active"
            value={summary.active}
            icon={<IconCircleCheck className="w-4 h-4" />}
            color="green"
          />
          <StatCard
            label="Inactive"
            value={summary.inactive}
            icon={<IconClock className="w-4 h-4" />}
            color="yellow"
          />
          <StatCard
            label="Suspended"
            value={summary.suspended}
            icon={<IconCircleX className="w-4 h-4" />}
            color="red"
          />
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            {(["ALL", "ACTIVE", "INACTIVE", "SUSPENDED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Partners Grid */}
        {filteredPartners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <IconBuilding className="w-10 h-10 opacity-30" />
            <p className="text-sm">No partners found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPartners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                onClick={() => setSelectedPartner(partner)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}