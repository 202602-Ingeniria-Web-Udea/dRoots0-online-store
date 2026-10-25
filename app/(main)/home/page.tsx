import { requireUser } from "@/lib/auth/session";

export default async function Home() {
  const user = await requireUser();

  return (
    <div className="flex flex-1 flex-col gap-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Signed in as {user.name}</p>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium">Email:</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">Role:</dt>
          <dd>{user.role}</dd>
        </div>
      </dl>
    </div>
  );
}
