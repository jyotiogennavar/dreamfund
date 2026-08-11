import { format } from "date-fns";

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
import { categoryLabel } from "@/lib/goal-options";
import { formatMoney } from "@/lib/money";
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
        Recent Transactions
      </h2>
      {transactions.length === 0 ? (
        <div className="rounded-4xl border border-dashed px-6 py-12 text-center">
          <p className="font-heading text-lg font-medium">No transactions yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Deposits will show up here once you start saving.
          </p>
        </div>
      ) : (
        <Card>
          <CardHeader className="sr-only">
            <CardTitle>Recent Transactions</CardTitle>
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
