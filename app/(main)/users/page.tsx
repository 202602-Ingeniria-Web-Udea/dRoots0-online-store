import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';
import { TableActions } from '@/components/users/table';
import { DialogDemo } from '@/components/users/dialog';

type users = {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  enabled: boolean;
  deleted: boolean;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
};

async function getUsers(): Promise<users[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      lastName: true,
      email: true,
      enabled: true,
      deleted: true,
      role: true,
      createdAt: true,
    },
  });
}

export default async function Users() {
  await requireAdmin();

  const Data = await getUsers();

  return (
    <div>
      <div className='flex flex-row justify-around items-center'>
        <div>
          <h1 className='text-5xl font-bold'>Users</h1>
        </div>
        <div>
          <DialogDemo />
        </div>
      </div>
      <div>
        <TableActions users={Data} />
      </div>
    </div>
  );
}
