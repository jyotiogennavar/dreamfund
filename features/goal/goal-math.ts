import { differenceInCalendarMonths, isAfter, startOfMonth } from "date-fns";

import { formatMoney, toNumber } from "@/utils/money";

type Amount = number | string | { toString(): string };

export type GoalStatus = "Completed" | "In Progress" | "Not Started";

/** Shared card/analytics label: not started, in progress, or completed. */
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

/** Whole-number progress; 100% only when reached, 1–99% while in progress. */
export function goalProgressPercent(
  currentAmount: Amount,
  targetAmount: Amount,
): number {
  const current = toNumber(currentAmount);
  const target = toNumber(targetAmount);

  if (target <= 0 || current <= 0) {
    return 0;
  }

  if (current >= target) {
    return 100;
  }

  const rounded = Math.round((current / target) * 100);
  return Math.min(99, Math.max(1, rounded));
}

/** Remaining amount copy, or "Goal reached" once the target is met. */
export function formatGoalRemaining(
  currentAmount: Amount,
  targetAmount: Amount,
  currency: string,
): string {
  if (getGoalStatus(currentAmount, targetAmount) === "Completed") {
    return "Goal reached";
  }

  return `${formatMoney(amountNeeded(currentAmount, targetAmount), currency)} remaining`;
}

/** How much is left to save; never negative after overshooting. */
export function amountNeeded(
  currentAmount: Amount,
  targetAmount: Amount,
): number {
  return Math.max(0, toNumber(targetAmount) - toNumber(currentAmount));
}

/** Monthly amount needed to hit a future deadline; null if none is set. */
export function suggestedMonthlySavings(
  currentAmount: Amount,
  targetAmount: Amount,
  targetDate: Date | null | undefined,
  now = new Date(),
): number | null {
  if (!targetDate || !isAfter(targetDate, now)) {
    return null;
  }

  const remaining = amountNeeded(currentAmount, targetAmount);
  if (remaining <= 0) {
    return 0;
  }

  const months = Math.max(1, differenceInCalendarMonths(targetDate, now));
  return Math.ceil(remaining / months);
}

/** Average deposited per calendar month that had at least one deposit. */
export function avgMonthlySavings(
  deposits: { amount: Amount; createdAt: Date }[],
): number {
  if (deposits.length === 0) {
    return 0;
  }

  const total = deposits.reduce(
    (sum, deposit) => sum + toNumber(deposit.amount),
    0,
  );
  const months = new Set(
    deposits.map((deposit) => startOfMonth(deposit.createdAt).toISOString()),
  );

  return Math.round(total / Math.max(1, months.size));
}

/** Sum of current amounts across all goals. */
export function totalSaved(goals: { currentAmount: Amount }[]): number {
  return goals.reduce((sum, goal) => sum + toNumber(goal.currentAmount), 0);
}

/** Sum of remaining amounts across all goals. */
export function totalAmountNeeded(
  goals: { currentAmount: Amount; targetAmount: Amount }[],
): number {
  return goals.reduce(
    (sum, goal) => sum + amountNeeded(goal.currentAmount, goal.targetAmount),
    0,
  );
}
