import { getGoalStatus, type GoalStatus } from "@/features/goal/goal-math";
import { toNumber } from "@/utils/money";
import type { GoalPriority } from "@/lib/generated/prisma/enums";

type Amount = number | string | { toString(): string };

export { getGoalStatus, type GoalStatus };

export function buildCompletionChartData(
  goals: { currentAmount: Amount; targetAmount: Amount }[],
) {
  const counts: Record<GoalStatus, number> = {
    Completed: 0,
    "In Progress": 0,
    "Not Started": 0,
  };

  for (const goal of goals) {
    counts[getGoalStatus(goal.currentAmount, goal.targetAmount)] += 1;
  }

  return {
    overallPercent: overallTargetPercent(goals),
    segments: [
      { name: "Completed", value: counts.Completed, fill: "var(--chart-1)" },
      { name: "In Progress", value: counts["In Progress"], fill: "var(--chart-2)" },
      { name: "Not Started", value: counts["Not Started"], fill: "var(--chart-3)" },
    ].filter((segment) => segment.value > 0),
  };
}

export function buildPriorityChartData(
  goals: { priority: GoalPriority }[],
) {
  const counts: Record<GoalPriority, number> = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  for (const goal of goals) {
    counts[goal.priority] += 1;
  }

  return [
    { name: "High", value: counts.HIGH, fill: "var(--chart-1)" },
    { name: "Medium", value: counts.MEDIUM, fill: "var(--chart-2)" },
    { name: "Low", value: counts.LOW, fill: "var(--chart-3)" },
  ].filter((segment) => segment.value > 0);
}

/** Share of target amount saved; 100% only when every valid target is met. */
function overallTargetPercent(
  goals: { currentAmount: Amount; targetAmount: Amount }[],
): number {
  let totalTarget = 0;
  let totalCapped = 0;

  for (const goal of goals) {
    const target = toNumber(goal.targetAmount);
    if (target <= 0) {
      continue;
    }

    const current = Math.max(0, toNumber(goal.currentAmount));
    totalTarget += target;
    totalCapped += Math.min(current, target);
  }

  if (totalTarget <= 0 || totalCapped <= 0) {
    return 0;
  }

  if (totalCapped >= totalTarget) {
    return 100;
  }

  const rounded = Math.round((totalCapped / totalTarget) * 100);
  return Math.min(99, Math.max(1, rounded));
}
