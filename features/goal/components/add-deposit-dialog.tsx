"use client";

import { useActionState, useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";

import { createDeposit } from "@/features/goal/actions/add-deposit";
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

type AddDepositFormProps = {
  goals: GoalOption[];
  defaultGoalId?: string;
  onSuccess: () => void;
};

function AddDepositForm({
  goals,
  defaultGoalId,
  onSuccess,
}: AddDepositFormProps) {
  const [goalId, setGoalId] = useState(defaultGoalId ?? goals[0]?.id ?? "");
  const [date, setDate] = useState<Date>(() => new Date());
  const [state, formAction, pending] = useActionState(
    createDeposit,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="grid gap-4">
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
        <input type="hidden" name="date" value={format(date, "yyyy-MM-dd")} />
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
  );
}

export function AddDepositDialog({
  goals,
  defaultGoalId,
  trigger,
}: AddDepositDialogProps) {
  const [open, setOpen] = useState(false);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Deposit</DialogTitle>
          <DialogDescription>
            Log a contribution toward one of your goals.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <AddDepositForm
            goals={goals}
            defaultGoalId={defaultGoalId}
            onSuccess={() => setOpen(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
