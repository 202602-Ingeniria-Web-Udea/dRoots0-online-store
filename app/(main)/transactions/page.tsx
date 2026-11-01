import type { Metadata } from "next";

import { AddMovementDialog } from "@/components/transactions/add-movement-dialog";
import { BalanceChart } from "@/components/transactions/balance-chart";
import { MasterSelect } from "@/components/transactions/master-select";
import { MovementsTable } from "@/components/transactions/movements-table";
import { requireUser } from "@/lib/auth/session";
import { formatQuantity } from "@/lib/inventory/format";
import { getMasterDetail } from "@/lib/inventory/movement-queries";
import { getMasterOptions } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ master?: string | string[] }>;
}) {
  await requireUser();

  const params = await searchParams;
  const requestedId = typeof params.master === "string" ? params.master : undefined;

  const masters = await getMasterOptions();
  const detail = requestedId ? await getMasterDetail(requestedId) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>

      <MasterSelect masters={masters} selectedId={detail?.id} />

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
            <AddMovementDialog masterId={detail.id} masterName={detail.name} />
          </div>
          <BalanceChart masterName={detail.name} data={detail.daily} />
          <MovementsTable movements={detail.movements} />
        </section>
      )}
    </div>
  );
}