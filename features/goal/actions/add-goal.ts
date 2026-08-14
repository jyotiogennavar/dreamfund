"use server";

import { TransactionType } from "@/lib/generated/prisma/client";
import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import { parseAmount, parseGoalFields, revalidateGoalPaths } from "@/features/goal/actions/shared";
import type { GoalActionState } from "@/features/goal/actions/types";

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
