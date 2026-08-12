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

  const [goals, deposits] = await Promise.all([
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
      where: {
        type: TransactionType.DEPOSIT,
        goal: { userId: user.id },
      },
      orderBy: { createdAt: "desc" },
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
    transactions: deposits.slice(0, 20),
    stats: {
      currency: user.currency,
      totalSaved: totalSaved(goals),
      totalGoals: goals.length,
      amountNeeded: totalAmountNeeded(goals),
      avgMonthlySavings: avgMonthlySavings(deposits),
    },
  };
}
