"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AddDepositDialog } from "@/features/goal/components/add-deposit-dialog";
import { DeleteGoalButton } from "@/features/goal/components/delete-goal-button";
import {
  formatGoalRemaining,
  getGoalStatus,
  goalProgressPercent,
} from "@/features/goal/goal-math";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/utils/money";
import { goalPath } from "@/paths";

const footerSpring = { type: "spring", duration: 0.3, bounce: 0 } as const;
const footerFade = { duration: 0.2, ease: [0.19, 1, 0.22, 1] } as const;
const footerShown = "translateY(0%)";
const footerHidden = "translateY(100%)";
const hitboxClass = "relative after:absolute after:-inset-2.5 after:content-['']";

type GoalCardProps = {
  goal: {
    id: string;
    name: string;
    description: string | null;
    currentAmount: number;
    targetAmount: number;
  };
  currency: string;
};

export function GoalCard({ goal, currency }: GoalCardProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const progress = goalProgressPercent(goal.currentAmount, goal.targetAmount);
  const status = getGoalStatus(goal.currentAmount, goal.targetAmount);

  return (
    <Card
      className="relative h-full min-h-56 w-full max-w-md"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") {
          setActionsOpen(true);
        }
      }}
      onPointerLeave={() => setActionsOpen(false)}
      onFocusCapture={() => setActionsOpen(true)}
      onBlurCapture={(event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) {
          return;
        }
        setActionsOpen(false);
      }}
    >
      <Link
        href={goalPath(goal.id)}
        className="absolute inset-0 z-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="sr-only">{goal.name}</span>
      </Link>
      <CardHeader className="pointer-events-none">
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{goal.name}</CardTitle>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {status}
          </span>
        </div>
        {goal.description ? (
          <CardDescription className="line-clamp-2">
            {goal.description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pointer-events-none flex flex-col gap-3">
        <div className="flex items-end justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            {formatMoney(goal.currentAmount, currency)} /
            {formatMoney(goal.targetAmount, currency)}
          </p>
          <p className="font-heading text-sm font-medium tabular-nums">
            {progress}%
          </p>
        </div>

        <Progress value={progress} aria-label={`${goal.name} progress`} />
        <p className="text-muted-foreground text-xs">
          {formatGoalRemaining(
            goal.currentAmount,
            goal.targetAmount,
            currency,
          )}
        </p>
      </CardContent>
      <motion.div
        initial={false}
        animate={
          shouldReduceMotion
            ? { opacity: actionsOpen ? 1 : 0, transform: footerShown }
            : { transform: actionsOpen ? footerShown : footerHidden }
        }
        transition={shouldReduceMotion ? footerFade : footerSpring}
        aria-hidden={!actionsOpen}
        inert={!actionsOpen}
        className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-end bg-muted px-(--card-spacing) py-2"
      >
        <div className="flex items-center gap-1.5">
          <AddDepositDialog
            goals={[{ id: goal.id, name: goal.name }]}
            defaultGoalId={goal.id}
            trigger={
              <Button
                type="button"
                size="xs"
                variant="secondary"
                className={cn(
                  hitboxClass,
                  "hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <PlusIcon data-icon="inline-start" />
                Deposit
              </Button>
            }
          />
          <DeleteGoalButton
            goalId={goal.id}
            goalName={goal.name}
            trigger={
              <Button
                type="button"
                size="icon-xs"
                variant="destructive"
                aria-label={`Delete ${goal.name}`}
                className={hitboxClass}
              >
                <Trash2Icon />
              </Button>
            }
          />
        </div>
      </motion.div>
    </Card>
  );
}
