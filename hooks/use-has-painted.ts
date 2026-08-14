import { useSyncExternalStore } from "react";

let hasPainted = false;
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  if (!hasPainted && listeners.size === 1) {
    requestAnimationFrame(() => {
      hasPainted = true;
      listeners.forEach((listener) => listener());
    });
  }

  return () => {
    listeners.delete(onStoreChange);
  };
}

export function useHasPainted() {
  return useSyncExternalStore(subscribe, () => hasPainted, () => false);
}
