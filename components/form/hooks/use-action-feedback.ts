"use client";

import { useEffect, useRef } from "react";

import type { ActionState } from "@/lib/form";

type UseActionFeedbackOptions = {
  onSuccess?: (actionState: ActionState) => void;
  onError?: (actionState: ActionState) => void;
};

export function useActionFeedback(
  actionState: ActionState,
  options: UseActionFeedbackOptions,
) {
  const previousTimestamp = useRef(actionState.timestamp);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    if (previousTimestamp.current === actionState.timestamp) {
      return;
    }

    previousTimestamp.current = actionState.timestamp;

    if (actionState.status === "SUCCESS") {
      optionsRef.current.onSuccess?.(actionState);
      return;
    }

    optionsRef.current.onError?.(actionState);
  }, [actionState]);
}
