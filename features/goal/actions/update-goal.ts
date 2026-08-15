"use server";

import { getOwnedGoal, revalidateGoalPaths } from "@/features/goal/actions/shared";
import type { GoalActionState } from "@/features/goal/actions/types";
import { updateGoalSchema } from "@/features/goal/schemas";
import { parseForm } from "@/lib/form";
import { prisma } from "@/lib/db";

export async function updateGoal(
  _prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const parsed = parseForm(updateGoalSchema, formData);
  if (!parsed.success) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const fields = parsed.data;
  const { goal } = await getOwnedGoal(fields.goalId);
  if (!goal) {
    return { error: "Goal not found." };
  }

  if (Number(goal.currentAmount) > fields.targetAmount) {
    return {
      error: "Target amount cannot be less than the amount already saved.",
      fieldErrors: {
        targetAmount:
          "Target amount cannot be less than the amount already saved.",
      },
    };
  }

  await prisma.goal.update({
    where: { id: fields.goalId },
    data: {
      name: fields.name,
      description: fields.description || null,
      targetAmount: fields.targetAmount,
      targetDate: fields.deadline,
      category: fields.category,
      priority: fields.priority,
    },
  });

  revalidateGoalPaths(fields.goalId);
  return { success: true };
}
