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
      netWorth: 839.618478
    },
    {
      forbesNetWorth: 253.048372,
      name: "Larry Page",
      netWorth: 253.048372
    },
    {
      forbesNetWorth: 233.526324,
      name: "Sergey Brin",
      netWorth: 233.526324
    },
    {
      forbesNetWorth: 224.125183,
      name: "Mark Zuckerberg",
      netWorth: 224.125183
    },
    {
      forbesNetWorth: 222.321675,
      name: "Jeff Bezos",
      netWorth: 222.321675
    },
    {
      forbesNetWorth: 197.024201,
      name: "Larry Ellison",
      netWorth: 197.024201
    },
    {
      forbesNetWorth: 164.146411,
      name: "Bernard Arnault & family",
      netWorth: 164.146411
    },
    {
      forbesNetWorth: 158.06177499999998,
      name: "Jensen Huang",
      netWorth: 158.06177499999998
    },
    {
      forbesNetWorth: 145.274484,
      name: "Rob Walton & family",
      netWorth: 145.274484
    },
    {
      forbesNetWorth: 142.549447,
      name: "Jim Walton & family",
      netWorth: 142.549447
    }
  ],
  medianSalary: 59384
};
