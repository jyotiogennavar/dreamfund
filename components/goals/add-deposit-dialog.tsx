"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";

import { createDeposit, type GoalActionState } from "@/app/actions/goals";
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
import { cn } from "@/lib/utils";

const initialState: GoalActionState = {};

type GoalOption = {
  id: string;
  name: string;
};

type AddDepositDialogProps = {
  goals: GoalOption[];
  defaultGoalId?: string;
  trigger?: React.ReactNode;
};

export function AddDepositDialog({
  goals,
  defaultGoalId,
  trigger,
}: AddDepositDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [goalId, setGoalId] = useState(defaultGoalId ?? goals[0]?.id ?? "");
  const [date, setDate] = useState<Date>(new Date());
  const [state, formAction, pending] = useActionState(
    createDeposit,
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

    setGoalId(defaultGoalId ?? goals[0]?.id ?? "");
    setDate(new Date());
  }, [open, defaultGoalId, goals]);

  if (goals.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <PlusIcon data-icon="inline-start" />
            Add Deposit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Deposit</DialogTitle>
          <DialogDescription>
            Log a contribution toward one of your goals.
          </DialogDescription>
        </DialogHeader>

        <form key={formKey} action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Goal</Label>
            <input type="hidden" name="goalId" value={goalId} />
            <Select value={goalId} onValueChange={setGoalId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="1"
              inputMode="decimal"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Date</Label>
            <input
              type="hidden"
              name="date"
              value={format(date, "yyyy-MM-dd")}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn("justify-start font-normal")}
                >
                  <CalendarIcon data-icon="inline-start" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(value) => value && setDate(value)}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
            <p className="text-muted-foreground text-xs">Defaults to today.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Optional note"
              rows={2}
            />
          </div>

          {state.error ? (
            <p className="text-destructive text-sm" role="alert">
              {state.error}
            </p>
          ) : null}

          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Saving…" : "Save Deposit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
