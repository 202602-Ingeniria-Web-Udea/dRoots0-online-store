"use client";

import { Button } from "@/components/ui/button";

export default function UsersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex max-w-xl flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6'>
      <h2 className='text-lg font-semibold'>Unable to load users</h2>
      <p className='text-sm text-muted-foreground'>
        Something went wrong while loading the users list. Please try again.
      </p>
      <Button className='w-fit' onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
