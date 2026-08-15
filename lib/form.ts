import { z } from "zod";

export type ActionState = {
  status: "SUCCESS" | "ERROR";
  message: string;
  fieldErrors?: Record<string, string>;
  timestamp: number;
};

export const EMPTY_ACTION_STATE: ActionState = {
  status: "SUCCESS",
  message: "",
  timestamp: 0,
};

export function toActionState(
  status: ActionState["status"],
  message: string,
  fieldErrors?: Record<string, string>,
): ActionState {
  return {
    status,
    message,
    fieldErrors,
    timestamp: Date.now(),
  };
}

export function fromErrorToActionState(error: unknown): ActionState {
  if (error instanceof z.ZodError) {
    return toActionState(
      "ERROR",
      error.issues[0]?.message ?? "Please check the form and try again.",
      fieldErrors(error),
    );
  }

  if (error instanceof Error) {
    return toActionState("ERROR", error.message);
  }

  return toActionState("ERROR", "An unknown error occurred");
}

export function formValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      values[key] = value;
    }
  }

  return values;
}

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && errors[key] == null) {
      errors[key] = issue.message;
    }
  }

  return errors;
}

export function clearFieldError(
  errors: Record<string, string>,
  field: string,
) {
  if (errors[field] === "") {
    return errors;
  }

  return { ...errors, [field]: "" };
}

export function dismissAllFieldErrors(
  ...sources: Array<Record<string, string> | undefined>
) {
  const next: Record<string, string> = {};

  for (const source of sources) {
    if (!source) {
      continue;
    }

    for (const key of Object.keys(source)) {
      next[key] = "";
    }
  }

  return next;
}

export function visibleFieldError(
  localErrors: Record<string, string>,
  serverErrors: Record<string, string> | undefined,
  field: string,
) {
  if (Object.hasOwn(localErrors, field)) {
    return localErrors[field] || undefined;
  }

  return serverErrors?.[field];
}

export function shouldShowFormError(
  error: string | undefined,
  localErrors: Record<string, string>,
  serverErrors: Record<string, string> | undefined,
) {
  if (!error) {
    return false;
  }

  const fieldMessages = new Set(
    [...Object.values(localErrors), ...Object.values(serverErrors ?? {})].filter(
      Boolean,
    ),
  );

  return !fieldMessages.has(error);
}

export function parseForm<T extends z.ZodType>(schema: T, formData: FormData) {
  const result = schema.safeParse(formValues(formData));

  if (result.success) {
    return { success: true as const, data: result.data };
  }

  return {
    success: false as const,
    error:
      result.error.issues[0]?.message ?? "Please check the form and try again.",
    fieldErrors: fieldErrors(result.error),
  };
}
