"use client";

import { useSyncExternalStore } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Skeleton } from "@/components/ui/skeleton";
import type { DailyBalance } from "@/lib/inventory/balance";

const subscribe = () => () => {};

export function BalanceChart({
  masterName,
  data,
}: {
  masterName: string;
  data: DailyBalance[];
}) {
  // false on the server and during hydration, true afterwards: the chart is
  // rendered on the client only, so there is no hydration mismatch.
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);

  // Presentation only: authoritative math stays in Decimal strings.
  const points = data.map((day) => ({ date: day.date, balance: Number(day.balance) }));

  return (
    <section
      aria-label="Daily balance chart"
      className="rounded-xl p-4 ring-1 ring-foreground/10"
    >
      <h3 className="mb-4 font-medium">Daily balance: {masterName}</h3>

      {points.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No movements yet, so there is no balance history to chart.
        </p>
      ) : !isClient ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                minTickGap={24}
                label={{ value: "Date", position: "insideBottom", offset: -12 }}
              />
              <YAxis label={{ value: "Balance", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value) => [String(value), "Balance"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={points.length <= 31}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}