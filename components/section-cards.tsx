import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total Disbursements</CardDescription>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">₵124,500</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Total amount disbursed this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Pending Approvals</CardDescription>
          <CardAction>
            <Badge variant="outline" className="text-yellow-600">
              <IconTrendingDown className="h-3 w-3 mr-1" />
              -5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">23</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Success Rate</CardDescription>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              +2.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">94.2%</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Excellent performance</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Your Balance</CardDescription>
          <CardAction>
            <Badge variant="outline" className="text-green-600">
              <IconTrendingUp className="h-3 w-3 mr-1" />
              +8.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CardTitle className="text-2xl font-bold">₵45,890</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Available for disbursement</p>
        </CardContent>
      </Card>
    </div>
  )
}
