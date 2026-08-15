import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildCompletionChartData,
  buildPriorityChartData,
} from "./analytics";

describe("buildCompletionChartData", () => {
  it("returns 0 and no segments when there are no goals", () => {
    const result = buildCompletionChartData([]);

    assert.equal(result.overallPercent, 0);
    assert.deepEqual(result.segments, []);
  });

  it("does not let one overshot goal hide another that still needs money", () => {
    const result = buildCompletionChartData([
      { currentAmount: 2000, targetAmount: 1000 },
      { currentAmount: 0, targetAmount: 1000 },
    ]);

    assert.equal(result.overallPercent, 50);
    assert.deepEqual(
      result.segments.map((segment) => [segment.name, segment.value]),
      [
        ["Completed", 1],
        ["Not Started", 1],
      ],
    );
  });

  it("does not round an incomplete total up to 100%", () => {
    const result = buildCompletionChartData([
      { currentAmount: 999, targetAmount: 1000 },
      { currentAmount: 999, targetAmount: 1000 },
    ]);

    assert.equal(result.overallPercent, 99);
    assert.equal(result.segments.length, 1);
    assert.equal(result.segments[0]?.name, "In Progress");
    assert.equal(result.segments[0]?.value, 2);
  });

  it("shows 100% only when every valid target is met", () => {
    const result = buildCompletionChartData([
      { currentAmount: 1000, targetAmount: 1000 },
      { currentAmount: 1500, targetAmount: 1000 },
    ]);

    assert.equal(result.overallPercent, 100);
  });

  it("shows 0% when nothing has been saved toward valid targets", () => {
    const result = buildCompletionChartData([
      { currentAmount: 0, targetAmount: 1000 },
      { currentAmount: 50, targetAmount: 0 },
    ]);

    assert.equal(result.overallPercent, 0);
  });
});

describe("buildPriorityChartData", () => {
  it("counts priorities and drops empty slices", () => {
    const result = buildPriorityChartData([
      { priority: "HIGH" },
      { priority: "HIGH" },
      { priority: "LOW" },
    ]);

    assert.deepEqual(
      result.map((segment) => [segment.name, segment.value]),
      [
        ["High", 2],
        ["Low", 1],
      ],
    );
  });

  it("returns no segments when there are no goals", () => {
    assert.deepEqual(buildPriorityChartData([]), []);
  });
});
