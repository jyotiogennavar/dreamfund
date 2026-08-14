"use server";

import { TransactionType } from "@/lib/generated/prisma/client";
import { getOwnedGoal, parseAmount, revalidateGoalPaths } from "@/features/goal/actions/shared";
import type { GoalActionState } from "@/features/goal/actions/types";
import { prisma } from "@/lib/db";

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
