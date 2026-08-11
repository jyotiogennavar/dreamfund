import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  GoalCategory,
  GoalPriority,
  PrismaClient,
  TransactionType,
} from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const goals = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Emergency Fund",
    description: "3–6 months of essential expenses for peace of mind.",
    targetAmount: 300_000,
    currentAmount: 120_000,
    targetDate: new Date("2026-12-31"),
    category: GoalCategory.EMERGENCY,
    priority: GoalPriority.HIGH,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Japan Trip",
    description: "Two weeks exploring Tokyo, Kyoto, and Osaka.",
    targetAmount: 250_000,
    currentAmount: 85_000,
    targetDate: new Date("2027-06-30"),
    category: GoalCategory.TRAVEL,
    priority: GoalPriority.MEDIUM,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "New Laptop",
    description: "Lightweight machine for work and creative projects.",
    targetAmount: 150_000,
    currentAmount: 45_000,
    targetDate: new Date("2026-10-31"),
    category: GoalCategory.GADGET,
    priority: GoalPriority.LOW,
  },
];

const transactions = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    amount: 50_000,
    type: TransactionType.DEPOSIT,
    note: "Initial transfer",
    createdAt: new Date("2026-01-15"),
    goalId: goals[0].id,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    amount: 40_000,
    type: TransactionType.DEPOSIT,
    note: "February savings",
    createdAt: new Date("2026-02-10"),
    goalId: goals[0].id,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    amount: 30_000,
    type: TransactionType.DEPOSIT,
    note: "Bonus allocation",
    createdAt: new Date("2026-03-05"),
    goalId: goals[0].id,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    amount: 50_000,
    type: TransactionType.DEPOSIT,
    note: "Trip kickoff",
    createdAt: new Date("2026-01-20"),
    goalId: goals[1].id,
  },
  {
    id: "20000000-0000-4000-8000-000000000005",
    amount: 35_000,
    type: TransactionType.DEPOSIT,
    note: "Tax refund",
    createdAt: new Date("2026-03-12"),
    goalId: goals[1].id,
  },
  {
    id: "20000000-0000-4000-8000-000000000006",
    amount: 25_000,
    type: TransactionType.DEPOSIT,
    note: "First laptop deposit",
    createdAt: new Date("2026-02-01"),
    goalId: goals[2].id,
  },
  {
    id: "20000000-0000-4000-8000-000000000007",
    amount: 20_000,
    type: TransactionType.DEPOSIT,
    note: "March top-up",
    createdAt: new Date("2026-03-18"),
    goalId: goals[2].id,
  },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@dreamfund.app" },
    update: {
      name: "Demo User",
      currency: "INR",
      notifyGoalAchieved: true,
      notifyMonthlySummary: true,
      notifyDepositReminder: false,
    },
    create: {
      email: "demo@dreamfund.app",
      name: "Demo User",
      currency: "INR",
      notifyGoalAchieved: true,
      notifyMonthlySummary: true,
      notifyDepositReminder: false,
    },
  });

  for (const goal of goals) {
    await prisma.goal.upsert({
      where: { id: goal.id },
      update: { ...goal, userId: user.id },
      create: { ...goal, userId: user.id },
    });
  }

  for (const transaction of transactions) {
    await prisma.transaction.upsert({
      where: { id: transaction.id },
      update: transaction,
      create: transaction,
    });
  }
}

main()
  .then(() => {
    console.log("Database seeded successfully.");
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
