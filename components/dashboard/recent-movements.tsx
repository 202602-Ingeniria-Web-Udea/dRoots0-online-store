import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardMovement } from "@/lib/inventory/dashboard";
import { formatDateTime, formatQuantity } from "@/lib/inventory/format";

const BADGE_BASE = "inline-flex rounded-full px-2 py-0.5 text-xs font-medium";

function MovementTypeBadge({
  type,
}: {
  type: DashboardMovement["type"];
}) {
  const incoming = type === "INCOMING";

  return (
    <span
      className={
        incoming
          ? `${BADGE_BASE} bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`
          : `${BADGE_BASE} bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300`
      }
    >
      {incoming ? "Incoming" : "Outgoing"}
    </span>
  );
}

export function RecentMovements({
  movements,
}: {
  movements: DashboardMovement[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>
          Latest inventory movements across all masters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className='py-6 text-center text-sm text-muted-foreground'>
            No movements have been recorded yet.
          </p>
        ) : (
          <ul className='flex flex-col divide-y'>
            {movements.map((movement) => {
              const incoming = movement.type === "INCOMING";

              return (
                <li
                  key={movement.id}
                  className='flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0'
                >
                  <div className='min-w-0'>
                    <Link
                      href={`/transactions?master=${movement.masterId}`}
                      className='font-medium underline-offset-4 hover:underline'
                    >
                      {movement.masterName}
                    </Link>
                    <p className='text-xs text-muted-foreground'>
                      {formatDateTime(movement.occurredAt)} · {movement.responsible}
                    </p>
                  </div>
                  <div className='flex items-center gap-3'>
                    <MovementTypeBadge type={movement.type} />
                    <span className='text-sm tabular-nums'>
                      {incoming ? "+" : "−"}
                      {formatQuantity(movement.quantity)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
