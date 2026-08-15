"use client";

import { PlusIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { CreateGoalDialog } from "@/features/goal/components/create-goal-dialog";

type NewGoalCardProps = {
  currency: string;
};

export function NewGoalCard({ currency }: NewGoalCardProps) {
  return (
    <CreateGoalDialog
      currency={currency}
      trigger={
        <button type="button" className="h-full w-full max-w-md text-left">
          <Card className="flex h-full min-h-56 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <PlusIcon className="size-6" aria-hidden />
              </span>
              <span className="font-heading text-sm font-semibold uppercase tracking-wide text-primary">
                New Goal
              </span>
            </div>
          </Card>
        </button>
      }
    />
  );
}
