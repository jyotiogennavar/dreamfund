"use server";

import { revalidatePath } from "next/cache";

import { updateSettingsSchema } from "@/features/settings/schemas";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import {
  fromErrorToActionState,
  parseForm,
  toActionState,
  type ActionState,
} from "@/lib/form";
import {
  analyticsPath,
  goalsPath,
  homePath,
  settingsPath,
} from "@/paths";

function revalidateAppPaths() {
  revalidatePath(homePath());
  revalidatePath(goalsPath());
  revalidatePath(analyticsPath());
  revalidatePath(settingsPath());
}

export async function updateSettings(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = parseForm(updateSettingsSchema, formData);
    if (!parsed.success) {
      return toActionState("ERROR", parsed.error, parsed.fieldErrors);
    }

    const user = await getDemoUser();

    await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
    });

    revalidateAppPaths();
    return toActionState("SUCCESS", "Settings saved");
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function clearAllData(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void prevState;
  void formData;

  try {
    const user = await getDemoUser();

    await prisma.goal.deleteMany({
      where: { userId: user.id },
    });

    revalidateAppPaths();
    return toActionState("SUCCESS", "All data cleared");
  } catch (error) {
    return fromErrorToActionState(error);
  }
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
