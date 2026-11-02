import { Skeleton } from "@/components/ui/skeleton";

export default function MastersLoading() {
  return (
    <div className='space-y-6' role='status' aria-live='polite' aria-busy='true'>
      <Skeleton className='h-8 w-56' />
      <Skeleton className='h-64 w-full rounded-xl' />
      <span className='sr-only'>Loading inventory masters…</span>
    </div>
  );
}
