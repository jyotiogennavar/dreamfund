"use server";

import { revalidateGoalPaths } from "@/features/goal/actions/shared";
import { createGoalSchema } from "@/features/goal/schemas";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import {
  fromErrorToActionState,
  parseForm,
  toActionState,
  type ActionState,
} from "@/lib/form";
import { TransactionType } from "@/lib/generated/prisma/client";

export async function createGoal(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = parseForm(createGoalSchema, formData);
    if (!parsed.success) {
      return toActionState("ERROR", parsed.error, parsed.fieldErrors);
    }

    const fields = parsed.data;
    const user = await getDemoUser();

    await prisma.$transaction(async (tx) => {
      const goal = await tx.goal.create({
        data: {
          name: fields.name,
          description: fields.description || null,
          targetAmount: fields.targetAmount,
          currentAmount: fields.startingAmount,
          targetDate: fields.deadline,
          category: fields.category,
          priority: fields.priority,
          userId: user.id,
        },
      });

      if (fields.startingAmount > 0) {
        await tx.transaction.create({
          data: {
            amount: fields.startingAmount,
            type: TransactionType.DEPOSIT,
            note: "Starting amount",
            goalId: goal.id,
          },
        });
      }
    });

    revalidateGoalPaths();
    return toActionState("SUCCESS", "Goal created");
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
