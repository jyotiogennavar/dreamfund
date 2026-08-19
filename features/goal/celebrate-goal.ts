export async function celebrateGoalCompletion() {
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const confetti = (await import("canvas-confetti")).default;
  void confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.6 },
  });
}
