"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createMaster } from "@/lib/actions/masters";
import {
  createMasterSchema,
  type CreateMasterInput,
} from "@/lib/inventory/schemas";

const DEFAULT_VALUES: CreateMasterInput = { name: "", initialBalance: "0" };

export function CreateMasterDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const form = useForm<CreateMasterInput>({
    resolver: zodResolver(createMasterSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: CreateMasterInput) {
    const result = await createMaster(values);

    if (!result.ok) {
      // Keep the dialog open and the typed values.
      const errors = result.fieldErrors ?? {};
      if (errors.name) form.setError("name", { message: errors.name });
      if (errors.initialBalance) {
        form.setError("initialBalance", { message: errors.initialBalance });
      }
      toast.error(result.error);
      return;
    }

    toast.success("Inventory master created");
    form.reset(DEFAULT_VALUES);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) setOpen(next);
      }}
    >
      <DialogTrigger render={<Button type="button">Add Master</Button>} />
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Add inventory master</DialogTitle>
            <DialogDescription>
              Create a new item with its initial balance.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="master-name">Name</Label>
                  <Input
                    {...field}
                    id="master-name"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="initialBalance"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="master-initial-balance">Initial balance</Label>
                  <Input
                    {...field}
                    id="master-initial-balance"
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}