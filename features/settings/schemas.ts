import { z } from "zod";

import { CURRENCY_OPTIONS } from "@/utils/currency";

const currencies = CURRENCY_OPTIONS.map((option) => option.value) as [
  (typeof CURRENCY_OPTIONS)[number]["value"],
  ...(typeof CURRENCY_OPTIONS)[number]["value"][],
];

const formSwitch = z
  .enum(["on", "off"])
  .optional()
  .transform((value) => value === "on");

export const updateSettingsSchema = z.object({
  name: z.string().trim().min(1, "Full name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Enter a valid email.")
    .transform((value) => value.toLowerCase()),
  currency: z.enum(currencies, { error: "Select a supported currency." }),
  notifyGoalAchieved: formSwitch,
  notifyMonthlySummary: formSwitch,
  notifyDepositReminder: formSwitch,
});
