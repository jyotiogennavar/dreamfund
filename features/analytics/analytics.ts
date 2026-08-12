import { toNumber } from "@/utils/money";
import type { GoalPriority } from "@/lib/generated/prisma/enums";

type Amount = number | string | { toString(): string };

export type GoalStatus = "Completed" | "In Progress" | "Not Started";

export function getGoalStatus(
  currentAmount: Amount,
  targetAmount: Amount,
): GoalStatus {
  const current = toNumber(currentAmount);
  const target = toNumber(targetAmount);

  if (current <= 0) {
    return "Not Started";
  }

  if (current >= target && target > 0) {
    return "Completed";
  }

  return "In Progress";
}

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

  const totalTarget = goals.reduce(
    (sum, goal) => sum + toNumber(goal.targetAmount),
    0,
  );
  const totalCurrent = goals.reduce(
    (sum, goal) => sum + toNumber(goal.currentAmount),
    0,
  );

  return {
    overallPercent:
      totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0,
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
