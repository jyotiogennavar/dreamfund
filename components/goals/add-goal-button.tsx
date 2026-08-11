import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Placeholder until Day 3 Create Goal dialog. */
export function AddGoalButton() {
  return (
    <Button disabled title="Create Goal dialog arrives in Day 3">
      <PlusIcon data-icon="inline-start" />
      Add Goal
    </Button>
  );
}
