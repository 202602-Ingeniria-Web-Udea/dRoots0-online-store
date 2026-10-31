import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatQuantity } from "@/lib/inventory/format";
import type { MasterRow } from "@/lib/inventory/queries";

export function MastersTable({ masters }: { masters: MasterRow[] }) {
  if (masters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No inventory masters yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Current balance</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead className="pr-4">Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {masters.map((master) => (
            <TableRow key={master.id}>
              <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                {master.id}
              </TableCell>
              <TableCell className="font-medium">{master.name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatQuantity(master.currentBalance)}
              </TableCell>
              <TableCell>{master.creator}</TableCell>
              <TableCell className="pr-4">{formatDateTime(master.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}