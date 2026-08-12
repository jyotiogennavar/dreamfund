"use client";

import { CreateGoalDialog } from "@/features/goal/components/create-goal-dialog";

type AddGoalButtonProps = {
  currency: string;
};

export function AddGoalButton({ currency }: AddGoalButtonProps) {
  return <CreateGoalDialog currency={currency} />;
}
