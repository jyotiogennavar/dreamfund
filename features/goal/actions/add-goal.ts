"use server";

import { TransactionType } from "@/lib/generated/prisma/client";
import { getDemoUser } from "@/lib/demo-user";
import { parseForm } from "@/lib/form";
import { prisma } from "@/lib/db";
import { revalidateGoalPaths } from "@/features/goal/actions/shared";
import type { GoalActionState } from "@/features/goal/actions/types";
import { createGoalSchema } from "@/features/goal/schemas";

export async function createGoal(
  _prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const parsed = parseForm(createGoalSchema, formData);
  if (!parsed.success) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
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
  return { success: true };
}
