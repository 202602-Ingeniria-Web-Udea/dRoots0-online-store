import type { Metadata } from "next";
import Link from "next/link";

import { PaginationControls } from "@/components/pagination-controls";
import { AddMovementDialog } from "@/components/transactions/add-movement-dialog";
import { BalanceChart } from "@/components/transactions/balance-chart";
import { MasterSelect } from "@/components/transactions/master-select";
import { MovementsTable } from "@/components/transactions/movements-table";
import { buttonVariants } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/session";
import { formatQuantity } from "@/lib/inventory/format";
import type { MovementType } from "@/lib/inventory/movement-queries";
import {
  getMasterDetail,
  parseMovementType,
} from "@/lib/inventory/movement-queries";
import { getMasterOptions } from "@/lib/inventory/queries";
import { readPage } from "@/lib/pagination";
import {
  readSortOrder,
  toggleSortOrder,
  type SortOrder,
} from "@/lib/sorting";

export const metadata: Metadata = { title: "Transactions" };

const FILTERS: { label: string; value?: MovementType }[] = [
  { label: "All", value: undefined },
  { label: "Incoming", value: "INCOMING" },
  { label: "Outgoing", value: "OUTGOING" },
];

function filterHref(
  masterId: string,
  type?: MovementType,
  page = 1,
  order: SortOrder = "newest",
) {
  const params = new URLSearchParams({ master: masterId });
  if (type) params.set("type", type);
  if (page > 1) params.set("page", String(page));
  if (order === "oldest") params.set("order", "oldest");
  return `/transactions?${params.toString()}`;
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    master?: string | string[];
    type?: string | string[];
    page?: string | string[];
    order?: string | string[];
  }>;
}) {
  await requireUser();

  const params = await searchParams;
  const requestedId = typeof params.master === "string" ? params.master : undefined;
  const requestedType = parseMovementType(params.type);
  const requestedPage = readPage(params.page);
  const order = readSortOrder(params.order);

  const masters = await getMasterOptions();
  const detail = requestedId
    ? await getMasterDetail(
        requestedId,
        requestedType,
        requestedPage,
        order,
      )
    : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>

      <MasterSelect
        masters={masters}
        selectedId={detail?.id}
        selectedType={requestedType}
        selectedOrder={order}
      />

      {!detail ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {requestedId
            ? "That master was not found. Select another one."
            : "Select an inventory master to see its movements."}
        </div>
      ) : (
        <section className="space-y-6" aria-label={`Movements of ${detail.name}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium">{detail.name}</h2>
              <p className="text-sm text-muted-foreground">
                Current balance:{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {formatQuantity(detail.currentBalance)}
                </span>
              </p>
            </div>
            <AddMovementDialog
              masterId={detail.id}
              masterName={detail.name}
              movementType={requestedType}
              movementOrder={order}
            />
          </div>
          <BalanceChart masterName={detail.name} data={detail.daily} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-medium">Movements</h3>
            <div
              className="flex flex-wrap items-center gap-1"
              role="group"
              aria-label="Filter movements by type"
            >
              {FILTERS.map((filter) => {
                const active = filter.value === requestedType;

                return (
                  <Link
                    key={filter.label}
                    href={filterHref(detail.id, filter.value, 1, order)}
                    aria-current={active ? "true" : undefined}
                    className={buttonVariants({
                      variant: active ? "default" : "outline",
                      size: "sm",
                    })}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <MovementsTable
            movements={detail.movements}
            filterType={requestedType}
            order={order}
            dateSortHref={filterHref(
              detail.id,
              requestedType,
              1,
              toggleSortOrder(order),
            )}
          />
          <PaginationControls
            pagination={detail.movementPagination}
            itemLabel='movements'
            hrefForPage={(target) =>
              filterHref(detail.id, requestedType, target, order)
            }
          />
        </section>
      )}
    </div>
  );
}
