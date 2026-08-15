"use server";

import { revalidatePath } from "next/cache";

import { getDemoUser } from "@/lib/demo-user";
import { parseForm } from "@/lib/form";
import { prisma } from "@/lib/db";
import { updateSettingsSchema } from "@/features/settings/schemas";
import {
  analyticsPath,
  goalsPath,
  homePath,
  settingsPath,
} from "@/paths";

export type SettingsActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

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
  const parsed = parseForm(updateSettingsSchema, formData);
  if (!parsed.success) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const user = await getDemoUser();

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
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
