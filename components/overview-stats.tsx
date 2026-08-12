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
        <Card key={stat.key}>
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {stat.format(values[stat.key], currency)}
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
