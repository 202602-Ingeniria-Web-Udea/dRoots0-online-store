import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatQuantity } from "@/lib/inventory/format";
import type { MovementRow } from "@/lib/inventory/movement-queries";

const BADGE_BASE = "inline-flex rounded-full px-2 py-0.5 text-xs font-medium";

export function MovementsTable({ movements }: { movements: MovementRow[] }) {
  if (movements.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        This master has no movements yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="pr-4">Responsible</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => {
            const incoming = movement.type === "INCOMING";
            return (
              <TableRow key={movement.id}>
                <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                  {movement.id}
                </TableCell>
                <TableCell>{formatDateTime(movement.occurredAt)}</TableCell>
                <TableCell>
                  <span
                    className={
                      incoming
                        ? `${BADGE_BASE} bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300`
                        : `${BADGE_BASE} bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300`
                    }
                  >
                    {incoming ? "Incoming" : "Outgoing"}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {incoming ? "+" : "−"}
                  {formatQuantity(movement.quantity)}
                </TableCell>
                <TableCell className="pr-4">{movement.responsible}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}