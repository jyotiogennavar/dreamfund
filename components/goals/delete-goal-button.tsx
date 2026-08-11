"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import { deleteGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { goalsPath } from "@/path";

type DeleteGoalButtonProps = {
  goalId: string;
  goalName: string;
};

export function DeleteGoalButton({ goalId, goalName }: DeleteGoalButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      aria-label={`Delete ${goalName}`}
      disabled={pending}
      onClick={() => {
        const confirmed = window.confirm(
          `Delete “${goalName}”? This cannot be undone.`,
        );
        if (!confirmed) {
          return;
        }

        startTransition(async () => {
          const result = await deleteGoal(goalId);
          if (result.error) {
            window.alert(result.error);
            return;
          }

          router.push(goalsPath());
          router.refresh();
        });
      }}
    >
      <Trash2Icon />
    </Button>
  );
}
