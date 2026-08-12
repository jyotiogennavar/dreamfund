import { differenceInCalendarMonths, isAfter, startOfMonth } from "date-fns";

import { toNumber } from "@/utils/money";

type Amount = number | string | { toString(): string };

export function goalProgressPercent(
  currentAmount: Amount,
  targetAmount: Amount,
): number {
  const target = toNumber(targetAmount);
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((toNumber(currentAmount) / target) * 100));
}

export function amountNeeded(
  currentAmount: Amount,
  targetAmount: Amount,
): number {
  return Math.max(0, toNumber(targetAmount) - toNumber(currentAmount));
}

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

export function totalSaved(goals: { currentAmount: Amount }[]): number {
  return goals.reduce((sum, goal) => sum + toNumber(goal.currentAmount), 0);
}

export function totalAmountNeeded(
  goals: { currentAmount: Amount; targetAmount: Amount }[],
): number {
  return goals.reduce(
    (sum, goal) => sum + amountNeeded(goal.currentAmount, goal.targetAmount),
    0,
  );
}
