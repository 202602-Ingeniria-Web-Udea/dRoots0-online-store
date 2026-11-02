"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteUser } from "@/lib/actions/users";

export function DeleteUserDialog({
  user,
}: {
  user: { id: string; email: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpenChange(nextOpen: boolean) {
    if (pending) return;
    setOpen(nextOpen);
    if (nextOpen) setError(null);
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser({ userId: user.id });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success("User deleted");
      setOpen(false);

      const url = new URL(window.location.href);
      url.searchParams.set("_r", Date.now().toString());
      router.replace(`${url.pathname}?${url.searchParams.toString()}`, {
        scroll: false,
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type='button' variant='destructive' size='sm'>
            Delete
          </Button>
        }
      />
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Delete user</DialogTitle>
          <DialogDescription>
            Delete {user.email}? They will no longer be able to sign in. Their
            inventory history will be kept, and you can restore the account
            later.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p role='alert' className='text-sm text-destructive'>
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting…" : "Delete user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
