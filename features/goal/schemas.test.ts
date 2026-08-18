import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseForm } from "../../lib/form";
import {
  addCalendarYears,
  formatDateOnly,
  startOfLocalDay,
} from "../../utils/date-only";
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
  description: "Save for a two-week trip.",
  targetAmount: "100000",
  startingAmount: "0",
  category: "TRAVEL",
  priority: "HIGH",
  deadline: formatDateOnly(addCalendarYears(startOfLocalDay(), 1)),
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

  it("parses Indian-formatted amounts as the raw number", () => {
    const parsed = parseForm(
      createGoalSchema,
      formData({
        ...goalFields,
        targetAmount: "₹ 1,00,000",
        startingAmount: "10,000",
      }),
    );

    assert.equal(parsed.success, true);
    if (!parsed.success) {
      return;
    }
    assert.equal(parsed.data.targetAmount, 100000);
    assert.equal(parsed.data.startingAmount, 10000);
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
    const expected = addCalendarYears(startOfLocalDay(), 1);
    assert.equal(parsed.data.deadline.getFullYear(), expected.getFullYear());
    assert.equal(parsed.data.deadline.getMonth(), expected.getMonth());
    assert.equal(parsed.data.deadline.getDate(), expected.getDate());
  });

  it("requires every field", () => {
    const parsed = parseForm(createGoalSchema, formData({}));

    assert.equal(parsed.success, false);
    if (parsed.success) {
      return;
    }
    assert.equal(parsed.fieldErrors.name, "Goal name is required.");
    assert.equal(parsed.fieldErrors.description, "Description is required.");
    assert.equal(parsed.fieldErrors.targetAmount, "Target amount is required.");
    assert.equal(
      parsed.fieldErrors.startingAmount,
      "Starting amount is required.",
    );
    assert.equal(parsed.fieldErrors.deadline, "Deadline is required.");
    assert.equal(parsed.fieldErrors.category, "Select a category.");
    assert.equal(parsed.fieldErrors.priority, "Select a priority.");
  });

  it("rejects a past deadline", () => {
    const parsed = parseForm(
      createGoalSchema,
      formData({ ...goalFields, deadline: "2020-01-01" }),
    );

    assert.equal(parsed.success, false);
    if (!parsed.success) {
      assert.equal(
        parsed.fieldErrors.deadline,
        "Deadline must be today or a future date.",
      );
    }
  });

  it("rejects a deadline more than 5 years away", () => {
    const parsed = parseForm(
      createGoalSchema,
      formData({
        ...goalFields,
        deadline: formatDateOnly(addCalendarYears(startOfLocalDay(), 6)),
      }),
    );

    assert.equal(parsed.success, false);
    if (!parsed.success) {
      assert.equal(
        parsed.fieldErrors.deadline,
        "Deadline cannot be more than 5 years from today.",
      );
    }
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
