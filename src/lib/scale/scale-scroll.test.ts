import test from "node:test";
import assert from "node:assert/strict";
import type { Landmark } from "@/lib/scale/scale-landmark-types";
import {
  PX_PER_DOLLAR,
  partitionLandmarks,
  barStateAt,
  terminusX,
  nextBarEnd,
} from "@/lib/scale/scale-scroll";

const L = (id: string, dollars: number): Landmark => ({ id, label: id, dollars, category: "wealth" });
const LANDMARKS = [L("a", 1_000), L("b", 1_000_000), L("c", 1_000_000_000), L("d", 50_000_000_000)];

test("PX_PER_DOLLAR is a positive zoom constant", () => {
  assert.ok(PX_PER_DOLLAR > 0);
});

test("partitionLandmarks splits at the ceiling (inclusive in bars)", () => {
  const { bars, beyond } = partitionLandmarks(LANDMARKS, 1_000_000_000);
  assert.deepEqual(bars.map((l) => l.id), ["a", "b", "c"]);
  assert.deepEqual(beyond.map((l) => l.id), ["d"]);
});

test("partitionLandmarks with a huge ceiling puts everything in bars, beyond empty", () => {
  const { bars, beyond } = partitionLandmarks(LANDMARKS, 1e15);
  assert.equal(bars.length, 4);
  assert.equal(beyond.length, 0);
});

test("barStateAt: ended / ending / running at the boundaries", () => {
  // viewport window is [pos, pos + viewportDollars]
  assert.equal(barStateAt(500, 1_000, 10_000), "ended"); // value < pos
  assert.equal(barStateAt(5_000, 1_000, 10_000), "ending"); // pos <= value <= pos+vp
  assert.equal(barStateAt(50_000, 1_000, 10_000), "running"); // value > pos+vp
  assert.equal(barStateAt(11_000, 1_000, 10_000), "ending"); // exactly at pos+vp
});

test("terminusX is the pixel offset of the value from the current position", () => {
  assert.equal(terminusX(2_000, 1_000, 0.001), 1); // (2000-1000)*0.001
  assert.equal(terminusX(1_000, 1_000, 0.001), 0);
});

test("nextBarEnd returns the smallest value strictly greater than pos, or null", () => {
  assert.equal(nextBarEnd(LANDMARKS, 0), 1_000);
  assert.equal(nextBarEnd(LANDMARKS, 1_000), 1_000_000);
  assert.equal(nextBarEnd(LANDMARKS, 50_000_000_000), null);
});
