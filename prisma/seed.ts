import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  GoalCategory,
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
    name: "Buy a new car",
    targetAmount: 10_000,
    currentAmount: 1_000,
    targetDate: new Date("2026-12-31"),
    category: GoalCategory.CAR,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Japan Trip",
    targetAmount: 1_000_000,
    currentAmount: 1_000,
    targetDate: new Date("2027-12-31"),
    category: GoalCategory.TRAVEL,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "New Laptop",
    targetAmount: 150_000,
    currentAmount: 1_000,
    targetDate: new Date("2027-12-31"),
    category: GoalCategory.CUSTOM,
  },
];

const transactions = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    amount: 1_000,
    type: TransactionType.DEPOSIT,
    note: "Initial deposit",
    goalId: goals[0].id,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    amount: 1_000,
    type: TransactionType.DEPOSIT,
    note: "Initial deposit",
    goalId: goals[1].id,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    amount: 1_000,
    type: TransactionType.DEPOSIT,
    note: "Initial deposit",
    goalId: goals[2].id,
  },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@dreamfund.app" },
    update: {},
    create: { email: "demo@dreamfund.app" },
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

