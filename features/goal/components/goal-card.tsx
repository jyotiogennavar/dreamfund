import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatGoalRemaining,
  getGoalStatus,
  goalProgressPercent,
} from "@/features/goal/goal-math";
import { formatMoney } from "@/utils/money";
import { goalPath } from "@/paths";

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
  const status = getGoalStatus(goal.currentAmount, goal.targetAmount);

  return (
    <Link
      href={goalPath(goal.id)}
      className="block h-full w-full max-w-md rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
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
        <CardContent className="flex flex-col gap-3">
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
      </Card>
    </Link>
  );
}
