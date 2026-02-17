"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  IconUsers,
  IconBuilding,
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconActivity,
  IconSearch,
  IconFilter,
  IconDownload,
  IconChevronRight,
  IconLoader,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconBuildingBank,
  IconCreditCard,
  IconCash,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUser } from "@/lib/auth";
import { LoginResponse } from "@/types/auth";
import api from "@/lib/api";
import { Interval } from "@/types/payment";
import { PeriodSelector } from "@/components/period-selector";
import { toast } from "@/components/ui/use-toast";

// Types
type PartnerStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";

type TransactionSummary = {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalVolume: number;
  totalFees: number;
  averageTransactionAmount: number;
};

type Partner = {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  status: PartnerStatus;
  plan: string;
  role: string;
  createdAt: string;
  lastActive: string;
  transactionSummary: TransactionSummary;
  dailyTrends: Array<{
    date: string;
    count: number;
    volume: number;
  }>;
  monthlyGrowth: number;
  successRate: number;
};

type DashboardStats = {
  totalPartners: number;
  activePartners: number;
  newPartnersThisMonth: number;
  totalVolumeAllPartners: number;
  totalTransactionsAllPartners: number;
  averageSuccessRate: number;
  topPerformingPartner: Partner | null;
  fastestGrowingPartner: Partner | null;
};

