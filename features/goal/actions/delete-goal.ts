"use server";

import { redirect } from "next/navigation";

import { getOwnedGoal, revalidateGoalPaths } from "@/features/goal/actions/shared";
import { prisma } from "@/lib/db";
import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from "@/lib/form";
import { goalsPath } from "@/paths";

export async function deleteGoal(
  goalId: string,
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void prevState;
  void formData;

  try {
    const { goal } = await getOwnedGoal(goalId);
    if (!goal) {
      return toActionState("ERROR", "Goal not found.");
    }

    await prisma.goal.delete({ where: { id: goalId } });
    revalidateGoalPaths(goalId);
  } catch (error) {
    return fromErrorToActionState(error);
  }

  redirect(goalsPath());
}
