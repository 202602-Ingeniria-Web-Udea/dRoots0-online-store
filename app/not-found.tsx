import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 text-center'>
      <div className='space-y-2'>
        <p className='text-sm font-medium uppercase tracking-widest text-muted-foreground'>
          404
        </p>
        <h1 className='text-3xl font-bold tracking-tight'>Page not found</h1>
        <p className='max-w-md text-muted-foreground'>
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <div className='flex flex-wrap items-center justify-center gap-3'>
        <Link href='/' className={buttonVariants()}>
          Back to home
        </Link>
        <Link href='/login' className={buttonVariants({ variant: "outline" })}>
          Sign in
        </Link>
      </div>
    </main>
  );
}
