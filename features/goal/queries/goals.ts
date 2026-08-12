import { TransactionType } from "@/lib/generated/prisma/client";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import {
  avgMonthlySavings,
  totalAmountNeeded,
  totalSaved,
} from "@/features/goal/goal-math";

export async function getDemoGoals() {
  const user = await getDemoUser();

  return prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: [{ priority: "asc" }, { targetDate: "asc" }],
  });
}

export async function getDashboardData() {
  const user = await getDemoUser();

  const [goals, deposits] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: [{ priority: "asc" }, { targetDate: "asc" }],
    }),
    prisma.transaction.findMany({
      where: {
        type: TransactionType.DEPOSIT,
        goal: { userId: user.id },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    currency: user.currency,
    goals,
    stats: {
      currency: user.currency,
      totalSaved: totalSaved(goals),
      totalGoals: goals.length,
      amountNeeded: totalAmountNeeded(goals),
      avgMonthlySavings: avgMonthlySavings(deposits),
    },
  };
}

export async function getOverviewStats() {
  const { stats } = await getDashboardData();
  return stats;
}

export async function getGoalDetail(goalId: string) {
  const user = await getDemoUser();

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
    include: {
      transactions: {
        where: { type: TransactionType.DEPOSIT },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!goal) {
    return null;
  }

  return {
    currency: user.currency,
    goal,
  };
}

export async function getGoalOptions() {
  const user = await getDemoUser();

  return prisma.goal.findMany({
    where: { userId: user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
