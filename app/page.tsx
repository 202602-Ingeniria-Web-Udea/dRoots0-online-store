import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Inventory masters",
    description:
      "Register every item with a unique name and an initial balance, and keep track of who created it.",
  },
  {
    title: "Movement tracking",
    description:
      "Record incoming and outgoing stock. Movements are append-only and always linked to a responsible user.",
  },
  {
    title: "Reliable balances",
    description:
      "Current and historical balances are derived from the initial balance and the movement history.",
  },
  {
    title: "Role-based access",
    description:
      "Administrators manage masters and users; every team member can register movements and review history.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <span className="text-lg font-semibold tracking-tight">dRoots0</span>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Sign in
        </Link>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Online store inventory
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Know exactly what you have, at any moment.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            dRoots0 helps your store keep its inventory under control: register
            items, log every stock movement and follow balances over time, with
            a clear owner for each change.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "px-8")}>
              Sign in
            </Link>
          </div>
        </section>

        <section aria-labelledby="features-heading" className="border-t bg-muted/40">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <h2
              id="features-heading"
              className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
            >
              Everything you need to manage stock
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="rounded-xl bg-background p-5 ring-1 ring-foreground/10">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} dRoots0 online store
      </footer>
    </div>
  );
}
