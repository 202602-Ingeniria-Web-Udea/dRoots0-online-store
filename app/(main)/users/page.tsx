import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersTable } from "@/components/users/table";
import { SearchForm } from "@/components/search-form";
import { requireAdmin } from "@/lib/auth/session";
import { readSearchTerm } from "@/lib/search-params";
import { getUsers } from "@/lib/users/queries";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const actor = await requireAdmin();
  const params = await searchParams;
  const search = readSearchTerm(params.q);
  const users = await getUsers(search);

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
    </div>
  );
}
