import { format } from "date-fns";
import { PencilIcon } from "lucide-react";

import { Placeholder } from "@/components/placeholder";
import { AddDepositDialog } from "@/features/goal/components/add-deposit-dialog";
import {
  CreateGoalDialog,
  type EditableGoal,
} from "@/features/goal/components/create-goal-dialog";
import { DeleteGoalButton } from "@/features/goal/components/delete-goal-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  amountNeeded,
  goalProgressPercent,
  suggestedMonthlySavings,
} from "@/features/goal/goal-math";
import { categoryLabel, priorityLabel } from "@/features/goal/constants";
import { dateOnlyFromStored } from "@/utils/date-only";
import { formatMoney, toNumber } from "@/utils/money";
import type {
  GoalCategory,
  GoalPriority,
} from "@/lib/generated/prisma/enums";

type Contribution = {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
};

type GoalDetailProps = {
  currency: string;
  goal: {
    id: string;
    name: string;
    description: string | null;
    currentAmount: number;
    targetAmount: number;
    targetDate: string | null;
    category: GoalCategory;
    priority: GoalPriority;
  };
  contributions: Contribution[];
  goalOptions: { id: string; name: string }[];
};

export function GoalDetail({
  currency,
  goal,
  contributions,
  goalOptions,
}: GoalDetailProps) {
  const progress = goalProgressPercent(goal.currentAmount, goal.targetAmount);
  const remaining = amountNeeded(goal.currentAmount, goal.targetAmount);
  const targetDate = goal.targetDate
    ? dateOnlyFromStored(goal.targetDate)
    : null;
  const monthly = suggestedMonthlySavings(
    goal.currentAmount,
    goal.targetAmount,
    targetDate,
  );

  const editableGoal: EditableGoal = goal;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {goal.name}
            </h2>
            {goal.description ? (
              <p className="text-muted-foreground max-w-2xl text-sm">
                {goal.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AddDepositDialog
              goals={goalOptions}
              defaultGoalId={goal.id}
            />
            <CreateGoalDialog
              currency={currency}
              goal={editableGoal}
              trigger={
                <Button variant="outline" size="icon" aria-label="Edit goal">
                  <PencilIcon />
                </Button>
              }
            />
            <DeleteGoalButton goalId={goal.id} goalName={goal.name} />
          </div>
        </div>

        <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <p>
            <span className="font-medium text-foreground">Deadline:</span>{" "}
            {targetDate ? format(targetDate, "PPP") : "No deadline"}
          </p>
          <p>
            <span className="font-medium text-foreground">Category:</span>{" "}
            {categoryLabel(goal.category)}
          </p>
          <p>
            <span className="font-medium text-foreground">Priority:</span>{" "}
            {priorityLabel(goal.priority)}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>{progress}% complete</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Progress value={progress} aria-label={`${goal.name} progress`} />
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-xs">Saved</p>
                <p className="font-heading text-lg font-medium tabular-nums">
                  {formatMoney(goal.currentAmount, currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Remaining</p>
                <p className="font-heading text-lg font-medium tabular-nums">
                  {formatMoney(remaining, currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Target</p>
                <p className="font-heading text-lg font-medium tabular-nums">
                  {formatMoney(goal.targetAmount, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Target</CardTitle>
            <CardDescription>
              Keep a steady pace to hit your deadline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthly == null ? (
              <p className="text-muted-foreground text-sm">
                Set a future deadline to see a suggested monthly amount.
              </p>
            ) : (
              <p className="text-sm">
                Suggested savings:{" "}
                <span className="font-heading font-medium">
                  {formatMoney(monthly, currency)} / month
                </span>
                . Keeping up with this will help you reach your goal on time.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="font-heading text-xl font-semibold tracking-tight">
          Recent Contributions
        </h3>
        {contributions.length === 0 ? (
          <Placeholder
            label="No deposits yet"
            description="Add a deposit to start tracking contributions."
            className="py-10"
          />
        ) : (
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributions.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.createdAt), "PP")}
                      </TableCell>
                      <TableCell>{item.note || "Deposit"}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(item.amount, currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

export function serializeGoalDetail(goal: {
  id: string;
  name: string;
  description: string | null;
  currentAmount: { toString(): string } | number;
  targetAmount: { toString(): string } | number;
  targetDate: Date | null;
  category: GoalCategory;
  priority: GoalPriority;
  transactions: {
    id: string;
    amount: { toString(): string } | number;
    note: string | null;
    createdAt: Date;
  }[];
}) {
  return {
    goal: {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      currentAmount: toNumber(goal.currentAmount),
      targetAmount: toNumber(goal.targetAmount),
      targetDate: goal.targetDate?.toISOString() ?? null,
      category: goal.category,
      priority: goal.priority,
    },
    contributions: goal.transactions.map((transaction) => ({
      id: transaction.id,
      amount: toNumber(transaction.amount),
      note: transaction.note,
      createdAt: transaction.createdAt.toISOString(),
    })),
  };
}
