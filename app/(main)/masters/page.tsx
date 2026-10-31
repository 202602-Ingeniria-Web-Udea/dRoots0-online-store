import type { Metadata } from "next";

import { MastersTable } from "@/components/masters/masters-table";
import { requireUser } from "@/lib/auth/session";
import { getMastersWithBalances } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Inventory masters" };

export default async function MastersPage() {
  // Server-side protection, independent of the layout and the UI.
  await requireUser();
  const masters = await getMastersWithBalances();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Inventory masters</h1>
        {/* The "Add Master" button (ADMIN only) is added in task 3.2. */}
      </div>
      <MastersTable masters={masters} />
    </div>
  );
}