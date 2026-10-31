import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-9 w-full sm:max-w-sm" />
      <Skeleton className="h-72 w-full rounded-xl" />
      <span className="sr-only">Loading transactions…</span>
    </div>
  );
}