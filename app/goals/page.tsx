import { GoalsBoard, type GoalsBoardItem } from "@/features/goal/components/goals-board";
import { toNumber } from "@/utils/money";
import { getDemoGoals } from "@/features/goal/queries/goals";
import { getDemoUser } from "@/lib/demo-user";

export default async function GoalsPage() {
  const [user, goals] = await Promise.all([getDemoUser(), getDemoGoals()]);

  const items: GoalsBoardItem[] = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    description: goal.description,
    currentAmount: toNumber(goal.currentAmount),
    targetAmount: toNumber(goal.targetAmount),
    targetDate: goal.targetDate?.toISOString() ?? null,
    category: goal.category,
    priority: goal.priority,
  }));

  return <GoalsBoard currency={user.currency} goals={items} />;
}
