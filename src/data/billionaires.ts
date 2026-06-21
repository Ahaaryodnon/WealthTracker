/**
 * Canonical billionaire dataset consumed at build time.
 * Populated by sync step (Story 1.4) from Convex; seed data is Story 1.5.
 * Do not edit by hand; run `npm run data:sync` after Convex updates.
 */
import type { WealthTrackerData } from "./billionaires.types";

export const wealthTrackerData: WealthTrackerData = {
  dataAsOf: "2026-06-21",
  entries: [
    {
      forbesNetWorth: 1239.180967,
      name: "Elon Musk",
      slug: "elon-musk",
      rank: 1,
      netWorth: 1239.180967,
    },
    {
      forbesNetWorth: 300.984806,
      name: "Larry Page",
      slug: "larry-page",
      rank: 2,
      netWorth: 300.984806,
    },
    {
      forbesNetWorth: 277.596225,
      name: "Sergey Brin",
      slug: "sergey-brin",
      rank: 3,
      netWorth: 277.596225,
    },
    {
      forbesNetWorth: 254.080947,
      name: "Jeff Bezos",
      slug: "jeff-bezos",
      rank: 4,
      netWorth: 254.080947,
    },
    {
      forbesNetWorth: 234.512735,
      name: "Michael Dell",
      slug: "michael-dell",
      rank: 5,
      netWorth: 234.512735,
    },
    {
      forbesNetWorth: 231.644913,
      name: "Larry Ellison",
      slug: "larry-ellison",
      rank: 6,
      netWorth: 231.644913,
    },
    {
      forbesNetWorth: 198.24086,
      name: "Mark Zuckerberg",
      slug: "mark-zuckerberg",
      rank: 7,
      netWorth: 198.24086,
    },
    {
      forbesNetWorth: 182.057422,
      name: "Jensen Huang",
      slug: "jensen-huang",
      rank: 8,
      netWorth: 182.057422,
    },
    {
      forbesNetWorth: 153.261493,
      name: "Bernard Arnault & family",
      slug: "bernard-arnault",
      rank: 9,
      netWorth: 153.261493,
    },
    {
      forbesNetWorth: 144.765127,
      name: "Warren Buffett",
      slug: "warren-buffett",
      rank: 10,
      netWorth: 144.765127,
    },
  ],
  medianSalary: 59384,
};
