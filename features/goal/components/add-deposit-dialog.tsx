"use client";

import { useActionState, useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, PlusIcon } from "lucide-react";

import { createDeposit } from "@/features/goal/actions/add-deposit";
import type { GoalActionState } from "@/features/goal/actions/types";
import { createDepositSchema } from "@/features/goal/schemas";
import { FieldError } from "@/components/field-error";
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
import {
  dismissAllFieldErrors,
  parseForm,
  shouldShowFormError,
  visibleFieldError,
} from "@/lib/form";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, formAction, pending] = useActionState(
    createDeposit,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
    }
  }, [state.success, onSuccess]);

  const errorFor = (field: string) =>
    visibleFieldError(fieldErrors, state.fieldErrors, field);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const parsed = parseForm(createDepositSchema, new FormData(event.currentTarget));
    if (!parsed.success) {
      event.preventDefault();
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    setFieldErrors((current) =>
      dismissAllFieldErrors(current, state.fieldErrors),
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-4"
    >
      <div className="grid gap-2">
        <Label>Goal</Label>
        <input type="hidden" name="goalId" value={goalId} />
        <Select value={goalId} onValueChange={setGoalId}>
          <SelectTrigger
            className="w-full"
            aria-invalid={Boolean(errorFor("goalId"))}
          >
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
        <FieldError id="goalId-error" message={errorFor("goalId")} />
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
          aria-invalid={Boolean(errorFor("amount"))}
          aria-describedby={errorFor("amount") ? "amount-error" : undefined}
        />
        <FieldError id="amount-error" message={errorFor("amount")} />
      </div>

      <div className="grid gap-2">
        <Label>Date</Label>
        <input type="hidden" name="date" value={format(date, "yyyy-MM-dd")} />
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              aria-invalid={Boolean(errorFor("date"))}
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
        <FieldError id="date-error" message={errorFor("date")} />
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

      {shouldShowFormError(state.error, fieldErrors, state.fieldErrors) ? (
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
