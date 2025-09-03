import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AnalyticsContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Monthly Volume</CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-green-600">
                <IconTrendingUp className="h-3 w-3 mr-1" />
                +15.2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">₵45.2M</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Total disbursed this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Transaction Count</CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-green-600">
                <IconTrendingUp className="h-3 w-3 mr-1" />
                +8.1%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">2,847</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Average Amount</CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-red-600">
                <IconTrendingDown className="h-3 w-3 mr-1" />
                -2.4%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">₵15,890</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-green-600">
                <IconTrendingUp className="h-3 w-3 mr-1" />
                +1.2%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-2xl font-bold">96.8%</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Transaction success
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* <ChartAreaInteractive /> */}

        <Card>
          <CardHeader>
            <CardTitle>Network Distribution</CardTitle>
            <CardDescription>Payout by network provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">MTN</span>
                <span className="text-sm text-muted-foreground">45.2%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "45.2%" }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Airtel</span>
                <span className="text-sm text-muted-foreground">28.7%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "28.7%" }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Glo</span>
                <span className="text-sm text-muted-foreground">16.8%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "16.8%" }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">9mobile</span>
                <span className="text-sm text-muted-foreground">9.3%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: "9.3%" }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Merchants</CardTitle>
            <CardDescription>By transaction volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">First Bank</span>
                <span className="text-sm text-muted-foreground">₵12.4M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">GTBank</span>
                <span className="text-sm text-muted-foreground">₵8.7M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Access Bank</span>
                <span className="text-sm text-muted-foreground">₵6.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Zenith Bank</span>
                <span className="text-sm text-muted-foreground">₵5.1M</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Transaction activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">9:00 - 11:00 AM</span>
                <span className="text-sm text-muted-foreground">342 txns</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">2:00 - 4:00 PM</span>
                <span className="text-sm text-muted-foreground">298 txns</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">11:00 AM - 1:00 PM</span>
                <span className="text-sm text-muted-foreground">267 txns</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">4:00 - 6:00 PM</span>
                <span className="text-sm text-muted-foreground">189 txns</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>System notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium text-yellow-600">
                  High volume detected
                </p>
                <p className="text-muted-foreground">
                  MTN network - 2 mins ago
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-green-600">
                  System maintenance completed
                </p>
                <p className="text-muted-foreground">
                  All services restored - 1 hour ago
                </p>
              </div>
              <div className="text-sm">
                <p className="font-medium text-blue-600">
                  New merchant onboarded
                </p>
                <p className="text-muted-foreground">UBA Bank - 3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
