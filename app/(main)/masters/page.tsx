import type { Metadata } from "next";

import { CreateMasterDialog } from "@/components/masters/create-master-dialog";
import { MastersTable } from "@/components/masters/masters-table";
import { requireUser } from "@/lib/auth/session";
import { getMastersWithBalances } from "@/lib/inventory/queries";

export const metadata: Metadata = { title: "Inventory masters" };

export default async function MastersPage() {
  // Server-side protection, independent of the layout and the UI.
  const user = await requireUser();
  const masters = await getMastersWithBalances();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Inventory masters</h1>
        {/* UX only: the server action re-checks the ADMIN role by itself. */}
        {user.role === "ADMIN" && <CreateMasterDialog />}
      </div>
      <MastersTable masters={masters} />
    </div>
  );
}