"use client";

type FormErrorSummaryProps = {
  id: string;
  title: string;
  errors: Array<{ field: string; message: string; targetId: string }>;
  ref?: React.Ref<HTMLDivElement>;
};

export function FormErrorSummary({
  id,
  title,
  errors,
  ref,
}: FormErrorSummaryProps) {
  if (errors.length === 0) {
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
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-disc space-y-1 ps-4">
        {errors.map((error) => (
          <li key={error.field}>
            <a
              href={`#${error.targetId}`}
              className="underline-offset-2 hover:underline"
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(error.targetId)?.focus();
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
