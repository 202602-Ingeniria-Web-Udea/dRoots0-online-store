import { DeleteUserDialog } from "@/components/users/delete-user-dialog";
import { EditUserDialog } from "@/components/users/edit-dialog";
import { RestoreUserButton } from "@/components/users/restore-user-button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserRole, UserRow } from "@/lib/users/queries";

export type { UserRole, UserRow };

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function RoleBadge({ role }: { role: UserRole }) {
  const className =
    role === "ADMIN"
      ? "bg-primary/10 text-primary"
      : "bg-secondary text-secondary-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {role}
    </span>
  );
}

export function UsersTable({
  users,
  currentUserId,
  emptyMessage = "No users found.",
}: {
  users: UserRow[];
  currentUserId: string;
  emptyMessage?: string;
}) {
  return (
    <div className='overflow-x-auto rounded-lg border'>
      <Table className='min-w-[720px]'>
        <TableCaption className='sr-only'>List of application users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className='h-24 text-center text-muted-foreground'>
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className='font-mono text-xs'>{user.id}</TableCell>
                <TableCell className='font-medium'>{user.name}</TableCell>
                <TableCell>{dateFormatter.format(user.createdAt)}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className='text-right'>
                  {user.id === currentUserId ? (
                    <span className='text-xs text-muted-foreground'>
                      Current account
                    </span>
                  ) : user.deleted ? (
                    <RestoreUserButton
                      user={{ id: user.id, email: user.email }}
                    />
                  ) : (
                    <div className='flex flex-wrap items-center justify-end gap-2'>
                      <EditUserDialog
                        user={{ id: user.id, email: user.email, role: user.role }}
                      />
                      <DeleteUserDialog
                        user={{ id: user.id, email: user.email }}
                      />
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
