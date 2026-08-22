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
        <button type="button" className="group h-full min-h-10 w-full max-w-md text-start">
          <Card className="flex h-full min-h-56 items-center justify-center transition-[background-color] duration-200 ease-out group-focus-visible:bg-muted [@media(hover:hover)]:group-hover:bg-muted">
            <div className="flex flex-col items-center gap-3">
              <span className="pointer-events-none flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <PlusIcon className="size-6" aria-hidden />
              </span>
              <span className="font-heading text-sm font-semibold tracking-wide text-primary">
                New goal
              </span>
            </div>
          </Card>
        </button>
      }
    />
  );
}
