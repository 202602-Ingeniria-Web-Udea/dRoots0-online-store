"use client";

import { Button } from "@/components/ui/button";

export default function TransactionsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/40 p-8 text-center"
    >
      <h2 className="font-medium">Could not load the transactions</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong. Please try again.
      </p>
      <Button type="button" variant="outline" className="mt-4" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}