"use server";

import { revalidatePath } from "next/cache";

import {
  GoalCategory,
  GoalPriority,
  TransactionType,
} from "@/lib/generated/prisma/client";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import { goalPath, goalsPath, homePath, analyticsPath } from "@/paths";

export type GoalActionState = {
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

function parseGoalFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priority = String(formData.get("priority") ?? GoalPriority.MEDIUM);
  const category = String(formData.get("category") ?? "");
  const deadlineValue = String(formData.get("deadline") ?? "").trim();

  if (!name) {
    return { error: "Goal name is required." } as const;
  }

  const target = parseAmount(formData.get("targetAmount"), "Target amount");
  if ("error" in target) {
    return { error: target.error } as const;
  }

  if (target.amount <= 0) {
    return { error: "Target amount must be greater than zero." } as const;
  }

  if (!Object.values(GoalCategory).includes(category as GoalCategory)) {
    return { error: "Select a valid category." } as const;
  }

  if (!Object.values(GoalPriority).includes(priority as GoalPriority)) {
    return { error: "Select a valid priority." } as const;
  }

  let targetDate: Date | null = null;
  if (deadlineValue) {
    targetDate = new Date(deadlineValue);
    if (Number.isNaN(targetDate.getTime())) {
      return { error: "Deadline is invalid." } as const;
    }
  }

  return {
    name,
    description,
    targetAmount: target.amount,
    category: category as GoalCategory,
    priority: priority as GoalPriority,
    targetDate,
  } as const;
}

function revalidateGoalPaths(goalId?: string) {
  revalidatePath(homePath());
  revalidatePath(goalsPath());
  revalidatePath(analyticsPath());
  if (goalId) {
    revalidatePath(goalPath(goalId));
  }
}

async function getOwnedGoal(goalId: string) {
  const user = await getDemoUser();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });

  return { user, goal };
}

export async function createGoal(
  _prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const fields = parseGoalFields(formData);
  if ("error" in fields) {
    return { error: fields.error };
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

  if (startingAmount > fields.targetAmount) {
    return { error: "Starting amount cannot exceed the target amount." };
  }

  const user = await getDemoUser();

  await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.create({
      data: {
        name: fields.name,
        description: fields.description || null,
        targetAmount: fields.targetAmount,
        currentAmount: startingAmount,
        targetDate: fields.targetDate,
        category: fields.category,
        priority: fields.priority,
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

  revalidateGoalPaths();
  return { success: true };
}

export async function updateGoal(
  _prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const goalId = String(formData.get("goalId") ?? "").trim();
  if (!goalId) {
    return { error: "Goal is required." };
  }

  const fields = parseGoalFields(formData);
  if ("error" in fields) {
    return { error: fields.error };
  }

  const { goal } = await getOwnedGoal(goalId);
  if (!goal) {
    return { error: "Goal not found." };
  }

  if (Number(goal.currentAmount) > fields.targetAmount) {
    return {
      error: "Target amount cannot be less than the amount already saved.",
    };
  }

  await prisma.goal.update({
    where: { id: goalId },
    data: {
      name: fields.name,
      description: fields.description || null,
      targetAmount: fields.targetAmount,
      targetDate: fields.targetDate,
      category: fields.category,
      priority: fields.priority,
    },
  });

  revalidateGoalPaths(goalId);
  return { success: true };
}

export async function deleteGoal(goalId: string): Promise<GoalActionState> {
  const { goal } = await getOwnedGoal(goalId);
  if (!goal) {
    return { error: "Goal not found." };
  }

  await prisma.goal.delete({ where: { id: goalId } });
  revalidateGoalPaths(goalId);
  return { success: true };
}

export async function createDeposit(
  _prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const goalId = String(formData.get("goalId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const dateValue = String(formData.get("date") ?? "").trim();

  if (!goalId) {
    return { error: "Select a goal." };
  }

  const amountResult = parseAmount(formData.get("amount"), "Amount");
  if ("error" in amountResult) {
    return { error: amountResult.error };
  }

  if (amountResult.amount <= 0) {
    return { error: "Amount must be greater than zero." };
  }

  let createdAt = new Date();
  if (dateValue) {
    createdAt = new Date(`${dateValue}T12:00:00`);
    if (Number.isNaN(createdAt.getTime())) {
      return { error: "Date is invalid." };
    }
  }

  const { goal } = await getOwnedGoal(goalId);
  if (!goal) {
    return { error: "Goal not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        amount: amountResult.amount,
        type: TransactionType.DEPOSIT,
        note: note || null,
        createdAt,
        goalId,
      },
    });

    await tx.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: {
          increment: amountResult.amount,
        },
      },
    });
  });

  revalidateGoalPaths(goalId);
  return { success: true };
}
