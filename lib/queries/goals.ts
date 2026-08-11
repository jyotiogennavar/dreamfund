import { TransactionType } from "@/lib/generated/prisma/client";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import {
  avgMonthlySavings,
  totalAmountNeeded,
  totalSaved,
} from "@/lib/goal-math";

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
