import type { Metadata } from "next";

import { CreateMasterDialog } from "@/components/masters/create-master-dialog";
import { MastersTable } from "@/components/masters/masters-table";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchForm } from "@/components/search-form";
import { requireUser } from "@/lib/auth/session";
import { getMastersWithBalances } from "@/lib/inventory/queries";
import { readPage } from "@/lib/pagination";
import { readSearchTerm } from "@/lib/search-params";

export const metadata: Metadata = { title: "Inventory masters" };

function mastersHref(search: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/masters?${query}` : "/masters";
}

export default async function MastersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  // Server-side protection, independent of the layout and the UI.
  const user = await requireUser();
  const params = await searchParams;
  const search = readSearchTerm(params.q);
  const page = readPage(params.page);
  const { items: masters, pagination } = await getMastersWithBalances({
    search,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Inventory masters</h1>
        {/* UX only: the server action re-checks the ADMIN role by itself. */}
        {user.role === "ADMIN" && <CreateMasterDialog />}
      </div>
      <SearchForm
        action="/masters"
        label="Search inventory masters"
        placeholder="Search by master name…"
        defaultValue={search}
      />
      <MastersTable
        masters={masters}
        emptyMessage={
          search ? `No inventory masters match “${search}”.` : undefined
        }
      />
      <PaginationControls
        pagination={pagination}
        itemLabel="masters"
        hrefForPage={(target) => mastersHref(search, target)}
      />
    </div>
  );
}
