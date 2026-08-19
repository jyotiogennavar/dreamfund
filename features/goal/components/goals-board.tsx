"use client";

import { useMemo, useState } from "react";

import { AddGoalButton } from "@/features/goal/components/add-goal-button";
import { GoalCard } from "@/features/goal/components/goal-card";
import { NewGoalCard } from "@/features/goal/components/new-goal-card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGoalStatus, goalProgressPercent } from "@/features/goal/goal-math";
import {
  GOAL_CATEGORIES,
  GOAL_STATUSES,
  categoryLabel,
} from "@/features/goal/constants";
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
  const [status, setStatus] = useState<string>("all");

  const filteredGoals = useMemo(() => {
    const query = search.trim().toLowerCase();

    const next = goals.filter((goal) => {
      const matchesCategory = category === "all" || goal.category === category;
      const matchesStatus =
        status === "all" ||
        getGoalStatus(goal.currentAmount, goal.targetAmount) === status;
      const matchesSearch =
        query.length === 0 ||
        goal.name.toLowerCase().includes(query) ||
        (goal.description?.toLowerCase().includes(query) ?? false) ||
        categoryLabel(goal.category).toLowerCase().includes(query);

      return matchesCategory && matchesStatus && matchesSearch;
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
  }, [goals, search, sort, category, status]);

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
          <SelectContent alignItemWithTrigger>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger>
            <SelectItem value="all">All categories</SelectItem>
            {GOAL_CATEGORIES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger>
            <SelectItem value="all">All statuses</SelectItem>
            {GOAL_STATUSES.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} currency={currency} />
        ))}
        <NewGoalCard currency={currency} />
      </div>
    </div>
  );
}
