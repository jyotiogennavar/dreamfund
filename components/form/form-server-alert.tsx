"use client";

type FormServerAlertProps = {
  id: string;
  message?: string;
  ref?: React.Ref<HTMLDivElement>;
};

export function FormServerAlert({ id, message, ref }: FormServerAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      ref={ref}
      id={id}
      tabIndex={-1}
      role="alert"
      className="border-destructive bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm outline-none"
    >
      {message}
    </div>
  );
}
