"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateGoalDialog } from "@/features/goal/components/create-goal-dialog";

type AddGoalButtonProps = {
  currency: string;
};

export function AddGoalButton({ currency }: AddGoalButtonProps) {
  return (
    <CreateGoalDialog
      currency={currency}
      trigger={
        <Button className="px-5 has-data-[icon=inline-start]:ps-5">
          <PlusIcon data-icon="inline-start" />
          Add goal
        </Button>
      }
    />
  );
}
