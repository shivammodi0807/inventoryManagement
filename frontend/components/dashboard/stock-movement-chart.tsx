"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"

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
    color: "oklch(var(--chart-1))",
  },
  issued: {
    label: "Issued",
    color: "oklch(var(--chart-2))",
  },
} satisfies ChartConfig

export function StockMovementChart({ data }: { data: StockMovement[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart accessibilityLayer data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <YAxis 
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <ChartTooltip cursor={{ fill: 'var(--secondary)', opacity: 0.4 }} content={<ChartTooltipContent />} />
          <Bar 
            dataKey="received" 
            fill="var(--color-received)" 
            radius={[6, 6, 0, 0]} 
            barSize={24}
          />
          <Bar 
            dataKey="issued" 
            fill="var(--color-issued)" 
            radius={[6, 6, 0, 0]} 
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
