import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(
        "size-6 animate-spin text-primary motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

function PageSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center py-20",
        className,
      )}
    >
      <Spinner className="size-8" />
    </div>
  );
}

export { PageSpinner, Spinner };
