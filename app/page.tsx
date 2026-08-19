import { Suspense } from "react";

import { AddGoalButton } from "@/features/goal/components/add-goal-button";
import { GoalCard } from "@/features/goal/components/goal-card";
import { OverviewStats } from "@/components/overview-stats";
import { Placeholder } from "@/components/placeholder";
import { PageSpinner } from "@/components/ui/spinner";
import { getGoalStatus } from "@/features/goal/goal-math";
import { getDashboardData } from "@/features/goal/queries/goals";
import { toNumber } from "@/utils/money";

export default function Home() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const { currency, goals, stats } = await getDashboardData();
  const activeGoals = goals.filter(
    (goal) =>
      getGoalStatus(goal.currentAmount, goal.targetAmount) !== "Completed",
  );

  return (
    <div className="flex-1 flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Your Goals
          </h2>
          <AddGoalButton currency={currency} />
        </div>

        {activeGoals.length === 0 ? (
          <Placeholder
            label={goals.length === 0 ? "No goals yet" : "No active goals"}
            description={
              goals.length === 0
                ? "Create your first savings goal to start tracking progress."
                : "Completed goals stay on the Goals page. Add a new one to keep saving."
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeGoals.slice(0, 3).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={{
                  id: goal.id,
                  name: goal.name,
                  description: goal.description,
                  currentAmount: toNumber(goal.currentAmount),
                  targetAmount: toNumber(goal.targetAmount),
                  targetDate: goal.targetDate?.toISOString() ?? null,
                  category: goal.category,
                  priority: goal.priority,
                }}
                currency={currency}
              />
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
