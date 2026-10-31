"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 text-center'>
      <div role='alert' className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Something went wrong</h1>
        <p className='max-w-md text-muted-foreground'>
          An unexpected error occurred while loading this page. Please try again.
        </p>
      </div>
      <div className='flex flex-wrap items-center justify-center gap-3'>
        <Button type='button' onClick={() => reset()}>
          Try again
        </Button>
        <Link href='/' className={buttonVariants({ variant: "outline" })}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
