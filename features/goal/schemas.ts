import { z } from "zod";

import { GoalCategory, GoalPriority } from "@/lib/generated/prisma/enums";
import { parseDateOnly } from "@/utils/date-only";

function requiredText(message: string) {
  return z.string().trim().min(1, message);
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
  message: string,
) {
  if (/[eE]/.test(value) || !AMOUNT_PATTERN.test(value)) {
    ctx.addIssue({ code: "custom", message });
    return z.NEVER;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    ctx.addIssue({ code: "custom", message });
    return z.NEVER;
  }

  return amount;
}

function amountField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .transform((value, ctx) =>
      parseAmountValue(
        value,
        ctx,
        `${label} must be a valid non-negative number.`,
      ),
    );
}

const goalFieldsSchema = z.object({
  name: requiredText("Goal name is required."),
  description: optionalText(),
  targetAmount: amountField("Target amount").refine((value) => value > 0, {
    message: "Target amount must be greater than zero.",
  }),
  category: z.enum(GoalCategory, { error: "Select a valid category." }),
  priority: z.enum(GoalPriority, { error: "Select a valid priority." }),
  deadline: z
    .string()
    .trim()
    .optional()
    .transform((value, ctx) => {
      if (!value) {
        return null;
      }

      const date = parseDateOnly(value);
      if (!date) {
        ctx.addIssue({ code: "custom", message: "Deadline is invalid." });
        return z.NEVER;
      }

      return date;
    }),
});

export const createGoalSchema = goalFieldsSchema
  .extend({
    startingAmount: z
      .string()
      .trim()
      .optional()
      .transform((value, ctx) => {
        if (value == null || value === "") {
          return 0;
        }

        return parseAmountValue(
          value,
          ctx,
          "Starting amount must be a valid non-negative number.",
        );
      }),
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
