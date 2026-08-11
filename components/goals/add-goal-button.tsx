"use client";

import { CreateGoalDialog } from "@/components/goals/create-goal-dialog";

type AddGoalButtonProps = {
  currency: string;
};

export function AddGoalButton({ currency }: AddGoalButtonProps) {
  return <CreateGoalDialog currency={currency} />;
}
