import {
  IconAlertTriangle,
  IconArrowsExchange,
  IconBox,
  IconPackages,
} from "@tabler/icons-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardSummary } from "@/lib/inventory/dashboard";
import { formatQuantity } from "@/lib/inventory/format";

export function SummaryCards({ summary }: { summary: DashboardSummary }) {
  const cards = [
    {
      label: "Inventory masters",
      value: summary.masterCount.toString(),
      hint: "Registered master records",
      icon: <IconPackages />,
    },
    {
      label: "Movements",
      value: summary.movementCount.toString(),
      hint: "Incoming and outgoing",
      icon: <IconArrowsExchange />,
    },
    {
      label: "Total inventory",
      value: formatQuantity(summary.totalInventory),
      hint: "Units across all masters",
      icon: <IconBox />,
    },
    {
      label: "Low stock",
      value: summary.lowStockCount.toString(),
      hint: `At or below ${summary.lowStockThreshold} units`,
      icon: <IconAlertTriangle />,
    },
  ];

  return (
    <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className='flex flex-col gap-3 p-5'>
            <div className='flex items-center justify-between gap-3'>
              <span className='text-sm text-muted-foreground'>{card.label}</span>
              <span className='flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground [&_svg]:size-4'>
                {card.icon}
              </span>
            </div>
            <span className='text-2xl font-semibold tracking-tight tabular-nums'>
              {card.value}
            </span>
            <span className='text-xs text-muted-foreground'>{card.hint}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
