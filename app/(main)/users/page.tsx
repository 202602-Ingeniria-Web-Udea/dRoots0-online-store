import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { UsersTable, type UserRow } from "@/components/users/table";

async function getUsers(): Promise<UserRow[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function Users() {
  const actor = await requireAdmin();

  const users = await getUsers();

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>Users</h1>
        <p className='text-sm text-muted-foreground'>
          Manage the roles of the people who can access the dashboard.
        </p>
      </div>
      <UsersTable users={users} currentUserId={actor.id} />
    </div>
  );
}
