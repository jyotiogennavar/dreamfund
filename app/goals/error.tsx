"use client";

import { CircleAlertIcon } from "lucide-react";

import { Placeholder } from "@/components/placeholder";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Placeholder
      label={error.message || "Something went wrong"}
      description="We couldn’t load your goals. Try again, or come back later."
      icon={<CircleAlertIcon className="text-muted-foreground size-10" aria-hidden />}
    >
      <Button onClick={reset}>Try again</Button>
    </Placeholder>
  );
}
