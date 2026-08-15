import { format } from "date-fns";

import { Placeholder } from "@/components/placeholder";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { categoryLabel } from "@/features/goal/constants";
import { formatMoney } from "@/utils/money";
import type { GoalCategory } from "@/lib/generated/prisma/enums";

type TransactionRow = {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
  goalName: string;
  category: GoalCategory;
};

type RecentTransactionsProps = {
  currency: string;
  transactions: TransactionRow[];
};

export function RecentTransactions({
  currency,
  transactions,
}: RecentTransactionsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-2xl font-semibold tracking-tight">
        Recent deposits
      </h2>
      {transactions.length === 0 ? (
        <Placeholder
          label="No deposits yet"
          description="Deposits will show up here once you start saving."
        />
      ) : (
        <Card>
          <CardHeader className="sr-only">
            <CardTitle>Recent deposits</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.createdAt), "PP")}
                    </TableCell>
                    <TableCell>{transaction.note || "Deposit"}</TableCell>
                    <TableCell>{transaction.goalName}</TableCell>
                    <TableCell>
                      {categoryLabel(transaction.category)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(transaction.amount, currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
