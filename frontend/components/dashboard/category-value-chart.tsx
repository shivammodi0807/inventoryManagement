"use client"

import { Cell, Pie, PieChart } from "recharts"

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
import { CategoryValue } from "@/types/dashboard"

export function CategoryValueChart({ data }: { data: CategoryValue[] }) {
  // We'll dynamically generate colors based on CSS variables or static palette
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  // We need to dynamically build the ChartConfig since categories are dynamic
  const chartConfig = data.reduce((acc, curr, index) => {
    acc[curr.name] = {
      label: curr.name,
      color: COLORS[index % COLORS.length],
    }
    return acc
  }, {} as ChartConfig)

  // Map data to use fill keys for the ChartContainer
  const chartData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length]
  }))

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Inventory Value by Category</CardTitle>
        <CardDescription>Top 5 categories by stock value</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => `$${Number(value).toLocaleString()}`} />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
