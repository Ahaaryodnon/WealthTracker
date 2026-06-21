import test from "node:test";
import assert from "node:assert/strict";
import {
  MILLION,
  BILLION,
  TRILLION,
  dollarsToX,
  dollarsToSliderFraction,
  sliderFractionToDollars,
} from "@/lib/scale/scale-math";

test("magnitude constants are 1000x apart", () => {
  assert.equal(MILLION, 1_000_000);
  assert.equal(BILLION, MILLION * 1000);
  assert.equal(TRILLION, BILLION * 1000);
});

test("dollarsToX scales linearly by pxPerDollar", () => {
  assert.equal(dollarsToX(1_000_000, 0.001), 1000);
  assert.equal(dollarsToX(0, 0.001), 0);
  // a billion is exactly 1000x the pixel distance of a million
  assert.equal(dollarsToX(BILLION, 1e-6) / dollarsToX(MILLION, 1e-6), 1000);
});

test("slider mapping is logarithmic and round-trips", () => {
  const max = TRILLION;
  // a million sits in the lower portion of a log slider over [$1, $1T]
  const fMillion = dollarsToSliderFraction(MILLION, max);
  const fBillion = dollarsToSliderFraction(BILLION, max);
  assert.ok(fMillion > 0 && fMillion < 1);
  assert.ok(fBillion > fMillion);
  assert.equal(dollarsToSliderFraction(TRILLION, max), 1);
  // round-trip within float tolerance
  const back = sliderFractionToDollars(fBillion, max);
  assert.ok(Math.abs(back - BILLION) / BILLION < 1e-9);
});

test("sliderFractionToDollars clamps out-of-range fractions", () => {
  assert.equal(sliderFractionToDollars(-1, TRILLION), 1);
  assert.equal(sliderFractionToDollars(2, TRILLION), TRILLION);
});
