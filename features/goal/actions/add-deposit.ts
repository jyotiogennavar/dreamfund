"use server";

import { TransactionType } from "@/lib/generated/prisma/client";
import { getOwnedGoal, revalidateGoalPaths } from "@/features/goal/actions/shared";
import type { GoalActionState } from "@/features/goal/actions/types";
import { createDepositSchema } from "@/features/goal/schemas";
import { parseForm } from "@/lib/form";
import { prisma } from "@/lib/db";

export async function createDeposit(
  _prevState: GoalActionState,
  formData: FormData,
): Promise<GoalActionState> {
  const parsed = parseForm(createDepositSchema, formData);
  if (!parsed.success) {
    return { error: parsed.error, fieldErrors: parsed.fieldErrors };
  }

  const { goalId, amount, note, date } = parsed.data;
  const { goal } = await getOwnedGoal(goalId);
  if (!goal) {
    return { error: "Goal not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        amount,
        type: TransactionType.DEPOSIT,
        note: note || null,
        createdAt: date,
        goalId,
      },
    });

    await tx.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: {
          increment: amount,
        },
      },
    });
  });

  revalidateGoalPaths(goalId);
  return { success: true };
}
