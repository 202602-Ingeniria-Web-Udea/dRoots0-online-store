import Link from "next/link";
import { cn } from "cn";

import { buttonVariants } from "@/components/ui/button";
import {
  getVisiblePages,
  type Pagination,
} from "@/lib/pagination";

const BUTTON_CLASS = buttonVariants({ variant: "outline", size: "sm" });
const DISABLED_CLASS = cn(BUTTON_CLASS, "pointer-events-none opacity-50");

export function PaginationControls({
  pagination,
  hrefForPage,
  itemLabel = "items",
}: {
  pagination: Pagination;
  hrefForPage: (page: number) => string;
  itemLabel?: string;
}) {
  const { page, pageSize, total, totalPages } = pagination;

  // The table already has its own empty state; an empty pager would repeat it.
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label='Pagination'
      className='flex flex-wrap items-center justify-between gap-3'
    >
      <p className='text-sm text-muted-foreground' aria-live='polite'>
        Showing {start}–{end} of {total} {itemLabel}.
      </p>

      <div className='flex flex-wrap items-center gap-1'>
        {page > 1 ? (
          <Link
            href={hrefForPage(page - 1)}
            className={BUTTON_CLASS}
            aria-label='Previous page'
          >
            Previous
          </Link>
        ) : (
          <span aria-disabled='true' className={DISABLED_CLASS}>
            Previous
          </span>
        )}

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden='true'
              className='px-1 text-sm text-muted-foreground'
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={hrefForPage(item)}
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                item === page
                  ? buttonVariants({ size: "sm" })
                  : BUTTON_CLASS,
                "min-w-9 tabular-nums",
              )}
            >
              {item}
            </Link>
          ),
        )}

        {page < totalPages ? (
          <Link
            href={hrefForPage(page + 1)}
            className={BUTTON_CLASS}
            aria-label='Next page'
          >
            Next
          </Link>
        ) : (
          <span aria-disabled='true' className={DISABLED_CLASS}>
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
