"use server";

import { getOwnedGoal, revalidateGoalPaths } from "@/features/goal/actions/shared";
import { updateGoalSchema } from "@/features/goal/schemas";
import { prisma } from "@/lib/db";
import {
  fromErrorToActionState,
  parseForm,
  toActionState,
  type ActionState,
} from "@/lib/form";

export async function updateGoal(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = parseForm(updateGoalSchema, formData);
    if (!parsed.success) {
      return toActionState("ERROR", parsed.error, parsed.fieldErrors);
    }

    const fields = parsed.data;
    const { goal } = await getOwnedGoal(fields.goalId);
    if (!goal) {
      return toActionState("ERROR", "Goal not found.");
    }

    if (Number(goal.currentAmount) > fields.targetAmount) {
      return toActionState(
        "ERROR",
        "Target amount cannot be less than the amount already saved.",
        {
          targetAmount:
            "Target amount cannot be less than the amount already saved.",
        },
      );
    }

    await prisma.goal.update({
      where: { id: fields.goalId },
      data: {
        name: fields.name,
        description: fields.description,
        targetAmount: fields.targetAmount,
        targetDate: fields.deadline,
        category: fields.category,
        priority: fields.priority,
      },
    });

    revalidateGoalPaths(fields.goalId);
    return toActionState("SUCCESS", "Goal updated");
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
