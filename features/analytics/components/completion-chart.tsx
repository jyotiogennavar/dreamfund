"use client";

import { Cell, Label, Pie, PieChart, ResponsiveContainer } from "recharts";

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

type CompletionChartProps = {
  overallPercent: number;
  segments: Segment[];
};

export function CompletionChart({
  overallPercent,
  segments,
}: CompletionChartProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Goal Completion</CardTitle>
        <CardDescription>
          Overall progress across all savings targets.
        </CardDescription>
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
                  <Pie
                    data={segments}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    strokeWidth={0}
                  >
                    {segments.map((segment) => (
                      <Cell key={segment.name} fill={segment.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (
                          !viewBox ||
                          !("cx" in viewBox) ||
                          !("cy" in viewBox)
                        ) {
                          return null;
                        }

                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground font-heading text-3xl font-semibold"
                            >
                              {overallPercent}%
                            </tspan>
                          </text>
                        );
                      }}
                    />
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
