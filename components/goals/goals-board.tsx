"use client";

import { useMemo, useState } from "react";

import { AddGoalButton } from "@/components/goals/add-goal-button";
import { GoalCard } from "@/components/goals/goal-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { goalProgressPercent } from "@/lib/goal-math";
import { GOAL_CATEGORIES, categoryLabel } from "@/lib/goal-options";
import type { GoalCategory, GoalPriority } from "@/lib/generated/prisma/enums";

export type GoalsBoardItem = {
  id: string;
  name: string;
  description: string | null;
  currentAmount: number;
  targetAmount: number;
  targetDate: string | null;
  category: GoalCategory;
  priority: GoalPriority;
};

type GoalsBoardProps = {
  currency: string;
  goals: GoalsBoardItem[];
  title?: string;
};

type SortKey = "deadline" | "progress" | "priority";

const priorityRank: Record<GoalPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function GoalsBoard({
  currency,
  goals,
  title = "All Goals",
}: GoalsBoardProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("priority");
  const [category, setCategory] = useState<string>("all");

  const filteredGoals = useMemo(() => {
    const query = search.trim().toLowerCase();

    const next = goals.filter((goal) => {
      const matchesCategory = category === "all" || goal.category === category;
      const matchesSearch =
        query.length === 0 ||
        goal.name.toLowerCase().includes(query) ||
        (goal.description?.toLowerCase().includes(query) ?? false) ||
        categoryLabel(goal.category).toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });

    next.sort((a, b) => {
      if (sort === "progress") {
        return (
          goalProgressPercent(b.currentAmount, b.targetAmount) -
          goalProgressPercent(a.currentAmount, a.targetAmount)
        );
      }

      if (sort === "deadline") {
        const aTime = a.targetDate ? new Date(a.targetDate).getTime() : Infinity;
        const bTime = b.targetDate ? new Date(b.targetDate).getTime() : Infinity;
        return aTime - bTime;
      }

      return priorityRank[a.priority] - priorityRank[b.priority];
    });

    return next;
  }, [goals, search, sort, category]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <AddGoalButton currency={currency} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search goals…"
          className="sm:max-w-xs"
        />
        <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort: Priority</SelectItem>
            <SelectItem value="deadline">Sort: Deadline</SelectItem>
            <SelectItem value="progress">Sort: Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {GOAL_CATEGORIES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredGoals.length === 0 ? (
        <div className="rounded-4xl border border-dashed px-6 py-12 text-center">
          <p className="font-heading text-lg font-medium">No matching goals</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Try a different search or create a new goal.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} currency={currency} />
          ))}
        </div>
      )}
    </div>
  );
}
