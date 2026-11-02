import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div
      className='flex flex-col gap-6'
      role='status'
      aria-live='polite'
      aria-busy='true'
    >
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-4 w-56' />
      </div>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='h-32 rounded-xl' />
        ))}
      </div>
      <Skeleton className='h-64 rounded-xl' />
      <span className='sr-only'>Loading dashboard…</span>
    </div>
  );
}
