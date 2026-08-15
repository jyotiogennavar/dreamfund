import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dateOnlyFromStored,
  formatDateOnly,
  parseDateOnly,
} from "./date-only";

describe("parseDateOnly", () => {
  it("builds a local calendar date from yyyy-MM-dd", () => {
    const date = parseDateOnly("2027-01-01");
    assert.ok(date);
    assert.equal(date.getFullYear(), 2027);
    assert.equal(date.getMonth(), 0);
    assert.equal(date.getDate(), 1);
  });

  it("rejects impossible calendar days", () => {
    assert.equal(parseDateOnly("2027-02-31"), null);
    assert.equal(parseDateOnly("not-a-date"), null);
  });
});

describe("formatDateOnly", () => {
  it("keeps the UTC calendar day from a midnight ISO timestamp", () => {
    assert.equal(formatDateOnly("2027-01-01T00:00:00.000Z"), "2027-01-01");
  });

  it("formats a local Date with local calendar parts", () => {
    assert.equal(formatDateOnly(new Date(2027, 0, 1, 12)), "2027-01-01");
  });
});

describe("dateOnlyFromStored", () => {
  it("round-trips a UTC midnight ISO deadline without shifting the day", () => {
    const date = dateOnlyFromStored("2027-01-01T00:00:00.000Z");
    assert.ok(date);
    assert.equal(date.getFullYear(), 2027);
    assert.equal(date.getMonth(), 0);
    assert.equal(date.getDate(), 1);
    assert.equal(formatDateOnly(date), "2027-01-01");
  });
});
