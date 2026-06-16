"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type BookingChartDatum = {
  date: string;
  pending: number;
  confirmed: number;
  rejected: number;
  cancelled: number;
  total: number;
};

const chartConfig = {
  pending: {
    label: "Pending",
    color: "var(--color-md-gold)",
  },
  confirmed: {
    label: "Confirmed",
    color: "var(--color-md-green)",
  },
  rejected: {
    label: "Declined",
    color: "#dc2626",
  },
  cancelled: {
    label: "Cancelled",
    color: "#9ca3af",
  },
} satisfies ChartConfig;

const statusKeys = ["pending", "confirmed", "rejected", "cancelled"] as const;

function formatAxisDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

export function ChartBarInteractive({ data }: { data: BookingChartDatum[] }) {
  const totals = React.useMemo(
    () =>
      data.reduce(
        (acc, item) => ({
          pending: acc.pending + item.pending,
          confirmed: acc.confirmed + item.confirmed,
          rejected: acc.rejected + item.rejected,
          cancelled: acc.cancelled + item.cancelled,
          total: acc.total + item.total,
        }),
        {
          pending: 0,
          confirmed: 0,
          rejected: 0,
          cancelled: 0,
          total: 0,
        },
      ),
    [data],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-4">
        {statusKeys.map((key) => (
          <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: chartConfig[key].color }}
              />
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                {chartConfig[key].label}
              </span>
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-950">
              {totals[key]}
            </p>
          </div>
        ))}
      </div>

      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[260px] w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
          margin={{
            left: 0,
            right: 8,
            top: 8,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={20}
            tickFormatter={formatAxisDate}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-[180px]"
                labelFormatter={(value) => formatAxisDate(String(value))}
              />
            }
          />
          <Bar dataKey="pending" stackId="bookings" fill="var(--color-pending)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="confirmed" stackId="bookings" fill="var(--color-confirmed)" />
          <Bar dataKey="rejected" stackId="bookings" fill="var(--color-rejected)" />
          <Bar dataKey="cancelled" stackId="bookings" fill="var(--color-cancelled)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>

      {totals.total === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
          No booking activity in this period yet.
        </p>
      ) : null}
    </div>
  );
}
