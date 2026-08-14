import { AddGoalButton } from "@/features/goal/components/add-goal-button";
import { GoalCard } from "@/features/goal/components/goal-card";
import { OverviewStats } from "@/components/overview-stats";
import { Placeholder } from "@/components/placeholder";
import { getDashboardData } from "@/features/goal/queries/goals";

export default async function Home() {
  const { currency, goals, stats } = await getDashboardData();

  return (
    <div className="flex-1 flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Your Goals
          </h2>
          <AddGoalButton currency={currency} />
        </div>

        {goals.length === 0 ? (
          <Placeholder
            label="No goals yet"
            description="Create your first savings goal to start tracking progress."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {goals.slice(0, 3).map((goal) => (
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
