import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { goalProgressPercent } from "@/lib/goal-math";
import { formatMoney, toNumber } from "@/lib/money";
import { goalPath } from "@/path";

type GoalCardProps = {
  goal: {
    id: string;
    name: string;
    description: string | null;
    currentAmount: number | string | { toString(): string };
    targetAmount: number | string | { toString(): string };
  };
  currency: string;
};

export function GoalCard({ goal, currency }: GoalCardProps) {
  const progress = goalProgressPercent(goal.currentAmount, goal.targetAmount);
  const isComplete =
    toNumber(goal.currentAmount) >= toNumber(goal.targetAmount);

  return (
    <Link href={goalPath(goal.id)} className="block h-full min-w-64 flex-1">
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle>{goal.name}</CardTitle>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {isComplete ? "Completed" : "Active"}
            </span>
          </div>
          {goal.description ? (
            <CardDescription className="line-clamp-2">
              {goal.description}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-2">
            <p className="text-muted-foreground text-xs">
              {formatMoney(goal.currentAmount, currency)} /{" "}
              {formatMoney(goal.targetAmount, currency)}
            </p>
            <p className="font-heading text-sm font-medium tabular-nums">
              {progress}%
            </p>
          </div>

          <Progress value={progress} aria-label={`${goal.name} progress`} />
          <p className="text-muted-foreground text-xs">
            {formatMoney(
              Math.max(
                0,
                toNumber(goal.targetAmount) - toNumber(goal.currentAmount),
              ),
              currency,
            )}{" "}
            remaining
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
