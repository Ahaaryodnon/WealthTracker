import test from "node:test";
import assert from "node:assert/strict";
import { ukBillionaires } from "@/data/uk-billionaires";

test("uk-billionaires has 10 entries with unique slugs", () => {
  assert.equal(ukBillionaires.length, 10);
  const slugs = ukBillionaires.map((b) => b.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("every UK billionaire has positive netWorth and UK citizenship", () => {
  for (const b of ukBillionaires) {
    assert.equal(typeof b.netWorth, "number");
    assert.ok((b.netWorth as number) > 0);
    assert.equal(b.citizenship, "United Kingdom");
  }
});

test("entries are in descending net-worth order (Hinduja first)", () => {
  assert.equal(ukBillionaires[0].name, "Hinduja family");
  for (let i = 1; i < ukBillionaires.length; i++) {
    assert.ok((ukBillionaires[i - 1].netWorth as number) >= (ukBillionaires[i].netWorth as number));
  }
});
