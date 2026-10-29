import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SKELETON_ROWS = 6;

export default function UsersLoading() {
  return (
    <div className='flex flex-col gap-6' aria-busy='true'>
      <span role='status' className='sr-only'>
        Loading users
      </span>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-8 w-24' />
        <Skeleton className='h-4 w-72' />
      </div>
      <div className='overflow-x-auto rounded-lg border'>
        <Table className='min-w-[720px]'>
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
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className='h-4 w-40' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-24' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-48' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-16 rounded-full' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='ml-auto h-8 w-14' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
