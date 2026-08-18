import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  caretFromDigitCount,
  countDigitsBefore,
  formatMoneyInput,
  sanitizeMoneyInput,
  stripMoneyFormatting,
} from "./money";

describe("formatMoneyInput", () => {
  it("formats integers with the Indian grouping system and a rupee prefix", () => {
    assert.equal(formatMoneyInput("1000"), "₹ 1,000");
    assert.equal(formatMoneyInput("10000"), "₹ 10,000");
    assert.equal(formatMoneyInput("100000"), "₹ 1,00,000");
    assert.equal(formatMoneyInput("1000000"), "₹ 10,00,000");
    assert.equal(formatMoneyInput("10000000"), "₹ 1,00,00,000");
  });

  it("leaves an empty value empty", () => {
    assert.equal(formatMoneyInput(""), "");
  });

  it("formats zero", () => {
    assert.equal(formatMoneyInput("0"), "₹ 0");
  });
});

describe("sanitizeMoneyInput", () => {
  it("keeps typed digits and strips grouping and the currency symbol", () => {
    assert.equal(sanitizeMoneyInput("₹ 10,00,000"), "1000000");
    assert.equal(sanitizeMoneyInput("10,00,000"), "1000000");
    assert.equal(sanitizeMoneyInput("1000000"), "1000000");
  });

  it("rejects letters and other non-numeric characters", () => {
    assert.equal(sanitizeMoneyInput("12a34"), "1234");
    assert.equal(sanitizeMoneyInput("₹abc"), "");
  });

  it("ignores a pasted decimal remainder for whole-rupee fields", () => {
    assert.equal(sanitizeMoneyInput("1000.50"), "1000");
    assert.equal(sanitizeMoneyInput("₹ 1,000.50"), "1000");
  });

  it("strips leading zeros except a lone zero", () => {
    assert.equal(sanitizeMoneyInput("0"), "0");
    assert.equal(sanitizeMoneyInput("00"), "0");
    assert.equal(sanitizeMoneyInput("01"), "1");
  });

  it("caps values at 10 integer digits", () => {
    assert.equal(sanitizeMoneyInput("12345678901"), "1234567890");
  });
});

describe("stripMoneyFormatting", () => {
  it("normalizes formatted amounts for validation", () => {
    assert.equal(stripMoneyFormatting("₹ 10,00,000"), "1000000");
    assert.equal(stripMoneyFormatting("1,00,000"), "100000");
    assert.equal(stripMoneyFormatting("100000"), "100000");
  });

  it("preserves scientific notation and extra decimals so validation can reject them", () => {
    assert.equal(stripMoneyFormatting("1e5"), "1e5");
    assert.equal(stripMoneyFormatting("10.125"), "10.125");
    assert.equal(stripMoneyFormatting("abc"), "abc");
  });
});

describe("caret helpers", () => {
  it("counts only digits before the caret", () => {
    assert.equal(countDigitsBefore("₹ 1,00,000", 4), 1);
    assert.equal(countDigitsBefore("₹ 1,00,000", 6), 3);
  });

  it("restores the caret after the same digit count", () => {
    assert.equal(caretFromDigitCount("₹ 1,000", 1), 3);
    assert.equal(caretFromDigitCount("₹ 1,000", 4), 7);
    assert.equal(caretFromDigitCount("₹ 1,000", 0), 2);
  });
});
