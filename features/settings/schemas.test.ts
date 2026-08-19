import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseForm } from "../../lib/form";
import { updateSettingsSchema } from "./schemas";

function formData(entries: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    data.set(key, value);
  }
  return data;
}

const settingsFields = {
  name: "Jyoti Ogennavar",
  email: "demo@dreamfund.app",
  currency: "INR",
  notifyGoalAchieved: "on",
  notifyMonthlySummary: "on",
  notifyDepositReminder: "off",
};

describe("updateSettingsSchema", () => {
  it("accepts a valid profile and lowercases email", () => {
    const parsed = parseForm(
      updateSettingsSchema,
      formData({ ...settingsFields, email: "Demo@Dreamfund.APP" }),
    );

    assert.equal(parsed.success, true);
    if (!parsed.success) {
      return;
    }

    assert.equal(parsed.data.email, "demo@dreamfund.app");
    assert.equal(parsed.data.name, "Jyoti Ogennavar");
  });

  it("rejects a missing email", () => {
    const parsed = parseForm(
      updateSettingsSchema,
      formData({ ...settingsFields, email: "  " }),
    );

    assert.equal(parsed.success, false);
    if (parsed.success) {
      return;
    }

    assert.equal(parsed.fieldErrors.email, "Email is required.");
  });

  it("rejects an invalid email", () => {
    const parsed = parseForm(
      updateSettingsSchema,
      formData({ ...settingsFields, email: "not-an-email" }),
    );

    assert.equal(parsed.success, false);
    if (parsed.success) {
      return;
    }

    assert.equal(parsed.fieldErrors.email, "Enter a valid email.");
  });
});
