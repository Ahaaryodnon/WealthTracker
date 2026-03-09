/**
 * Canonical billionaire dataset consumed at build time.
 * Populated by sync step (Story 1.4) from Convex; seed data is Story 1.5.
 * Do not edit by hand; run `npm run data:sync` after Convex updates.
 */
import type { WealthTrackerData } from "./billionaires.types";

export const wealthTrackerData: WealthTrackerData = {
  dataAsOf: "2026-03-02",
  entries: [
    {
      forbesNetWorth: 839.618478,
      name: "Elon Musk",
      slug: "elon-musk",
      rank: 1,
      netWorth: 839.618478
    },
    {
      forbesNetWorth: 253.048372,
      name: "Larry Page",
      slug: "larry-page",
      rank: 2,
      netWorth: 253.048372
    },
    {
      forbesNetWorth: 233.526324,
      name: "Sergey Brin",
      slug: "sergey-brin",
      rank: 3,
      netWorth: 233.526324
    },
    {
      forbesNetWorth: 224.125183,
      name: "Mark Zuckerberg",
      slug: "mark-zuckerberg",
      rank: 4,
      netWorth: 224.125183
    },
    {
      forbesNetWorth: 222.321675,
      name: "Jeff Bezos",
      slug: "jeff-bezos",
      rank: 5,
      netWorth: 222.321675
    },
    {
      forbesNetWorth: 197.024201,
      name: "Larry Ellison",
      slug: "larry-ellison",
      rank: 6,
      netWorth: 197.024201
    },
    {
      forbesNetWorth: 164.146411,
      name: "Bernard Arnault & family",
      slug: "bernard-arnault-and-family",
      rank: 7,
      netWorth: 164.146411
    },
    {
      forbesNetWorth: 158.06177499999998,
      name: "Jensen Huang",
      slug: "jensen-huang",
      rank: 8,
      netWorth: 158.06177499999998
    },
    {
      forbesNetWorth: 145.274484,
      name: "Rob Walton & family",
      slug: "rob-walton-and-family",
      rank: 9,
      netWorth: 145.274484
    },
    {
      forbesNetWorth: 142.549447,
      name: "Jim Walton & family",
      slug: "jim-walton-and-family",
      rank: 10,
      netWorth: 142.549447
    }
  ],
  medianSalary: 59384
};
