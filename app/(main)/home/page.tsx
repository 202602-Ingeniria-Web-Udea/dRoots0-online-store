import { RecentMovements } from "@/components/dashboard/recent-movements";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { requireUser } from "@/lib/auth/session";
import { getDashboardSummary } from "@/lib/inventory/dashboard";

export default async function Home() {
  const user = await requireUser();
  const summary = await getDashboardSummary();

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
          <p className='text-sm text-muted-foreground'>
            Welcome back, {user.name}.
          </p>
        </div>
        <span className='inline-flex rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground'>
          {user.role}
        </span>
      </div>

      <SummaryCards summary={summary} />
      <RecentMovements movements={summary.recentMovements} />
    </div>
  );
}
