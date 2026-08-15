"use client";

import { useActionState, useId, useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";

import { DatePicker } from "@/components/date-picker";
import { FieldError } from "@/components/field-error";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createGoal } from "@/features/goal/actions/add-goal";
import { updateGoal } from "@/features/goal/actions/update-goal";
import { GOAL_CATEGORIES, GOAL_PRIORITIES } from "@/features/goal/constants";
import { suggestedMonthlySavings } from "@/features/goal/goal-math";
import { createGoalSchema, updateGoalSchema } from "@/features/goal/schemas";
import { GoalCategory, GoalPriority } from "@/lib/generated/prisma/enums";
import {
  clearFieldError,
  dismissAllFieldErrors,
  EMPTY_ACTION_STATE,
  parseForm,
  shouldShowFormError,
  visibleFieldError,
} from "@/lib/form";
import { cn } from "@/lib/utils";
import { dateOnlyFromStored } from "@/utils/date-only";
import { formatMoney } from "@/utils/money";

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
  const formId = useId();
  const [name, setName] = useState(goal?.name ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [priority, setPriority] = useState<GoalPriority>(
    goal?.priority ?? GoalPriority.MEDIUM,
  );
  const [category, setCategory] = useState<GoalCategory>(
    goal?.category ?? GoalCategory.OTHER,
  );
  const [deadline, setDeadline] = useState<Date | undefined>(() => {
    if (!goal?.targetDate) {
      return undefined;
    }

    return dateOnlyFromStored(goal.targetDate) ?? undefined;
  });
  const [targetAmount, setTargetAmount] = useState(
    goal ? String(goal.targetAmount) : "",
  );
  const [startingAmount, setStartingAmount] = useState(
    goal ? String(goal.currentAmount) : "",
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, formAction] = useActionState(
    isEditing ? updateGoal : createGoal,
    EMPTY_ACTION_STATE,
  );

  const errorFor = (field: string) =>
    visibleFieldError(fieldErrors, state.fieldErrors, field);

  function dismissError(field: string) {
    setFieldErrors((current) => clearFieldError(current, field));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const schema = isEditing ? updateGoalSchema : createGoalSchema;
    const parsed = parseForm(schema, new FormData(event.currentTarget));
    if (!parsed.success) {
      event.preventDefault();
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    setFieldErrors((current) =>
      dismissAllFieldErrors(current, state.fieldErrors),
    );
  }

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
    <Form
      action={formAction}
      actionState={state}
      onSubmit={handleSubmit}
      onSuccess={onSuccess}
      className="grid gap-4"
    >
      {goal ? <input type="hidden" name="goalId" value={goal.id} /> : null}

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-name`}>Goal Name</Label>
        <Input
          id={`${formId}-name`}
          name="name"
          placeholder="e.g. Japan Trip"
          value={name}
          aria-invalid={Boolean(errorFor("name"))}
          aria-describedby={
            errorFor("name") ? `${formId}-name-error` : undefined
          }
          onChange={(event) => {
            setName(event.target.value);
            dismissError("name");
          }}
        />
        <FieldError id={`${formId}-name-error`} message={errorFor("name")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${formId}-description`}>Description</Label>
        <Textarea
          id={`${formId}-description`}
          name="description"
          placeholder="What are you saving for?"
          rows={2}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className={cn("grid gap-4", !isEditing && "sm:grid-cols-2")}>
        <div className="grid gap-2">
          <Label htmlFor={`${formId}-targetAmount`}>Target Amount</Label>
          <Input
            id={`${formId}-targetAmount`}
            name="targetAmount"
            type="number"
            min="1"
            step="1"
            inputMode="decimal"
            value={targetAmount}
            aria-invalid={Boolean(errorFor("targetAmount"))}
            aria-describedby={
              errorFor("targetAmount")
                ? `${formId}-targetAmount-error`
                : undefined
            }
            onChange={(event) => {
              setTargetAmount(event.target.value);
              dismissError("targetAmount");
            }}
          />
          <FieldError
            id={`${formId}-targetAmount-error`}
            message={errorFor("targetAmount")}
          />
        </div>
        {!isEditing ? (
          <div className="grid gap-2">
            <Label htmlFor={`${formId}-startingAmount`}>Starting Amount</Label>
            <Input
              id={`${formId}-startingAmount`}
              name="startingAmount"
              type="number"
              min="0"
              step="1"
              inputMode="decimal"
              value={startingAmount}
              aria-invalid={Boolean(errorFor("startingAmount"))}
              aria-describedby={
                errorFor("startingAmount")
                  ? `${formId}-startingAmount-error`
                  : undefined
              }
              onChange={(event) => {
                setStartingAmount(event.target.value);
                dismissError("startingAmount");
              }}
            />
            <FieldError
              id={`${formId}-startingAmount-error`}
              message={errorFor("startingAmount")}
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`${formId}-priority`}>Priority</Label>
          <input type="hidden" name="priority" value={priority} />
          <Select
            value={priority}
            onValueChange={(value) => {
              setPriority(value as GoalPriority);
              dismissError("priority");
            }}
          >
            <SelectTrigger
              id={`${formId}-priority`}
              className="w-full"
              aria-invalid={Boolean(errorFor("priority"))}
              aria-describedby={
                errorFor("priority") ? `${formId}-priority-error` : undefined
              }
            >
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger>
              {GOAL_PRIORITIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError
            id={`${formId}-priority-error`}
            message={errorFor("priority")}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`${formId}-deadline`}>Deadline</Label>
          <DatePicker
            id={`${formId}-deadline`}
            name="deadline"
            value={deadline}
            aria-invalid={Boolean(errorFor("deadline"))}
            aria-describedby={
              errorFor("deadline") ? `${formId}-deadline-error` : undefined
            }
            onChange={(value) => {
              setDeadline(value);
              dismissError("deadline");
            }}
          />
          <FieldError
            id={`${formId}-deadline-error`}
            message={errorFor("deadline")}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label id={`${formId}-category-label`}>Category</Label>
        <input type="hidden" name="category" value={category} />
        <div
          role="radiogroup"
          aria-labelledby={`${formId}-category-label`}
          aria-invalid={Boolean(errorFor("category"))}
          aria-describedby={
            errorFor("category") ? `${formId}-category-error` : undefined
          }
          className="flex flex-wrap gap-2"
        >
          {GOAL_CATEGORIES.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              role="radio"
              aria-checked={category === item.value}
              variant={category === item.value ? "default" : "outline"}
              onClick={() => {
                setCategory(item.value);
                dismissError("category");
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <FieldError
          id={`${formId}-category-error`}
          message={errorFor("category")}
        />
      </div>

      <p className="text-muted-foreground text-sm">
        {monthlyPreview == null
          ? "Add a target and deadline to calculate monthly savings."
          : `Suggested savings: ${formatMoney(monthlyPreview, currency)} / month to reach this goal on time.`}
      </p>

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
        <SubmitButton
          label={isEditing ? "Save Changes" : "Create Goal"}
          pendingLabel={isEditing ? "Saving…" : "Creating…"}
        />
      </DialogFooter>
    </Form>
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
