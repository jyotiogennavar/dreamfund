"use server";

import { revalidatePath } from "next/cache";

import {
  GoalCategory,
  GoalPriority,
  TransactionType,
} from "@/lib/generated/prisma/client";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import { goalsPath, homePath } from "@/path";

export type CreateGoalState = {
  error?: string;
  success?: boolean;
};

function parseAmount(value: FormDataEntryValue | null, label: string) {
  if (value == null || value === "") {
    return { error: `${label} is required.` } as const;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: `${label} must be a valid non-negative number.` } as const;
  }

  return { amount } as const;
}

export async function createGoal(
  _prevState: CreateGoalState,
  formData: FormData,
): Promise<CreateGoalState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = String(formData.get("priority") ?? GoalPriority.MEDIUM);
  const category = String(formData.get("category") ?? "");
  const deadlineValue = String(formData.get("deadline") ?? "").trim();

  if (!name) {
    return { error: "Goal name is required." };
  }

  const target = parseAmount(formData.get("targetAmount"), "Target amount");
  if ("error" in target) {
    return { error: target.error };
  }

  if (target.amount <= 0) {
    return { error: "Target amount must be greater than zero." };
  }

  const startingRaw = formData.get("startingAmount");
  let startingAmount = 0;
  if (startingRaw != null && startingRaw !== "") {
    const starting = parseAmount(startingRaw, "Starting amount");
    if ("error" in starting) {
      return { error: starting.error };
    }
    startingAmount = starting.amount;
  }

  if (startingAmount > target.amount) {
    return { error: "Starting amount cannot exceed the target amount." };
  }

  if (!Object.values(GoalCategory).includes(category as GoalCategory)) {
    return { error: "Select a valid category." };
  }

  if (!Object.values(GoalPriority).includes(priority as GoalPriority)) {
    return { error: "Select a valid priority." };
  }

  let targetDate: Date | null = null;
  if (deadlineValue) {
    targetDate = new Date(deadlineValue);
    if (Number.isNaN(targetDate.getTime())) {
      return { error: "Deadline is invalid." };
    }
  }

  const user = await getDemoUser();

  await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.create({
      data: {
        name,
        description: description || null,
        targetAmount: target.amount,
        currentAmount: startingAmount,
        targetDate,
        category: category as GoalCategory,
        priority: priority as GoalPriority,
        userId: user.id,
      },
    });

    if (startingAmount > 0) {
      await tx.transaction.create({
        data: {
          amount: startingAmount,
          type: TransactionType.DEPOSIT,
          note: "Starting amount",
          goalId: goal.id,
        },
      });
    }
  });

  revalidatePath(homePath());
  revalidatePath(goalsPath());

  return { success: true };
}
