import { revalidatePath } from "next/cache";

import {
  GoalCategory,
  GoalPriority,
} from "@/lib/generated/prisma/client";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import { analyticsPath, goalPath, goalsPath, homePath } from "@/paths";

export function parseAmount(value: FormDataEntryValue | null, label: string) {
  if (value == null || value === "") {
    return { error: `${label} is required.` } as const;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: `${label} must be a valid non-negative number.` } as const;
  }

  return { amount } as const;
}

export function parseGoalFields(formData: FormData) {
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

export function revalidateGoalPaths(goalId?: string) {
  revalidatePath(homePath());
  revalidatePath(goalsPath());
  revalidatePath(analyticsPath());
  if (goalId) {
    revalidatePath(goalPath(goalId));
  }
}

export async function getOwnedGoal(goalId: string) {
  const user = await getDemoUser();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });

  return { user, goal };
}
