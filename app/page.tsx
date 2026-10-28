import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="max-w-md text-muted-foreground">
          Track inventory masters, movements, and daily balances in one place.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Sign in
      </Link>
    </main>
  );
}