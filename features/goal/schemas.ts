import { z } from "zod";

import { GoalCategory, GoalPriority } from "@/lib/generated/prisma/enums";
import {
  DEADLINE_MAX_YEARS,
  deadlineDateRange,
  formatDateOnly,
  isDateOnlyInRange,
  parseDateOnly,
} from "@/utils/date-only";
import { stripMoneyFormatting } from "@/utils/money";

export const MAX_GOAL_NAME_LENGTH = 100;
export const MAX_GOAL_DESCRIPTION_LENGTH = 500;

function requiredText(message: string, maxLength?: number, maxMessage?: string) {
  return z.preprocess(
    (value) => (value == null ? "" : value),
    maxLength == null || maxMessage == null
      ? z.string().trim().min(1, message)
      : z.string().trim().min(1, message).max(maxLength, maxMessage),
  );
}

function optionalText() {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => value ?? "");
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;

function parseAmountValue(
  value: string,
  ctx: z.RefinementCtx,
  label: string,
) {
  if (/[eE]/.test(value) || !AMOUNT_PATTERN.test(value)) {
    ctx.addIssue({
      code: "custom",
      message: `${label} must be a valid non-negative number.`,
    });
    return z.NEVER;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    ctx.addIssue({
      code: "custom",
      message: `${label} must be a valid non-negative number.`,
    });
    return z.NEVER;
  }

  return amount;
}

function amountField(label: string) {
  return z.preprocess(
    (value) => stripMoneyFormatting(value == null ? "" : String(value)),
    z
      .string()
      .trim()
      .min(1, `${label} is required.`)
      .transform((value, ctx) => parseAmountValue(value, ctx, label)),
  );
}

function deadlineField() {
  return requiredText("Deadline is required.").transform((value, ctx) => {
    const date = parseDateOnly(value);
    if (!date) {
      ctx.addIssue({ code: "custom", message: "Deadline is invalid." });
      return z.NEVER;
    }

    const { min, max } = deadlineDateRange();
    if (!isDateOnlyInRange(date, min, max)) {
      ctx.addIssue({
        code: "custom",
        message:
          formatDateOnly(date) < formatDateOnly(min)
            ? "Deadline must be today or a future date."
            : `Deadline cannot be more than ${DEADLINE_MAX_YEARS} years from today.`,
      });
      return z.NEVER;
    }

    return date;
  });
}

const goalFieldsSchema = z.object({
  name: requiredText(
    "Goal name is required.",
    MAX_GOAL_NAME_LENGTH,
    `Goal name must be ${MAX_GOAL_NAME_LENGTH} characters or fewer.`,
  ),
  description: requiredText(
    "Description is required.",
    MAX_GOAL_DESCRIPTION_LENGTH,
    `Description must be ${MAX_GOAL_DESCRIPTION_LENGTH} characters or fewer.`,
  ),
  targetAmount: amountField("Target amount").refine((value) => value > 0, {
    message: "Target amount must be greater than zero.",
  }),
  category: z.preprocess(
    (value) => value ?? "",
    z.enum(GoalCategory, { error: "Select a category." }),
  ),
  priority: z.preprocess(
    (value) => value ?? "",
    z.enum(GoalPriority, { error: "Select a priority." }),
  ),
  deadline: deadlineField(),
});

export const createGoalSchema = goalFieldsSchema
  .extend({
    startingAmount: amountField("Starting amount"),
  })
  .refine((data) => data.startingAmount <= data.targetAmount, {
    message: "Starting amount cannot exceed the target amount.",
    path: ["startingAmount"],
  });

export const updateGoalSchema = goalFieldsSchema.extend({
  goalId: requiredText("Goal is required."),
});

export const createDepositSchema = z.object({
  goalId: requiredText("Select a goal."),
  amount: amountField("Amount").refine((value) => value > 0, {
    message: "Amount must be greater than zero.",
  }),
  note: optionalText(),
  date: z
    .string()
    .trim()
    .optional()
    .transform((value, ctx) => {
      if (!value) {
        return new Date();
      }

      const createdAt = parseDateOnly(value);
      if (!createdAt) {
        ctx.addIssue({ code: "custom", message: "Date is invalid." });
        return z.NEVER;
      }

      return createdAt;
    }),
});
