"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { updateProfileImage } from "@/lib/actions/profile";
import { initialsFor } from "@/lib/profile/initials";
import {
  profileImageSchema,
  type ProfileImageInput,
} from "@/lib/profile/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ProfileForm({
  user,
}: {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ProfileImageInput>({
    resolver: zodResolver(profileImageSchema),
    defaultValues: { image: user.image ?? "" },
  });
  const { isSubmitting } = form.formState;
  const image = useWatch({ control: form.control, name: "image" }) ?? "";
  const initials = initialsFor(user.name, user.email);

  async function onSubmit(values: ProfileImageInput) {
    setServerError(null);
    const result = await updateProfileImage(values);

    if (!result.ok) {
      setServerError(result.error);
      if (result.fieldErrors?.image) {
        form.setError("image", { message: result.fieldErrors.image });
      }
      toast.error(result.error);
      return;
    }

    toast.success("Profile image updated");
    form.reset({ image: result.data?.image ?? values.image });
    // Force a fresh layout render so the sidebar receives the new image.
    router.replace(
      `/profile?_r=${encodeURIComponent(result.data?.image ?? "saved")}`,
      { scroll: false }
    );
  }

  return (
    <Card className='max-w-xl'>
      <CardHeader>
        <CardTitle>Profile image</CardTitle>
        <CardDescription>
          This image appears next to your name in the sidebar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          <div className='flex items-center gap-4'>
            <Avatar className='size-16'>
              <AvatarImage src={image || undefined} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className='text-sm'>
              <p className='font-medium'>{user.name}</p>
              <p className='text-muted-foreground'>{user.email}</p>
            </div>
          </div>

          <FieldGroup>
            <Controller
              name='image'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='profile-image'>Image URL</FieldLabel>
                  <Input
                    {...field}
                    id='profile-image'
                    placeholder='/avatars/admin.svg or https://…'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Use an https image URL or a local /avatars/... path.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>

          {serverError ? (
            <p role='alert' className='text-sm text-destructive'>
              {serverError}
            </p>
          ) : null}

          <div className='flex flex-wrap items-center gap-3'>
            <Button
              type='submit'
              disabled={isSubmitting || image === (user.image ?? "")}
            >
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
            <Button
              type='button'
              variant='outline'
              disabled={isSubmitting}
              onClick={() => {
                form.reset({ image: user.image ?? "" });
                setServerError(null);
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
