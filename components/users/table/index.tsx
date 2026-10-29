import { EditUserDialog } from "@/components/users/edit-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type UserRole = "ADMIN" | "USER";

export type UserRow = {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function RoleBadge({ role }: { role: UserRole }) {
  const className =
    role === "ADMIN"
      ? "bg-primary/10 text-primary"
      : "bg-muted text-muted-foreground";

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
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  return (
    <div className='overflow-x-auto rounded-lg border'>
      <Table className='min-w-[720px]'>
        <TableCaption className='sr-only'>List of application users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className='h-24 text-center text-muted-foreground'>
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className='font-mono text-xs'>{user.id}</TableCell>
                <TableCell>{dateFormatter.format(user.createdAt)}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className='text-right'>
                  {user.id === currentUserId ? (
                    <span className='text-xs text-muted-foreground'>Current account</span>
                  ) : (
                    <EditUserDialog
                      user={{ id: user.id, email: user.email, role: user.role }}
                    />
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
