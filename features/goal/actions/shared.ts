import { revalidatePath } from "next/cache";

import { getDemoUser } from "@/lib/demo-user";
import { prisma } from "@/lib/db";
import { analyticsPath, goalPath, goalsPath, homePath } from "@/paths";

export function revalidateGoalPaths(goalId?: string) {
  revalidatePath(homePath());
  revalidatePath(goalsPath());
  revalidatePath(analyticsPath());
  if (goalId) {
    revalidatePath(goalPath(goalId));
  }
}

export async function getOwnedGoal(goalId: string) {
  const user = await getDemoUser();
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId: user.id },
  });

  return { user, goal };
}
