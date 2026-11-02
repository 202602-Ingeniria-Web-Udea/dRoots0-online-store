import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersTable } from "@/components/users/table";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchForm } from "@/components/search-form";
import { requireAdmin } from "@/lib/auth/session";
import { readPage } from "@/lib/pagination";
import { readSearchTerm } from "@/lib/search-params";
import { getUsers } from "@/lib/users/queries";

function usersHref(search: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/users?${query}` : "/users";
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}) {
  const actor = await requireAdmin();
  const params = await searchParams;
  const search = readSearchTerm(params.q);
  const page = readPage(params.page);
  const { items: users, pagination } = await getUsers({ search, page });

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>Users</h1>
          <p className='text-sm text-muted-foreground'>
            Manage the roles of the people who can access the dashboard.
          </p>
        </div>
        <AddUserDialog />
      </div>
      <SearchForm
        action='/users'
        label='Search users'
        placeholder='Search by name or email…'
        defaultValue={search}
      />
      <UsersTable
        users={users}
        currentUserId={actor.id}
        emptyMessage={search ? `No users match “${search}”.` : undefined}
      />
      <PaginationControls
        pagination={pagination}
        itemLabel='users'
        hrefForPage={(target) => usersHref(search, target)}
      />
    </div>
  );
}
