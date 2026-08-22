"use client";

import { useRef } from "react";
import { toast } from "sonner";

import { useActionFeedback } from "@/components/form/hooks/use-action-feedback";
import { focusFirstInvalid, shouldShowFormError, type ActionState } from "@/lib/form";

type FormProps = {
  action: (formData: FormData) => void | Promise<void>;
  actionState: ActionState;
  children: React.ReactNode;
  className?: string;
  noValidate?: boolean;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
};

export function Form({
  action,
  actionState,
  children,
  className,
  noValidate = true,
  onSubmit,
  onSuccess,
  onError,
}: FormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useActionFeedback(actionState, {
    onSuccess: (state) => {
      if (state.message) {
        toast.success(state.message);
      }
      onSuccess?.(state);
    },
    onError: (state) => {
      if (shouldShowFormError(state.message, {}, state.fieldErrors)) {
        toast.error(state.message);
      }
      if (formRef.current) {
        focusFirstInvalid(formRef.current);
      }
      onError?.(state);
    },
  });

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (event.defaultPrevented) {
          const form = event.currentTarget;
          queueMicrotask(() => focusFirstInvalid(form));
        }
      }}
      noValidate={noValidate}
      className={className}
    >
      {children}
    </form>
  );
}
