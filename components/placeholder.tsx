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
        "flex flex-col items-center justify-center gap-4 rounded-4xl border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      {icon ?? (
        <InboxIcon className="pointer-events-none text-muted-foreground size-10" aria-hidden />
      )}
      <div>
        <p className="font-heading text-lg font-medium text-balance">{label}</p>
        {description ? (
          <p className="text-muted-foreground measure mx-auto mt-1 text-pretty text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
