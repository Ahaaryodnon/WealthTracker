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
      netWorth: 1239.180967,
      slug: "elon-musk"
    },
    {
      forbesNetWorth: 300.984806,
      name: "Larry Page",
      netWorth: 300.984806,
      slug: "larry-page"
    },
    {
      forbesNetWorth: 277.596225,
      name: "Sergey Brin",
      netWorth: 277.596225,
      slug: "sergey-brin"
    },
    {
      forbesNetWorth: 254.08094699999998,
      name: "Jeff Bezos",
      netWorth: 254.08094699999998,
      slug: "jeff-bezos"
    },
    {
      forbesNetWorth: 234.512735,
      name: "Michael Dell",
      netWorth: 234.512735,
      slug: "michael-dell"
    },
    {
      forbesNetWorth: 231.644913,
      name: "Larry Ellison",
      netWorth: 231.644913,
      slug: "larry-ellison"
    },
    {
      forbesNetWorth: 198.24086,
      name: "Mark Zuckerberg",
      netWorth: 198.24086,
      slug: "mark-zuckerberg"
    },
    {
      forbesNetWorth: 182.057422,
      name: "Jensen Huang",
      netWorth: 182.057422,
      slug: "jensen-huang"
    },
    {
      forbesNetWorth: 153.261493,
      name: "Bernard Arnault & family",
      netWorth: 153.261493,
      slug: "bernard-arnault"
    },
    {
      forbesNetWorth: 144.765127,
      name: "Warren Buffett",
      netWorth: 144.765127,
      slug: "warren-buffett"
    }
  ],
  medianSalary: 59384
};
