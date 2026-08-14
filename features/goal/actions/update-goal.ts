"use server";

import { getOwnedGoal, parseGoalFields, revalidateGoalPaths } from "@/features/goal/actions/shared";
import type { GoalActionState } from "@/features/goal/actions/types";
import { prisma } from "@/lib/db";

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
