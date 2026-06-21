import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import {
  deriveBillionaireId,
  mergeSources,
  normalizeBillionaireName,
  parseBloombergHtml,
  parseMoneyToBillions,
} from "./update-data.lib";

const FIXTURE_PATH = path.resolve(process.cwd(), "scripts/data/bloomberg.fixture.html");

test("normalizeBillionaireName handles known aliases", () => {
  assert.equal(normalizeBillionaireName("Bernard Arnault & family"), "bernard arnault");
  assert.equal(deriveBillionaireId("Bernard Arnault & family"), "bernard-arnault");
  assert.equal(deriveBillionaireId("Jen-Hsun Huang"), "jensen-huang");
  assert.equal(deriveBillionaireId("Samuel R. Walton"), "rob-walton");
});

test("parseMoneyToBillions supports Bloomberg money strings", () => {
  assert.equal(parseMoneyToBillions("$659B"), 659);
  assert.equal(parseMoneyToBillions("$93.1B"), 93.1);
  assert.equal(parseMoneyToBillions("$708M"), 0.708);
});

test("parseBloombergHtml extracts as-of date and rows from fixture", async () => {
  const html = await readFile(FIXTURE_PATH, "utf8");
  const parsed = parseBloombergHtml(html);

  assert.equal(parsed.dataAsOf, "2026-03-18");
  assert.equal(parsed.entries.length, 3);
  assert.deepEqual(parsed.entries[0], {
    rank: 1,
    id: "elon-musk",
    name: "Elon Musk",
    bloombergNetWorth: 659,
  });
  assert.deepEqual(parsed.entries[1], {
    rank: 2,
    id: "larry-page",
    name: "Larry Page",
    bloombergNetWorth: 264,
  });
});

test("mergeSources combines Forbes and Bloomberg values by canonical id", () => {
  const merged = mergeSources(
    {
      dataAsOf: "2026-03-18",
      fetchedAt: "2026-03-19T00:00:00.000Z",
      entries: [
        {
          id: "larry-page",
          name: "Larry Page",
          forbesNetWorth: 253.048372,
        },
        {
          id: "jensen-huang",
          name: "Jensen Huang",
          forbesNetWorth: 158.061775,
        },
      ],
    },
    {
      dataAsOf: "2026-03-18",
      fetchedAt: "2026-03-19T00:00:01.000Z",
      entries: [
        {
          rank: 2,
          id: "larry-page",
          name: "Larry Page",
          bloombergNetWorth: 264,
        },
        {
          rank: 8,
          id: "jensen-huang",
          name: "Jensen Huang",
          bloombergNetWorth: 149,
        },
        {
          rank: 10,
          id: "warren-buffett",
          name: "Warren Buffett",
          bloombergNetWorth: 144,
        },
      ],
    }
  );

  assert.deepEqual(merged.entries, [
    {
      id: "larry-page",
      name: "Larry Page",
      forbesNetWorth: 253.048372,
      bloombergNetWorth: 264,
    },
    {
      id: "jensen-huang",
      name: "Jensen Huang",
      forbesNetWorth: 158.061775,
      bloombergNetWorth: 149,
    },
  ]);
});

test("mergeSources leaves Bloomberg null when source is unavailable", () => {
  const merged = mergeSources(
    {
      dataAsOf: "2026-03-18",
      fetchedAt: "2026-03-19T00:00:00.000Z",
      entries: [
        {
          id: "rob-walton",
          name: "Rob Walton & family",
          forbesNetWorth: 145.274484,
        },
      ],
    },
    null
  );

  assert.deepEqual(merged.entries, [
    {
      id: "rob-walton",
      name: "Rob Walton & family",
      forbesNetWorth: 145.274484,
      bloombergNetWorth: null,
    },
  ]);
});

test("mergeSources rejects ambiguous Bloomberg matches by leaving value null", () => {
  const merged = mergeSources(
    {
      dataAsOf: "2026-03-18",
      fetchedAt: "2026-03-19T00:00:00.000Z",
      entries: [
        {
          id: "larry-page",
          name: "Larry Page",
          forbesNetWorth: 253.048372,
        },
      ],
    },
    {
      dataAsOf: "2026-03-18",
      fetchedAt: "2026-03-19T00:00:01.000Z",
      entries: [
        {
          rank: 2,
          id: "larry-page",
          name: "Larry Page",
          bloombergNetWorth: 264,
        },
        {
          rank: 3,
          id: "larry-page",
          name: "Lawrence Page",
          bloombergNetWorth: 265,
        },
      ],
    }
  );

  assert.deepEqual(merged.entries, [
    {
      id: "larry-page",
      name: "Larry Page",
      forbesNetWorth: 253.048372,
      bloombergNetWorth: null,
    },
  ]);
});
