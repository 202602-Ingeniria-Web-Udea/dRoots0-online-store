"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";

export default function UsersError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex max-w-xl flex-col gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6'>
      <div role='alert' className='space-y-2'>
        <h1 className='text-lg font-semibold'>Unable to load users</h1>
        <p className='text-sm text-muted-foreground'>
          Something went wrong while loading the users list. Please try again.
        </p>
      </div>
      <div className='flex flex-wrap items-center gap-3'>
        <Button type='button' className='w-fit' onClick={() => reset()}>
          Try again
        </Button>
        <Link href='/home' className={buttonVariants({ variant: "outline" })}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
