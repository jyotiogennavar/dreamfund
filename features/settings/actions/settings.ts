"use server";

import { revalidatePath } from "next/cache";

import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import {
  analyticsPath,
  goalsPath,
  homePath,
  settingsPath,
} from "@/paths";

export type SettingsActionState = {
  error?: string;
  success?: boolean;
};

const SUPPORTED_CURRENCIES = ["INR", "USD", "EUR", "GBP"] as const;

function revalidateAppPaths() {
  revalidatePath(homePath());
  revalidatePath(goalsPath());
  revalidatePath(analyticsPath());
  revalidatePath(settingsPath());
}

export async function updateSettings(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "INR").trim();
  const notifyGoalAchieved = formData.get("notifyGoalAchieved") === "on";
  const notifyMonthlySummary = formData.get("notifyMonthlySummary") === "on";
  const notifyDepositReminder = formData.get("notifyDepositReminder") === "on";

  if (!name) {
    return { error: "Full name is required." };
  }

  if (
    !SUPPORTED_CURRENCIES.includes(
      currency as (typeof SUPPORTED_CURRENCIES)[number],
    )
  ) {
    return { error: "Select a supported currency." };
  }

  const user = await getDemoUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      currency,
      notifyGoalAchieved,
      notifyMonthlySummary,
      notifyDepositReminder,
    },
  });

  revalidateAppPaths();
  return { success: true };
}

export async function clearAllData(): Promise<SettingsActionState> {
  const user = await getDemoUser();

  await prisma.goal.deleteMany({
    where: { userId: user.id },
  });

  revalidateAppPaths();
  return { success: true };
}

export async function getExportCsv(): Promise<string> {
  const user = await getDemoUser();

  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const rows = [
    [
      "goal_id",
      "goal_name",
      "description",
      "category",
      "priority",
      "target_amount",
      "current_amount",
      "target_date",
      "transaction_id",
      "transaction_type",
      "transaction_amount",
      "transaction_note",
      "transaction_date",
    ],
  ];

  for (const goal of goals) {
    if (goal.transactions.length === 0) {
      rows.push([
        goal.id,
        goal.name,
        goal.description ?? "",
        goal.category,
        goal.priority,
        String(goal.targetAmount),
        String(goal.currentAmount),
        goal.targetDate?.toISOString() ?? "",
        "",
        "",
        "",
        "",
        "",
      ]);
      continue;
    }

    for (const transaction of goal.transactions) {
      rows.push([
        goal.id,
        goal.name,
        goal.description ?? "",
        goal.category,
        goal.priority,
        String(goal.targetAmount),
        String(goal.currentAmount),
        goal.targetDate?.toISOString() ?? "",
        transaction.id,
        transaction.type,
        String(transaction.amount),
        transaction.note ?? "",
        transaction.createdAt.toISOString(),
      ]);
    }
  }

  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = cell.replaceAll('"', '""');
          return `"${value}"`;
        })
        .join(","),
    )
    .join("\n");
}
