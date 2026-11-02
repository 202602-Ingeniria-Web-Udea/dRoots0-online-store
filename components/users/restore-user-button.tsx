"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { restoreUser } from "@/lib/actions/users";

export function RestoreUserButton({
  user,
}: {
  user: { id: string; email: string };
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleRestore() {
    setError(null);
    startTransition(async () => {
      const result = await restoreUser({ userId: user.id });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success("User restored");

      const url = new URL(window.location.href);
      url.searchParams.set("_r", Date.now().toString());
      router.replace(`${url.pathname}?${url.searchParams.toString()}`, {
        scroll: false,
      });
    });
  }

  return (
    <div className='flex flex-col items-end gap-1'>
      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={handleRestore}
        disabled={pending}
        aria-label={`Restore ${user.email}`}
      >
        {pending ? "Restoring…" : "Restore"}
      </Button>
      {error ? (
        <p role='alert' className='text-xs text-destructive'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
