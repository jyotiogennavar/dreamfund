import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { z } from "zod";

import {
  clearFieldError,
  fromErrorToActionState,
  shouldShowFormError,
  toActionState,
  visibleFieldError,
} from "./form";

describe("visibleFieldError", () => {
  it("keeps a dismissed local error from falling back to the server", () => {
    const local = clearFieldError({}, "targetAmount");
    const server = {
      targetAmount: "Target amount cannot be less than the amount already saved.",
    };

    assert.equal(visibleFieldError(local, server, "targetAmount"), undefined);
  });

  it("shows the server error before the field is edited", () => {
    assert.equal(
      visibleFieldError(
        {},
        { targetAmount: "Target amount cannot be less than the amount already saved." },
        "targetAmount",
      ),
      "Target amount cannot be less than the amount already saved.",
    );
  });
});

describe("shouldShowFormError", () => {
  it("shows a form-only error such as goal not found", () => {
    assert.equal(shouldShowFormError("Goal not found.", {}, {}), true);
    assert.equal(shouldShowFormError("Goal not found.", {}, undefined), true);
  });

  it("hides a form error that is already shown on a field", () => {
    assert.equal(
      shouldShowFormError(
        "Target amount cannot be less than the amount already saved.",
        {},
        {
          targetAmount:
            "Target amount cannot be less than the amount already saved.",
        },
      ),
      false,
    );
  });
});

describe("toActionState", () => {
  it("sets a new timestamp on every call", () => {
    const first = toActionState("SUCCESS", "Saved");
    const second = toActionState("ERROR", "Failed", { name: "Required" });

    assert.equal(first.status, "SUCCESS");
    assert.equal(first.message, "Saved");
    assert.equal(second.status, "ERROR");
    assert.deepEqual(second.fieldErrors, { name: "Required" });
    assert.ok(second.timestamp >= first.timestamp);
  });
});

describe("fromErrorToActionState", () => {
  it("maps a ZodError to field errors", () => {
    const parsed = z
      .object({ name: z.string().min(1, "Name is required.") })
      .safeParse({ name: "" });

    assert.equal(parsed.success, false);
    if (parsed.success) {
      return;
    }

    const state = fromErrorToActionState(parsed.error);
    assert.equal(state.status, "ERROR");
    assert.equal(state.message, "Name is required.");
    assert.deepEqual(state.fieldErrors, { name: "Name is required." });
  });

  it("maps unexpected errors to a generic save message", () => {
    const fromError = fromErrorToActionState(new Error("Goal not found."));
    const fromUnknown = fromErrorToActionState("nope");

    assert.equal(fromError.status, "ERROR");
    assert.equal(
      fromError.message,
      "Something went wrong while saving. Try again.",
    );
    assert.equal(fromUnknown.status, "ERROR");
    assert.equal(
      fromUnknown.message,
      "Something went wrong while saving. Try again.",
    );
  });
});
