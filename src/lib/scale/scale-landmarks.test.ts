import test from "node:test";
import assert from "node:assert/strict";
import type { BillionaireEntry } from "@/data/billionaires.types";
import type { ComparisonItem } from "@/lib/locale";
import { BILLION, MILLION, TRILLION } from "@/lib/scale/scale-math";
import { assembleLandmarks, trackEndDollars } from "@/lib/scale/scale-landmarks";

const ENTRIES: BillionaireEntry[] = [
  { name: "Rich Person", slug: "rich-person", rank: 1, netWorth: 1239.18 },
  { name: "Second Person", slug: "second-person", rank: 2, netWorth: 300 },
];

const COMPARISONS: ComparisonItem[] = [
  { id: "medianSalary", label: "Median US salary", value: 59_384, source: "Census", effortLabel: "a year of work" },
  { id: "averageHomePrice", label: "Average US home price", value: 420_800, source: "NAR", effortLabel: "a home" },
];

test("always includes the three headline amounts", () => {
  const ls = assembleLandmarks({ entries: [], comparisons: [] });
  const amounts = ls.filter((l) => l.category === "amount").map((l) => l.dollars);
  assert.deepEqual(amounts.sort((a, b) => a - b), [MILLION, BILLION, TRILLION]);
});

test("maps locale comparisons to everyday landmarks", () => {
  const ls = assembleLandmarks({ entries: [], comparisons: COMPARISONS });
  const salary = ls.find((l) => l.id === "everyday-medianSalary");
  assert.ok(salary);
  assert.equal(salary?.dollars, 59_384);
  assert.equal(salary?.category, "everyday");
});

test("converts top billionaire net worth (billions) to dollars", () => {
  const ls = assembleLandmarks({ entries: ENTRIES, comparisons: [], topBillionaires: 1 });
  const bills = ls.filter((l) => l.category === "billionaire");
  assert.equal(bills.length, 1);
  assert.equal(bills[0].label, "Rich Person");
  assert.equal(bills[0].dollars, 1239.18 * BILLION);
});

test("respects topBillionaires count and sorts by net worth", () => {
  const ls = assembleLandmarks({ entries: ENTRIES, comparisons: [], topBillionaires: 2 });
  const bills = ls.filter((l) => l.category === "billionaire");
  assert.equal(bills.length, 2);
  assert.equal(bills[bills.length - 1].label, "Rich Person"); // richest last in ascending sort
});

test("output is sorted ascending by dollars", () => {
  const ls = assembleLandmarks({ entries: ENTRIES, comparisons: COMPARISONS });
  for (let i = 1; i < ls.length; i++) {
    assert.ok(ls[i].dollars >= ls[i - 1].dollars);
  }
});

test("trackEnd covers the largest landmark and is at least past a trillion", () => {
  const ls = assembleLandmarks({ entries: ENTRIES, comparisons: COMPARISONS });
  const max = ls.reduce((m, l) => Math.max(m, l.dollars), 0);
  const end = trackEndDollars(ls);
  assert.ok(end >= max);
  assert.ok(end >= TRILLION * 1.2);
});
