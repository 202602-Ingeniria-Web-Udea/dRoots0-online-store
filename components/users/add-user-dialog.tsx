"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { createUser } from "@/lib/actions/users";
import {
  createUserSchema,
  type CreateUserInput,
} from "@/lib/users/schema";
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const ROLE_ITEMS = [
  { label: "Administrator", value: "ADMIN" },
  { label: "User", value: "USER" },
];

const DEFAULT_VALUES: CreateUserInput = {
  name: "",
  email: "",
  role: "USER",
  password: "",
};

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(values: CreateUserInput) {
    setServerError(null);
    const result = await createUser(values);

    if (!result.ok) {
      setServerError(result.error);
      for (const field of ["name", "email", "role", "password"] as const) {
        const message = result.fieldErrors?.[field];
        if (message) form.setError(field, { message });
      }
      toast.error(result.error);
      return;
    }

    toast.success("User created");
    form.reset(DEFAULT_VALUES);
    setOpen(false);
    router.replace(`/users?_r=${encodeURIComponent(result.data?.id ?? "created")}`, {
      scroll: false,
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!isSubmitting) {
          setOpen(next);
          if (next) {
            setServerError(null);
          }
        }
      }}
    >
      <DialogTrigger render={<Button type='button'>Add User</Button>} />
      <DialogContent className='sm:max-w-md'>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className='grid gap-6'>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              Create an account with a temporary password and an initial role.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='new-user-name'>Name</FieldLabel>
                  <Input
                    {...field}
                    id='new-user-name'
                    autoComplete='name'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='new-user-email'>Email</FieldLabel>
                  <Input
                    {...field}
                    id='new-user-email'
                    type='email'
                    autoComplete='email'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='new-user-password'>
                    Temporary password
                  </FieldLabel>
                  <Input
                    {...field}
                    id='new-user-password'
                    type='password'
                    autoComplete='new-password'
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    At least 8 characters. The user signs in with this password.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name='role'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field orientation='responsive' data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor='new-user-role'>Role</FieldLabel>
                    <FieldDescription>Initial access level.</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                  <Select
                    items={ROLE_ITEMS}
                    name={field.name}
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                  >
                    <SelectTrigger id='new-user-role' className='w-full max-w-48'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Role</SelectLabel>
                        {ROLE_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>

          {serverError ? (
            <p role='alert' className='text-sm text-destructive'>
              {serverError}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
