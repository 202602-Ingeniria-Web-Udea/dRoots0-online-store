"use client";

import { useActionState } from "react";
import Link from "next/link";

import { authenticate } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [state, formAction, pending] = useActionState(authenticate, undefined);
  const errorId = "login-error";

  return (
    <div className={className} {...props}>
      <Card>
        <CardHeader>
          <h1 className="font-heading text-2xl leading-normal font-medium">Sign in</h1>
          <CardDescription>Access the inventory management workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} aria-busy={pending}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  aria-invalid={Boolean(state?.error)}
                  aria-describedby={state?.error ? errorId : undefined}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  aria-invalid={Boolean(state?.error)}
                  aria-describedby={state?.error ? errorId : undefined}
                />
              </Field>
              {state?.error ? (
                <p id={errorId} role="alert" className="text-sm text-destructive">
                  {state.error}
                </p>
              ) : null}
              <Field>
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending ? "Signing in..." : "Sign in"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:underline">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
