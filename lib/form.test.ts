import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  clearFieldError,
  shouldShowFormError,
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
