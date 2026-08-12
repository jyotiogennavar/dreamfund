import { CompletionChart } from "@/features/analytics/components/completion-chart";
import { PriorityChart } from "@/features/analytics/components/priority-chart";
import { RecentTransactions } from "@/features/analytics/components/recent-transactions";
import { OverviewStats } from "@/components/overview-stats";
import {
  buildCompletionChartData,
  buildPriorityChartData,
} from "@/features/analytics/analytics";
import { toNumber } from "@/utils/money";
import { getAnalyticsData } from "@/features/analytics/queries/analytics";

export default async function AnalyticsPage() {
  const { currency, goals, transactions, stats } = await getAnalyticsData();
  const completion = buildCompletionChartData(goals);
  const priority = buildPriorityChartData(goals);

  const recentTransactions = transactions.map((transaction) => ({
    id: transaction.id,
    amount: toNumber(transaction.amount),
    note: transaction.note,
    createdAt: transaction.createdAt.toISOString(),
    goalName: transaction.goal.name,
    category: transaction.goal.category,
  }));

  return (
    <div className="flex flex-col gap-8">
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

      <section className="grid gap-4 lg:grid-cols-2">
        <CompletionChart
          overallPercent={completion.overallPercent}
          segments={completion.segments}
        />
        <PriorityChart segments={priority} />
      </section>

      <RecentTransactions
        currency={currency}
        transactions={recentTransactions}
      />
    </div>
  );
}
