import { SortableDateHeader } from "@/components/sortable-date-header";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatQuantity } from "@/lib/inventory/format";
import type { MasterRow } from "@/lib/inventory/queries";
import type { SortOrder } from "@/lib/sorting";

export function MastersTable({
  masters,
  emptyMessage = "No inventory masters yet.",
  order,
  dateSortHref,
}: {
  masters: MasterRow[];
  emptyMessage?: string;
  order: SortOrder;
  dateSortHref: string;
}) {
  if (masters.length === 0) {
    return (
      <div className='rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground'>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className='overflow-x-auto rounded-xl ring-1 ring-foreground/10'>
      <Table className='min-w-[720px]'>
        <TableCaption className='sr-only'>
          Inventory masters with current balances
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className='pl-4'>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className='text-right'>Current balance</TableHead>
            <TableHead>Creator</TableHead>
            <SortableDateHeader
              label='Created'
              order={order}
              href={dateSortHref}
              className='pr-4'
            />
          </TableRow>
        </TableHeader>
        <TableBody>
          {masters.map((master) => (
            <TableRow key={master.id}>
              <TableCell className='pl-4 font-mono text-xs text-muted-foreground'>
                {master.id}
              </TableCell>
              <TableCell className='font-medium'>{master.name}</TableCell>
              <TableCell className='text-right tabular-nums'>
                {formatQuantity(master.currentBalance)}
              </TableCell>
              <TableCell>{master.creator}</TableCell>
              <TableCell className='pr-4'>{formatDateTime(master.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
