import { notFound } from "next/navigation";

import {
  GoalDetail,
  serializeGoalDetail,
} from "@/features/goal/components/goal-detail";
import { getGoalDetail, getGoalOptions } from "@/features/goal/queries/goals";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;
  const [detail, goalOptions] = await Promise.all([
    getGoalDetail(goalId),
    getGoalOptions(),
  ]);

  if (!detail) {
    notFound();
  }

  const serialized = serializeGoalDetail(detail.goal);

  return (
    <GoalDetail
      currency={detail.currency}
      goal={serialized.goal}
      contributions={serialized.contributions}
      goalOptions={goalOptions}
    />
  );
}
