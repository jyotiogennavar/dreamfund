import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { goalPath } from "../../paths";
import {
  amountNeeded,
  formatGoalRemaining,
  getGoalStatus,
  goalProgressPercent,
} from "./goal-math";

describe("goalProgressPercent", () => {
  it("does not round an incomplete goal up to 100%", () => {
    assert.equal(goalProgressPercent(995, 1000), 99);
  });

  it("shows 100% only when the goal is actually reached", () => {
    assert.equal(goalProgressPercent(1000, 1000), 100);
    assert.equal(goalProgressPercent(1100, 1000), 100);
  });

  it("shows at least 1% once saving has started", () => {
    assert.equal(goalProgressPercent(1, 1000), 1);
  });

  it("shows 0% when nothing has been saved", () => {
    assert.equal(goalProgressPercent(0, 1000), 0);
  });

  it("returns 0 when the target is missing or invalid", () => {
    assert.equal(goalProgressPercent(50, 0), 0);
  });
});

describe("getGoalStatus", () => {
  it("matches analytics labels for not started, in progress, and completed", () => {
    assert.equal(getGoalStatus(0, 1000), "Not Started");
    assert.equal(getGoalStatus(1, 1000), "In Progress");
    assert.equal(getGoalStatus(995, 1000), "In Progress");
    assert.equal(getGoalStatus(1000, 1000), "Completed");
  });
});

describe("amountNeeded", () => {
  it("clamps remaining at zero once the target is met", () => {
    assert.equal(amountNeeded(995, 1000), 5);
    assert.equal(amountNeeded(1000, 1000), 0);
    assert.equal(amountNeeded(1100, 1000), 0);
  });
});

describe("formatGoalRemaining", () => {
  it("uses reached copy for completed goals", () => {
    assert.equal(formatGoalRemaining(1000, 1000, "INR"), "Goal reached");
  });

  it("includes the remaining amount while a goal is open", () => {
    assert.match(formatGoalRemaining(995, 1000, "INR"), /remaining$/);
    assert.doesNotMatch(formatGoalRemaining(995, 1000, "INR"), /Goal reached/);
  });
});

describe("goalPath", () => {
  it("builds the goal detail href", () => {
    assert.equal(goalPath("goal_123"), "/goals/goal_123");
  });
});
