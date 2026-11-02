import type { Metadata } from "next";

import { ProfileForm } from "@/components/profile/profile-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>Profile</h1>
        <p className='text-sm text-muted-foreground'>
          Update the image shown in the application sidebar.
        </p>
      </div>
      <ProfileForm
        user={{ name: user.name, email: user.email, image: user.image }}
      />
    </div>
  );
}
