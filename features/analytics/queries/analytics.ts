import { TransactionType } from "@/lib/generated/prisma/client";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import {
  avgMonthlySavings,
  totalAmountNeeded,
  totalSaved,
} from "@/features/goal/goal-math";

export async function getAnalyticsData() {
  const user = await getDemoUser();

  const depositWhere = {
    type: TransactionType.DEPOSIT,
    goal: { userId: user.id },
  };

  const [goals, deposits, recentDeposits] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        currentAmount: true,
        targetAmount: true,
        priority: true,
        category: true,
      },
    }),
    prisma.transaction.findMany({
      where: depositWhere,
      select: {
        amount: true,
        createdAt: true,
      },
    }),
    prisma.transaction.findMany({
      where: depositWhere,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        note: true,
        createdAt: true,
        goal: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    }),
  ]);

  return {
    currency: user.currency,
    goals,
    transactions: recentDeposits,
    stats: {
      currency: user.currency,
      totalSaved: totalSaved(goals),
      totalGoals: goals.length,
      amountNeeded: totalAmountNeeded(goals),
      avgMonthlySavings: avgMonthlySavings(deposits),
    },
  };
}
