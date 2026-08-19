import type { GoalStatus } from "@/features/goal/goal-math";
import {
  GoalCategory,
  GoalPriority,
} from "@/lib/generated/prisma/enums";

export const GOAL_CATEGORIES = [
  { value: GoalCategory.TRAVEL, label: "Travel" },
  { value: GoalCategory.EMERGENCY, label: "Emergency" },
  { value: GoalCategory.GADGET, label: "Gadget" },
  { value: GoalCategory.VEHICLE, label: "Vehicle" },
  { value: GoalCategory.EDUCATION, label: "Education" },
  { value: GoalCategory.HOME, label: "Home" },
  { value: GoalCategory.WEDDING, label: "Wedding" },
  { value: GoalCategory.INVESTMENT, label: "Investment" },
  { value: GoalCategory.OTHER, label: "Other" },
] as const;

export const GOAL_STATUSES: { value: GoalStatus; label: string }[] = [
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

export const GOAL_PRIORITIES = [
  { value: GoalPriority.HIGH, label: "High" },
  { value: GoalPriority.MEDIUM, label: "Medium" },
  { value: GoalPriority.LOW, label: "Low" },
] as const;

export function categoryLabel(category: GoalCategory): string {
  return (
    GOAL_CATEGORIES.find((item) => item.value === category)?.label ?? category
  );
}

export function priorityLabel(priority: GoalPriority): string {
  return (
    GOAL_PRIORITIES.find((item) => item.value === priority)?.label ?? priority
  );
}

export const PRIORITY_PILL_CLASS: Record<GoalPriority, string> = {
  HIGH: "bg-destructive/10 text-destructive",
  MEDIUM: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  LOW: "bg-sky-500/12 text-sky-800 dark:text-sky-300",
};
