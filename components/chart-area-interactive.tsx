"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export const description = "An interactive area chart showing payment transactions"

const chartData = [
  { date: "2024-04-01", mobileMoneyPayments: 2220, bankTransfers: 1500 },
  { date: "2024-04-02", mobileMoneyPayments: 970, bankTransfers: 1800 },
  { date: "2024-04-03", mobileMoneyPayments: 1670, bankTransfers: 1200 },
  { date: "2024-04-04", mobileMoneyPayments: 2420, bankTransfers: 2600 },
  { date: "2024-04-05", mobileMoneyPayments: 3730, bankTransfers: 2900 },
  { date: "2024-04-06", mobileMoneyPayments: 3010, bankTransfers: 3400 },
  { date: "2024-04-07", mobileMoneyPayments: 2450, bankTransfers: 1800 },
  { date: "2024-04-08", mobileMoneyPayments: 4090, bankTransfers: 3200 },
  { date: "2024-04-09", mobileMoneyPayments: 590, bankTransfers: 1100 },
  { date: "2024-04-10", mobileMoneyPayments: 2610, bankTransfers: 1900 },
  { date: "2024-04-11", mobileMoneyPayments: 3270, bankTransfers: 3500 },
  { date: "2024-04-12", mobileMoneyPayments: 2920, bankTransfers: 2100 },
  { date: "2024-04-13", mobileMoneyPayments: 3420, bankTransfers: 3800 },
  { date: "2024-04-14", mobileMoneyPayments: 1370, bankTransfers: 2200 },
  { date: "2024-04-15", mobileMoneyPayments: 1200, bankTransfers: 1700 },
  { date: "2024-04-16", mobileMoneyPayments: 1380, bankTransfers: 1900 },
  { date: "2024-04-17", mobileMoneyPayments: 4460, bankTransfers: 3600 },
  { date: "2024-04-18", mobileMoneyPayments: 3640, bankTransfers: 4100 },
  { date: "2024-04-19", mobileMoneyPayments: 2430, bankTransfers: 1800 },
  { date: "2024-04-20", mobileMoneyPayments: 890, bankTransfers: 1500 },
  { date: "2024-04-21", mobileMoneyPayments: 1370, bankTransfers: 2000 },
  { date: "2024-04-22", mobileMoneyPayments: 2240, bankTransfers: 1700 },
  { date: "2024-04-23", mobileMoneyPayments: 1380, bankTransfers: 2300 },
  { date: "2024-04-24", mobileMoneyPayments: 3870, bankTransfers: 2900 },
  { date: "2024-04-25", mobileMoneyPayments: 2150, bankTransfers: 2500 },
  { date: "2024-04-26", mobileMoneyPayments: 750, bankTransfers: 1300 },
  { date: "2024-04-27", mobileMoneyPayments: 3830, bankTransfers: 4200 },
  { date: "2024-04-28", mobileMoneyPayments: 1220, bankTransfers: 1800 },
  { date: "2024-04-29", mobileMoneyPayments: 3150, bankTransfers: 2400 },
  { date: "2024-04-30", mobileMoneyPayments: 4540, bankTransfers: 3800 },
]

const chartConfig = {
  transactions: {
    label: "Transactions",
  },
  mobileMoneyPayments: {
    label: "Mobile Money",
    color: "var(--primary)",
  },
  bankTransfers: {
    label: "Bank Transfers",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-04-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Payment Transactions</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">Mobile Money vs Bank Transfers for the last 3 months</span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillMobileMoney" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobileMoneyPayments)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-mobileMoneyPayments)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillBankTransfers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-bankTransfers)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-bankTransfers)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="bankTransfers"
              type="natural"
              fill="url(#fillBankTransfers)"
              stroke="var(--color-bankTransfers)"
              stackId="a"
            />
            <Area
              dataKey="mobileMoneyPayments"
              type="natural"
              fill="url(#fillMobileMoney)"
              stroke="var(--color-mobileMoneyPayments)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
