"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";

import { createGoal, type CreateGoalState } from "@/app/actions/goals";
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

const initialState: CreateGoalState = {};

type CreateGoalDialogProps = {
  currency: string;
  trigger?: React.ReactNode;
};

export function CreateGoalDialog({
  currency,
  trigger,
}: CreateGoalDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [priority, setPriority] = useState<GoalPriority>(GoalPriority.MEDIUM);
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.OTHER);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [targetAmount, setTargetAmount] = useState("");
  const [startingAmount, setStartingAmount] = useState("");
  const [state, formAction, pending] = useActionState(createGoal, initialState);

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setOpen(false);
    router.refresh();
  }, [state.success, router]);

  useEffect(() => {
    if (open) {
      return;
    }

    setFormKey((key) => key + 1);
    setPriority(GoalPriority.MEDIUM);
    setCategory(GoalCategory.OTHER);
    setDeadline(undefined);
    setTargetAmount("");
    setStartingAmount("");
  }, [open]);

  const monthlyPreview = useMemo(() => {
    const target = Number(targetAmount);
    const starting = Number(startingAmount || 0);

    if (!Number.isFinite(target) || target <= 0 || !deadline) {
      return null;
    }

    return suggestedMonthlySavings(
      Number.isFinite(starting) ? starting : 0,
      target,
      deadline,
    );
  }, [targetAmount, startingAmount, deadline]);

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
          <DialogTitle>Create Goal</DialogTitle>
          <DialogDescription>
            Set a target, deadline, and category for your next savings goal.
          </DialogDescription>
        </DialogHeader>

        <form key={formKey} action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Japan Trip"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What are you saving for?"
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
                    disabled={{ before: new Date() }}
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
              {pending ? "Creating…" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
