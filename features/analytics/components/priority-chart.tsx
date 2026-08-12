"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Segment = {
  name: string;
  value: number;
  fill: string;
};

type PriorityChartProps = {
  segments: Segment[];
};

export function PriorityChart({ segments }: PriorityChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Goal by Priority</CardTitle>
        <CardDescription>How your goals are prioritized.</CardDescription>
      </CardHeader>
      <CardContent>
        {segments.length === 0 ? (
          <p className="text-muted-foreground py-16 text-center text-sm">
            No goals to chart yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="mx-auto h-56 w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => [`${value}`, "Goals"]}
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "1px solid var(--border)",
                      background: "var(--popover)",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Pie
                    data={segments}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    strokeWidth={0}
                  >
                    {segments.map((segment) => (
                      <Cell key={segment.name} fill={segment.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {segments.map((segment) => (
                <li key={segment.name} className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: segment.fill }}
                  />
                  <span className="text-muted-foreground">{segment.name}</span>
                  <span className="ml-auto tabular-nums">{segment.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
