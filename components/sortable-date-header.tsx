import Link from "next/link";

import { TableHead } from "@/components/ui/table";
import type { SortOrder } from "@/lib/sorting";

export function SortableDateHeader({
  label,
  order,
  href,
  className,
}: {
  label: string;
  order: SortOrder;
  href: string;
  className?: string;
}) {
  const oldestFirst = order === "oldest";
  const stateLabel = oldestFirst ? "Oldest first" : "Newest first";

  return (
    <TableHead
      className={className}
      aria-sort={oldestFirst ? "ascending" : "descending"}
    >
      <Link
        href={href}
        title={stateLabel}
        className='inline-flex items-center gap-1 underline-offset-4 hover:underline'
      >
        {label}
        <span aria-hidden='true'>{oldestFirst ? "↑" : "↓"}</span>
        <span className='text-xs font-normal text-muted-foreground'>
          {stateLabel}
        </span>
      </Link>
    </TableHead>
  );
}
