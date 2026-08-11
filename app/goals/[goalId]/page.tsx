export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ goalId: string }>;
}) {
  const { goalId } = await params;

  return (
    <div className="text-muted-foreground text-sm">
      Goal detail ({goalId}) — coming in Day 4
    </div>
  );
}
