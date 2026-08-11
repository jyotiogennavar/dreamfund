"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";

import {
  createGoal,
  updateGoal,
  type GoalActionState,
} from "@/app/actions/goals";
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
import { suggestedMonthlySavings } from "@/lib/goal-math";
import { GOAL_CATEGORIES, GOAL_PRIORITIES } from "@/lib/goal-options";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  GoalCategory,
  GoalPriority,
} from "@/lib/generated/prisma/enums";

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

export function CreateGoalDialog({
  currency,
  trigger,
  goal,
}: CreateGoalDialogProps) {
  const isEditing = Boolean(goal);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<GoalPriority>(GoalPriority.MEDIUM);
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.OTHER);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [targetAmount, setTargetAmount] = useState("");
  const [startingAmount, setStartingAmount] = useState("");
  const [state, formAction, pending] = useActionState(
    isEditing ? updateGoal : createGoal,
    initialState,
  );

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setOpen(false);
    router.refresh();
  }, [state.success, router]);

  useEffect(() => {
    if (!open) {
      setFormKey((key) => key + 1);
      return;
    }

    if (goal) {
      setName(goal.name);
      setDescription(goal.description ?? "");
      setPriority(goal.priority);
      setCategory(goal.category);
      setDeadline(goal.targetDate ? new Date(goal.targetDate) : undefined);
      setTargetAmount(String(goal.targetAmount));
      setStartingAmount(String(goal.currentAmount));
      return;
    }

    setName("");
    setDescription("");
    setPriority(GoalPriority.MEDIUM);
    setCategory(GoalCategory.OTHER);
    setDeadline(undefined);
    setTargetAmount("");
    setStartingAmount("");
  }, [open, goal]);

  const monthlyPreview = useMemo(() => {
    const target = Number(targetAmount);
    const current = Number(
      isEditing ? startingAmount || 0 : startingAmount || 0,
    );

    if (!Number.isFinite(target) || target <= 0 || !deadline) {
      return null;
    }

    return suggestedMonthlySavings(
      Number.isFinite(current) ? current : 0,
      target,
      deadline,
    );
  }, [targetAmount, startingAmount, deadline, isEditing]);

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Goal" : "Create Goal"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this savings goal."
              : "Set a target, deadline, and category for your next savings goal."}
          </DialogDescription>
        </DialogHeader>

        <form key={formKey} action={formAction} className="grid gap-4">
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
      </DialogContent>
    </Dialog>
  );
}
