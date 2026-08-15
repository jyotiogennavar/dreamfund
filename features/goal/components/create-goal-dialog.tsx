"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";

import { createGoal } from "@/features/goal/actions/add-goal";
import { updateGoal } from "@/features/goal/actions/update-goal";
import type { GoalActionState } from "@/features/goal/actions/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { suggestedMonthlySavings } from "@/features/goal/goal-math";
import { GOAL_CATEGORIES, GOAL_PRIORITIES } from "@/features/goal/constants";
import { formatMoney } from "@/utils/money";
import { cn } from "@/lib/utils";
import { GoalCategory, GoalPriority } from "@/lib/generated/prisma/enums";

const initialState: GoalActionState = {};

export type EditableGoal = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  category: GoalCategory;
  priority: GoalPriority;
};

type CreateGoalDialogProps = {
  currency: string;
  trigger?: React.ReactNode;
  goal?: EditableGoal;
};

type CreateGoalFormProps = {
  currency: string;
  goal?: EditableGoal;
  onSuccess: () => void;
};

function CreateGoalForm({ currency, goal, onSuccess }: CreateGoalFormProps) {
  const isEditing = Boolean(goal);
  const [name, setName] = useState(goal?.name ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [priority, setPriority] = useState<GoalPriority>(
    goal?.priority ?? GoalPriority.MEDIUM,
  );
  const [category, setCategory] = useState<GoalCategory>(
    goal?.category ?? GoalCategory.OTHER,
  );
  const [deadline, setDeadline] = useState<Date | undefined>(() =>
    goal?.targetDate ? new Date(goal.targetDate) : undefined,
  );
  const [targetAmount, setTargetAmount] = useState(
    goal ? String(goal.targetAmount) : "",
  );
  const [startingAmount, setStartingAmount] = useState(
    goal ? String(goal.currentAmount) : "",
  );
  const [state, formAction, pending] = useActionState(
    isEditing ? updateGoal : createGoal,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const monthlyPreview = useMemo(() => {
    const target = Number(targetAmount);
    const current = Number(startingAmount || 0);

    if (!Number.isFinite(target) || target <= 0 || !deadline) {
      return null;
    }

    return suggestedMonthlySavings(
      Number.isFinite(current) ? current : 0,
      target,
      deadline,
    );
  }, [targetAmount, startingAmount, deadline]);

  return (
    <form action={formAction} className="grid gap-4">
      {goal ? <input type="hidden" name="goalId" value={goal.id} /> : null}

      <div className="grid gap-2">
        <Label htmlFor="name">Goal Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="e.g. Japan Trip"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What are you saving for?"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className={cn("grid gap-4", !isEditing && "sm:grid-cols-2")}>
        <div className="grid gap-2">
          <Label htmlFor="targetAmount">Target Amount</Label>
          <Input
            id="targetAmount"
            name="targetAmount"
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            required
            value={targetAmount}
            onChange={(event) => setTargetAmount(event.target.value)}
          />
        </div>
        {!isEditing ? (
          <div className="grid gap-2">
            <Label htmlFor="startingAmount">Starting Amount</Label>
            <Input
              id="startingAmount"
              name="startingAmount"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={startingAmount}
              onChange={(event) => setStartingAmount(event.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label>Priority</Label>
          <input type="hidden" name="priority" value={priority} />
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as GoalPriority)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {GOAL_PRIORITIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Deadline</Label>
          <input
            type="hidden"
            name="deadline"
            value={deadline ? format(deadline, "yyyy-MM-dd") : ""}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "justify-start font-normal",
                  !deadline && "text-muted-foreground",
                )}
              >
                <CalendarIcon data-icon="inline-start" />
                {deadline ? format(deadline, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Category</Label>
        <input type="hidden" name="category" value={category} />
        <div className="flex flex-wrap gap-2">
          {GOAL_CATEGORIES.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={category === item.value ? "default" : "outline"}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        {monthlyPreview == null
          ? "Add a target and deadline to calculate monthly savings."
          : `Suggested savings: ${formatMoney(monthlyPreview, currency)} / month to reach this goal on time.`}
      </p>

      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save Changes"
              : "Create Goal"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function CreateGoalDialog({
  currency,
  trigger,
  goal,
}: CreateGoalDialogProps) {
  const isEditing = Boolean(goal);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <PlusIcon data-icon="inline-start" />
            Add Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto [--dialog-max-width:42rem]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Goal" : "Create Goal"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this savings goal."
              : "Set a target, deadline, and category for your next savings goal."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <CreateGoalForm
            currency={currency}
            goal={goal}
            onSuccess={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
