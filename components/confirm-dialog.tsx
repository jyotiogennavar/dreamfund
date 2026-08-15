"use client";

import { useActionState, useState } from "react";

import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EMPTY_ACTION_STATE, type ActionState } from "@/lib/form";

type ConfirmDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  confirmLabel?: string;
  pendingLabel?: string;
  onSuccess?: (actionState: ActionState) => void;
};

export function ConfirmDialog({
  trigger,
  title,
  description,
  action,
  confirmLabel = "Confirm",
  pendingLabel,
  onSuccess,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {open ? (
          <ConfirmDialogForm
            action={action}
            confirmLabel={confirmLabel}
            pendingLabel={pendingLabel}
            onSuccess={(state) => {
              setOpen(false);
              onSuccess?.(state);
            }}
          />
        ) : null}
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ConfirmDialogForm({
  action,
  confirmLabel,
  pendingLabel,
  onSuccess,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  confirmLabel: string;
  pendingLabel?: string;
  onSuccess: (actionState: ActionState) => void;
}) {
  const [actionState, formAction] = useActionState(action, EMPTY_ACTION_STATE);

  return (
    <Form action={formAction} actionState={actionState} onSuccess={onSuccess}>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <SubmitButton
          label={confirmLabel}
          pendingLabel={pendingLabel}
          variant="destructive"
        />
      </AlertDialogFooter>
    </Form>
  );
}
