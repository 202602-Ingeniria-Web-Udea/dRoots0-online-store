import Link from "next/link";

import { AddUserDialog } from "@/components/users/add-user-dialog";
import { UsersTable } from "@/components/users/table";
import { PaginationControls } from "@/components/pagination-controls";
import { SearchForm } from "@/components/search-form";
import { buttonVariants } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/session";
import { readPage } from "@/lib/pagination";
import { readSearchTerm } from "@/lib/search-params";
import {
  getUsers,
  parseUserView,
  type UserView,
} from "@/lib/users/queries";

function usersHref(search: string, page: number, view: UserView) {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  if (view === "deleted") params.set("view", "deleted");

  const query = params.toString();
  return query ? `/users?${query}` : "/users";
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
    view?: string | string[];
  }>;
}) {
  const actor = await requireAdmin();
  const params = await searchParams;
  const search = readSearchTerm(params.q);
  const page = readPage(params.page);
  const view = parseUserView(params.view);
  const { items: users, pagination } = await getUsers({ search, page, view });

  const emptyMessage =
    view === "deleted"
      ? search
        ? `No deleted users match “${search}”.`
        : "No deleted users found."
      : search
        ? `No users match “${search}”.`
        : undefined;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>Users</h1>
          <p className='text-sm text-muted-foreground'>
            Manage roles, delete accounts, and restore deleted users.
          </p>
        </div>
        <AddUserDialog />
      </div>

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <SearchForm
          action='/users'
          label='Search users'
          placeholder='Search by name or email…'
          defaultValue={search}
          hiddenParams={view === "deleted" ? { view: "deleted" } : undefined}
        />
        <div
          className='flex flex-wrap items-center gap-1'
          role='group'
          aria-label='User account status'
        >
          <Link
            href={usersHref("", 1, "active")}
            aria-current={view === "active" ? "page" : undefined}
            className={buttonVariants({
              variant: view === "active" ? "default" : "outline",
              size: "sm",
            })}
          >
            Active users
          </Link>
          <Link
            href={usersHref("", 1, "deleted")}
            aria-current={view === "deleted" ? "page" : undefined}
            className={buttonVariants({
              variant: view === "deleted" ? "default" : "outline",
              size: "sm",
            })}
          >
            Deleted users
          </Link>
        </div>
      </div>

      <UsersTable
        users={users}
        currentUserId={actor.id}
        emptyMessage={emptyMessage}
      />
      <PaginationControls
        pagination={pagination}
        itemLabel='users'
        hrefForPage={(target) => usersHref(search, target, view)}
      />
    </div>
  );
}
