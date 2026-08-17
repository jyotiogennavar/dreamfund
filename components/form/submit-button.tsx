"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  disabled?: boolean;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

export function SubmitButton({
  label,
  pendingLabel,
  disabled = false,
  className,
  variant,
  size,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      variant={variant}
      size={size}
      className={cn("w-full sm:w-auto", className)}
    >
      {pending ? (
        <>
          <Spinner className="size-4 text-current" />
          {pendingLabel ?? label}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
