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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createMovement } from "@/lib/actions/movements";
import {
  createMovementSchema,
  type CreateMovementInput,
} from "@/lib/inventory/schemas";

const TYPE_ITEMS = [
  { label: "Incoming", value: "INCOMING" },
  { label: "Outgoing", value: "OUTGOING" },
];

export function AddMovementDialog({
  masterId,
  masterName,
}: {
  masterId: string;
  masterName: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const defaults: CreateMovementInput = { masterId, type: "INCOMING", quantity: "" };
  const form = useForm<CreateMovementInput>({
    resolver: zodResolver(createMovementSchema),
    defaultValues: defaults,
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: CreateMovementInput) {
    const result = await createMovement({ ...values, masterId });

    if (!result.ok) {
      // Keep the dialog open and the typed values.
      const message = result.fieldErrors?.quantity;
      if (message) form.setError("quantity", { message });
      toast.error(result.error);
      return;
    }

    toast.success("Movement registered");
    form.reset(defaults);
    setOpen(false);
    router.refresh(); // refreshes the table and the chart
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) setOpen(next);
      }}
    >
      <DialogTrigger render={<Button type="button">Add Movement</Button>} />
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Add movement: {masterName}</DialogTitle>
            <DialogDescription>
              Movements cannot be edited or deleted once they are created.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="movement-type">Type</Label>
                  <Select
                    items={TYPE_ITEMS}
                    name={field.name}
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                  >
                    <SelectTrigger id="movement-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TYPE_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="quantity"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Label htmlFor="movement-quantity">Quantity</Label>
                  <Input
                    {...field}
                    id="movement-quantity"
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
              {isSubmitting ? "Saving…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}