import { InboxIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PlaceholderProps = {
  label: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function Placeholder({
  label,
  description,
  icon,
  children,
  className,
}: PlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-4xl border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      {icon ?? (
        <InboxIcon className="text-muted-foreground size-10" aria-hidden />
      )}
      <div>
        <p className="font-heading text-lg font-medium">{label}</p>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
