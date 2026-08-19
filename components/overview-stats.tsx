"use client";

import type { PointerEvent } from "react";
import { useState } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/utils/money";

type OverviewStatsProps = {
  currency: string;
  totalSaved: number;
  totalGoals: number;
  amountNeeded: number;
  avgMonthlySavings: number;
};

const stats = [
  {
    key: "totalSaved",
    label: "Total Saved",
    format: (value: number, currency: string) => formatMoney(value, currency),
  },
  {
    key: "totalGoals",
    label: "Total Goals",
    format: (value: number) => String(value),
  },
  {
    key: "amountNeeded",
    label: "Amount Needed",
    format: (value: number, currency: string) => formatMoney(value, currency),
  },
  {
    key: "avgMonthlySavings",
    label: "Avg. Monthly Savings",
    format: (value: number, currency: string) => formatMoney(value, currency),
  },
] as const;

const easeOutExpo = [0.19, 1, 0.22, 1] as const;
const spotlightFade = { duration: 0.18, ease: easeOutExpo } as const;
const spotlightFadeOut = { duration: 0.15, ease: easeOutExpo } as const;
const followTransition = { duration: 0.18, ease: easeOutExpo } as const;

function pointerOffset(event: PointerEvent<HTMLDivElement>) {
  const { left, top } = event.currentTarget.getBoundingClientRect();
  return { x: event.clientX - left, y: event.clientY - top };
}

function OverviewStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [spotlight, setSpotlight] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const maskImage = useMotionTemplate`radial-gradient(180px circle at ${mouseX}px ${mouseY}px, white 0%, transparent 80%)`;

  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || shouldReduceMotion) {
      return;
    }
    const { x, y } = pointerOffset(event);
    mouseX.jump(x);
    mouseY.jump(y);
    setSpotlight(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || shouldReduceMotion) {
      return;
    }
    const { x, y } = pointerOffset(event);
    animate(mouseX, x, followTransition);
    animate(mouseY, y, followTransition);
  }

  return (
    <Card
      className="relative"
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setSpotlight(false)}
    >
      {shouldReduceMotion ? null : (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_bottom_right,var(--chart-1),var(--chart-2),var(--chart-3),var(--chart-4),var(--chart-5))] blur-2xl"
          style={{ maskImage, WebkitMaskImage: maskImage }}
          initial={false}
          animate={{ opacity: spotlight ? 0.4 : 0 }}
          transition={spotlight ? spotlightFade : spotlightFadeOut}
        />
      )}
      <CardHeader className="relative z-10">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function OverviewStats({
  currency,
  totalSaved,
  totalGoals,
  amountNeeded,
  avgMonthlySavings,
}: OverviewStatsProps) {
  const values = {
    totalSaved,
    totalGoals,
    amountNeeded,
    avgMonthlySavings,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <OverviewStatCard
          key={stat.key}
          label={stat.label}
          value={stat.format(values[stat.key], currency)}
        />
      ))}
    </div>
  );
}
