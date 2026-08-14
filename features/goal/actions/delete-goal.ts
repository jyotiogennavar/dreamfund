"use server";

import { getOwnedGoal, revalidateGoalPaths } from "@/features/goal/actions/shared";
import type { GoalActionState } from "@/features/goal/actions/types";
import { prisma } from "@/lib/db";

export async function deleteGoal(goalId: string): Promise<GoalActionState> {
  const { goal } = await getOwnedGoal(goalId);
  if (!goal) {
    return { error: "Goal not found." };
  }

  await prisma.goal.delete({ where: { id: goalId } });
  revalidateGoalPaths(goalId);
  return { success: true };
}
