import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseForm } from "../../lib/form";
import { createGoalSchema, updateGoalSchema } from "./schemas";

function formData(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}

const goalFields = {
  name: "Japan Trip",
  targetAmount: "100000",
  category: "TRAVEL",
  priority: "HIGH",
  deadline: "2027-01-01",
};

describe("createGoalSchema", () => {
  it("rejects a starting amount above the target", () => {
    const parsed = parseForm(
      createGoalSchema,
      formData({ ...goalFields, startingAmount: "200000" }),
    );

    assert.equal(parsed.success, false);
    if (parsed.success) {
      return;
    }
    assert.equal(
      parsed.fieldErrors.startingAmount,
      "Starting amount cannot exceed the target amount.",
    );
  });

  it("rejects scientific notation and extra decimals", () => {
    const scientific = parseForm(
      createGoalSchema,
      formData({ ...goalFields, targetAmount: "1e5" }),
    );
    const extraDecimals = parseForm(
      createGoalSchema,
      formData({ ...goalFields, targetAmount: "10.125" }),
    );

    assert.equal(scientific.success, false);
    assert.equal(extraDecimals.success, false);
    if (!scientific.success) {
      assert.equal(
        scientific.fieldErrors.targetAmount,
        "Target amount must be a valid non-negative number.",
      );
    }
    if (!extraDecimals.success) {
      assert.equal(
        extraDecimals.fieldErrors.targetAmount,
        "Target amount must be a valid non-negative number.",
      );
    }
  });

  it("parses a deadline as the same calendar day", () => {
    const parsed = parseForm(createGoalSchema, formData(goalFields));

    assert.equal(parsed.success, true);
    if (!parsed.success) {
      return;
    }
    assert.ok(parsed.data.deadline);
    assert.equal(parsed.data.deadline.getFullYear(), 2027);
    assert.equal(parsed.data.deadline.getMonth(), 0);
    assert.equal(parsed.data.deadline.getDate(), 1);
  });
});

describe("updateGoalSchema", () => {
  it("does not compare the target to the amount already saved", () => {
    const parsed = parseForm(
      updateGoalSchema,
      formData({ ...goalFields, goalId: "goal_1", targetAmount: "1" }),
    );

    assert.equal(parsed.success, true);
  });
});
