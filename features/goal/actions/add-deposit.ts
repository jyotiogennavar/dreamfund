"use server";

import { getOwnedGoal, revalidateGoalPaths } from "@/features/goal/actions/shared";
import { createDepositSchema } from "@/features/goal/schemas";
import { prisma } from "@/lib/db";
import {
  fromErrorToActionState,
  parseForm,
  toActionState,
  type ActionState,
} from "@/lib/form";
import { TransactionType } from "@/lib/generated/prisma/client";

export async function createDeposit(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = parseForm(createDepositSchema, formData);
    if (!parsed.success) {
      return toActionState("ERROR", parsed.error, parsed.fieldErrors);
    }

    const { goalId, amount, note, date } = parsed.data;
    const { goal } = await getOwnedGoal(goalId);
    if (!goal) {
      return toActionState("ERROR", "Goal not found.");
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
    return toActionState("SUCCESS", "Deposit saved");
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