export function PartnersDashboardContent() {
  const router = useRouter();
  const [period, setPeriod] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("volume");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null);

  // Get current user
  useEffect(() => {
    const stored = getUser();
    setCurrentUser(stored);
  }, []);

  // Date calculations
  const { startDate, endDate, interval } = useMemo(() => {
    const end = new Date();
    const start = new Date();
    switch (period) {
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
      case "6m":
        start.setMonth(end.getMonth() - 6);
        break;
      case "1y":
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      interval:
        period === "7d" || period === "30d"
          ? "DAILY"
          : period === "90d"
          ? "WEEKLY"
          : "MONTHLY",
    };
  }, [period]);

  // Fetch partners data
  useEffect(() => {
    async function fetchPartnersData() {
      if (!currentUser) return;

      try {
        setLoading(true);

        // Fetch all partners with their transaction data
        const response = await api.get("/api/v1/partners/dashboard", {
          params: {
            startDate,
            endDate,
            interval,
          },
        });

        const partnersData: Partner[] = response.data.partners || [];
        const dashboardStats: DashboardStats = response.data.stats || {
          totalPartners: 0,
          activePartners: 0,
          newPartnersThisMonth: 0,
          totalVolumeAllPartners: 0,
          totalTransactionsAllPartners: 0,
          averageSuccessRate: 0,
          topPerformingPartner: null,
          fastestGrowingPartner: null,
        };

        setPartners(partnersData);
        setStats(dashboardStats);
      } catch (err: any) {
        console.error("Failed to fetch partners data:", err);
        toast({
          title: "Error",
          description: "Failed to load partners dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPartnersData();
  }, [currentUser, startDate, endDate, interval]);

  // Filter and sort partners
  const filteredPartners = useMemo(() => {
    let filtered = partners.filter((partner) => {
      const matchesSearch =
        partner.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || partner.status === statusFilter;
      const matchesPlan = planFilter === "all" || partner.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });

    // Sort partners
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "volume":
          return b.transactionSummary.totalVolume - a.transactionSummary.totalVolume;
        case "transactions":
          return b.transactionSummary.totalTransactions - a.transactionSummary.totalTransactions;
        case "successRate":
          return b.successRate - a.successRate;
        case "growth":
          return b.monthlyGrowth - a.monthlyGrowth;
        case "recent":
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [partners, searchTerm, statusFilter, planFilter, sortBy]);

  // Calculate chart data
  const volumeTrendData = useMemo(() => {
    const data: Record<string, number> = {};
    partners.forEach((partner) => {
      partner.dailyTrends?.forEach((trend) => {
        data[trend.date] = (data[trend.date] || 0) + trend.volume;
      });
    });
    return Object.entries(data).map(([date, volume]) => ({
      date,
      volume,
    }));
  }, [partners]);

  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    partners.forEach((p) => {
      distribution[p.status] = (distribution[p.status] || 0) + 1;
    });
    return distribution;
  }, [partners]);

  const planDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    partners.forEach((p) => {
      distribution[p.plan] = (distribution[p.plan] || 0) + 1;
    });
    return distribution;
  }, [partners]);

  // Helper functions
  const getStatusColor = (status: PartnerStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "INACTIVE":
        return "bg-gray-500";
      case "PENDING":
        return "bg-yellow-500";
      case "SUSPENDED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status: PartnerStatus) => {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "INACTIVE":
        return "secondary";
      case "PENDING":
        return "outline";
      case "SUSPENDED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const handleExportData = () => {
    // Export logic here
    toast({
      title: "Export Started",
      description: "Partners data is being prepared for download",
    });
  };

  const handleViewPartnerDetails = (partnerId: string) => {
    router.push(`/partner-dashboard/${partnerId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <IconLoader className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading partners dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partners Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage all your business partners in one place
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PeriodSelector value={period} onChange={setPeriod} isMobile={false} />
          <Button variant="outline" onClick={handleExportData}>
            <IconDownload className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
              <IconBuilding className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalPartners)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.newPartnersThisMonth > 0 && (
                  <span className="text-green-600 flex items-center">
                    <IconArrowUpRight className="h-3 w-3 mr-1" />
                    +{stats.newPartnersThisMonth} this month
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Partners</CardTitle>
              <IconActivity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.activePartners)}</div>
              <Progress
                value={(stats.activePartners / stats.totalPartners) * 100}
                className="h-2 mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {((stats.activePartners / stats.totalPartners) * 100).toFixed(1)}% active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <IconWallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalVolumeAllPartners)}</div>
              <p className="text-xs text-muted-foreground">
                Across all partners
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageSuccessRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average across partners
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Performers Section */}
      {stats && (stats.topPerformingPartner || stats.fastestGrowingPartner) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.topPerformingPartner && (
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <IconTrophy className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-lg">Top Performer</CardTitle>
                </div>
                <CardDescription>Highest transaction volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-green-600 text-white">
                      {stats.topPerformingPartner.organizationName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{stats.topPerformingPartner.organizationName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(stats.topPerformingPartner.transactionSummary.totalVolume)} volume
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewPartnerDetails(stats.topPerformingPartner!.organizationId)}
                  >
                    View <IconChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.fastestGrowingPartner && (
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <IconTrendingUp className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Fastest Growing</CardTitle>
                </div>
                <CardDescription>Highest growth rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {stats.fastestGrowingPartner.organizationName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{stats.fastestGrowingPartner.organizationName}</h3>
                    <p className="text-sm text-muted-foreground">
                      +{stats.fastestGrowingPartner.monthlyGrowth.toFixed(1)}% growth
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewPartnerDetails(stats.fastestGrowingPartner!.organizationId)}
                  >
                    View <IconChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Partners List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        {/* Partners List Tab */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-sm">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <IconFilter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>

              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="PAYMENT_REQUEST">Payment Request</SelectItem>
                  <SelectItem value="PAYOUTS">Payouts</SelectItem>
                  <SelectItem value="RECURRING_PAYMENTS">Recurring</SelectItem>
                  <SelectItem value="ENTERPRISE_FULL_ACCESS">Enterprise</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="transactions">Transactions</SelectItem>
                  <SelectItem value="successRate">Success Rate</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="recent">Recent Activity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Partners Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Success Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => (
                    <TableRow
                      key={partner.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedPartner(partner)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className={getStatusColor(partner.status)}>
                              {partner.organizationName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{partner.organizationName}</div>
                            <div className="text-sm text-muted-foreground">{partner.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(partner.status)}>
                          {partner.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{partner.plan.replace(/_/g, " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(partner.transactionSummary.totalTransactions)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(partner.transactionSummary.totalVolume)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress
                            value={partner.successRate}
                            className="h-2 w-16"
                          />
                          <span className="text-sm">{partner.successRate.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewPartnerDetails(partner.organizationId)}>
                              <IconEye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedPartner(partner)}>
                              <IconActivity className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Volume Trend Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Combined Volume Trend</CardTitle>
                <CardDescription>Total transaction volume across all partners over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {/* Insert ChartAreaInteractive or custom chart here */}
                <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">Volume Trend Chart Placeholder</p>
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Partners by Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 by Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPartners
                    .sort((a, b) => b.transactionSummary.totalVolume - a.transactionSummary.totalVolume)
                    .slice(0, 5)
                    .map((partner, index) => (
                      <div key={partner.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{partner.organizationName}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(partner.transactionSummary.totalVolume)}
                          </div>
                        </div>
                        <Progress
                          value={(partner.transactionSummary.totalVolume / (filteredPartners[0]?.transactionSummary.totalVolume || 1)) * 100}
                          className="h-2 w-24"
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Transaction Success Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPartners
                    .sort((a, b) => b.successRate - a.successRate)
                    .slice(0, 5)
                    .map((partner, index) => (
                      <div key={partner.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{partner.organizationName}</div>
                          <div className="text-sm text-muted-foreground">
                            {partner.successRate.toFixed(1)}% success rate
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${partner.successRate >= 95 ? 'text-green-600' : partner.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {partner.successRate >= 95 ? <IconCircleCheck className="h-4 w-4" /> : <IconCircleX className="h-4 w-4" />}
                          {partner.successRate.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(status as PartnerStatus)}`} />
                        <span className="text-sm">{status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({((count / partners.length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-4 w-full rounded-full overflow-hidden flex">
                  {Object.entries(statusDistribution).map(([status, count], index) => (
                    <div
                      key={status}
                      className={`${getStatusColor(status as PartnerStatus)} h-full`}
                      style={{ width: `${(count / partners.length) * 100}%` }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plan Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Plan Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(planDistribution).map(([plan, count]) => (
                    <div key={plan} className="flex items-center justify-between">
                      <span className="text-sm">{plan.replace(/_/g, " ")}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground">
                          ({((count / partners.length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Growth */}
            <Card>
              <CardHeader>
                <CardTitle>Growth Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Growing Partners</span>
                    <Badge variant="default">
                      {partners.filter((p) => p.monthlyGrowth > 0).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Declining Partners</span>
                    <Badge variant="destructive">
                      {partners.filter((p) => p.monthlyGrowth < 0).length}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Stable Partners</span>
                    <Badge variant="secondary">
                      {partners.filter((p) => p.monthlyGrowth === 0).length}
                    </Badge>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-muted-foreground">Average Growth</div>
                    <div className="text-2xl font-bold">
                      {(partners.reduce((acc, p) => acc + p.monthlyGrowth, 0) / partners.length || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={getStatusColor(selectedPartner.status)}>
                      {selectedPartner.organizationName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{selectedPartner.organizationName}</CardTitle>
                    <CardDescription>{selectedPartner.email}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPartner(null)}>
                  <IconX className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                  <div className="text-lg font-bold">
                    {formatCurrency(selectedPartner.transactionSummary.totalVolume)}
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Transactions</div>
                  <div className="text-lg font-bold">
                    {formatNumber(selectedPartner.transactionSummary.totalTransactions)}
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                  <div className="text-lg font-bold">
                    {selectedPartner.successRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Monthly Growth</div>
                  <div className={`text-lg font-bold ${selectedPartner.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedPartner.monthlyGrowth >= 0 ? '+' : ''}
                    {selectedPartner.monthlyGrowth.toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Transaction Breakdown */}
              <div>
                <h3 className="font-semibold mb-3">Transaction Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCircleCheck className="h-4 w-4 text-green-500" />
                      <span>Successful</span>
                    </div>
                    <span className="font-medium">
                      {formatNumber(selectedPartner.transactionSummary.successfulTransactions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconClock className="h-4 w-4 text-yellow-500" />
                      <span>Pending</span>
                    </div>
                    <span className="font-medium">
                      {formatNumber(selectedPartner.transactionSummary.pendingTransactions)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconCircleX className="h-4 w-4 text-red-500" />
                      <span>Failed</span>
                    </div>
                    <span className="font-medium">
                      {formatNumber(selectedPartner.transactionSummary.failedTransactions)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleViewPartnerDetails(selectedPartner.organizationId);
                    setSelectedPartner(null);
                  }}
                >
                  View Full Dashboard
                </Button>
                <Button variant="outline" onClick={() => setSelectedPartner(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}