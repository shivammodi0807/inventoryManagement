"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { StockMovement } from "@/types/dashboard"

const chartConfig = {
  received: {
    label: "Received",
    color: "hsl(var(--chart-1))",
  },
  issued: {
    label: "Issued",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function StockMovementChart({ data }: { data: StockMovement[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Stock Movements</CardTitle>
        <CardDescription>Items received vs issued over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="received" fill="var(--color-received)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="issued" fill="var(--color-issued)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
