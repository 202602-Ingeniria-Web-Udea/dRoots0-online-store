"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";

export default function MainError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-6 rounded-lg border bg-card p-8 text-center'>
      <div role='alert' className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>Unable to load this page</h1>
        <p className='max-w-md text-muted-foreground'>
          Something went wrong while loading this page. Please try again.
        </p>
      </div>
      <div className='flex flex-wrap items-center justify-center gap-3'>
        <Button type='button' onClick={() => reset()}>
          Try again
        </Button>
        <Link href='/home' className={buttonVariants({ variant: "outline" })}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
