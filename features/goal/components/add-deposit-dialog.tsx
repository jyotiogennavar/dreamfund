"use client";

import { useActionState, useId, useState } from "react";
import { PlusIcon } from "lucide-react";

import { DatePicker } from "@/components/date-picker";
import { FieldError } from "@/components/field-error";
import { CurrencyInput } from "@/components/form/currency-input";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createDeposit } from "@/features/goal/actions/add-deposit";
import { celebrateGoalCompletion } from "@/features/goal/celebrate-goal";
import { createDepositSchema } from "@/features/goal/schemas";
import {
  clearFieldError,
  dismissAllFieldErrors,
  EMPTY_ACTION_STATE,
  parseForm,
  shouldShowFormError,
  visibleFieldError,
  type ActionState,
} from "@/lib/form";

type GoalOption = {
  id: string;
  name: string;
};

type AddDepositDialogProps = {
  goals: GoalOption[];
  defaultGoalId?: string;
  currency?: string;
  trigger?: React.ReactNode;
};

type AddDepositFormProps = {
  goals: GoalOption[];
  defaultGoalId?: string;
  currency?: string;
  onSuccess: (actionState: ActionState) => void;
};

function AddDepositForm({
  goals,
  defaultGoalId,
  currency = "INR",
  onSuccess,
}: AddDepositFormProps) {
  const formId = useId();
  const [goalId, setGoalId] = useState(defaultGoalId ?? goals[0]?.id ?? "");
  const [date, setDate] = useState<Date>(() => new Date());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, formAction] = useActionState(
    createDeposit,
    EMPTY_ACTION_STATE,
  );

  const errorFor = (field: string) =>
    visibleFieldError(fieldErrors, state.fieldErrors, field);

  function dismissError(field: string) {
    setFieldErrors((current) => clearFieldError(current, field));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const parsed = parseForm(
      createDepositSchema,
      new FormData(event.currentTarget),
    );
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
    <Form
      action={formAction}
      actionState={state}
      onSubmit={handleSubmit}
      onSuccess={onSuccess}
      className="grid gap-4"
    >
      <div className="grid gap-2">
        <Label htmlFor={`${formId}-goalId`}>Goal</Label>
        <input type="hidden" name="goalId" value={goalId} />
        <Select
          value={goalId}
          onValueChange={(value) => {
            setGoalId(value);
            dismissError("goalId");
          }}
        >
          <SelectTrigger
            id={`${formId}-goalId`}
            className="w-full"
            aria-invalid={Boolean(errorFor("goalId"))}
            aria-describedby={
              errorFor("goalId") ? `${formId}-goalId-error` : undefined
            }
          >
            <SelectValue placeholder="Select a goal" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger>
            {goals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>
                {goal.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError
          id={`${formId}-goalId-error`}
          message={errorFor("goalId")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-amount`}>Amount</Label>
        <CurrencyInput
          id={`${formId}-amount`}
          name="amount"
          currency={currency}
          aria-invalid={Boolean(errorFor("amount"))}
          aria-describedby={
            errorFor("amount") ? `${formId}-amount-error` : undefined
          }
          onValueChange={() => dismissError("amount")}
        />
        <FieldError
          id={`${formId}-amount-error`}
          message={errorFor("amount")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-date`}>Date</Label>
        <DatePicker
          id={`${formId}-date`}
          name="date"
          value={date}
          aria-invalid={Boolean(errorFor("date"))}
          aria-describedby={
            errorFor("date") ? `${formId}-date-error` : undefined
          }
          onChange={(value) => {
            if (value) {
              setDate(value);
            }
            dismissError("date");
          }}
        />
        <p className="text-muted-foreground text-xs">Defaults to today.</p>
        <FieldError id={`${formId}-date-error`} message={errorFor("date")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-note`}>Note</Label>
        <Textarea
          id={`${formId}-note`}
          name="note"
          placeholder="Optional note"
          rows={2}
        />
      </div>

      {shouldShowFormError(
        state.status === "ERROR" ? state.message : undefined,
        fieldErrors,
        state.fieldErrors,
      ) ? (
        <p className="text-destructive text-sm" role="alert">
          {state.message}
        </p>
      ) : null}

      <DialogFooter>
        <SubmitButton label="Save Deposit" pendingLabel="Saving…" />
      </DialogFooter>
    </Form>
  );
}

export function AddDepositDialog({
  goals,
  defaultGoalId,
  currency,
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
            currency={currency}
            onSuccess={(state) => {
              if (state.data?.goalCompleted) {
                void celebrateGoalCompletion();
              }
              setOpen(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
