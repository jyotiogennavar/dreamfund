"use client";

import { useRouter } from "next/navigation";
import { Trash2Icon } from "lucide-react";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { deleteGoal } from "@/features/goal/actions/delete-goal";
import { goalsPath } from "@/paths";

type DeleteGoalButtonProps = {
  goalId: string;
  goalName: string;
  trigger?: React.ReactNode;
};

export function DeleteGoalButton({
  goalId,
  goalName,
  trigger,
}: DeleteGoalButtonProps) {
  const router = useRouter();

  return (
    <ConfirmDialog
      title={`Delete “${goalName}”?`}
      description="This cannot be undone."
      action={deleteGoal.bind(null, goalId)}
      confirmLabel="Delete goal"
      pendingLabel="Deleting…"
      onSuccess={() => {
        router.push(goalsPath());
        router.refresh();
      }}
      trigger={
        trigger ?? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            aria-label={`Delete ${goalName}`}
          >
            <Trash2Icon />
          </Button>
        )
      }
    />
  );
}
