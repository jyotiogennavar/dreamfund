import { AddGoalButton } from "@/components/goals/add-goal-button";
import { GoalCard } from "@/components/goals/goal-card";
import { OverviewStats } from "@/components/overview-stats";
import { getDashboardData } from "@/lib/queries/goals";

export default async function Home() {
  const { currency, goals, stats } = await getDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Your Goals
          </h2>
          <AddGoalButton />
        </div>

        {goals.length === 0 ? (
          <div className="rounded-4xl border border-dashed px-6 py-12 text-center">
            <p className="font-heading text-lg font-medium">No goals yet</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Create your first savings goal to start tracking progress.
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} currency={currency} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Overview
        </h2>
        <OverviewStats
          currency={stats.currency}
          totalSaved={stats.totalSaved}
          totalGoals={stats.totalGoals}
          amountNeeded={stats.amountNeeded}
          avgMonthlySavings={stats.avgMonthlySavings}
        />
      </section>
    </div>
  );
}
