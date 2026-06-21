import type { BillionaireEntry } from "@/data/billionaires.types";

/**
 * UK billionaires from the Sunday Times Rich List 2025. netWorth in GBP billions.
 * Hand-maintained and intentionally OUTSIDE the Forbes pipeline (which rebuilds
 * src/data/billionaires.ts as the global top ~10). The scale page pulls these
 * under the en-GB locale.
 */
export const ukBillionaires: BillionaireEntry[] = [
  { name: "Hinduja family", slug: "hinduja-family", netWorth: 35.3, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "David & Simon Reuben", slug: "reuben-brothers", netWorth: 26.87, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Sir Leonard Blavatnik", slug: "leonard-blavatnik", netWorth: 25.73, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Sir James Dyson & family", slug: "james-dyson", netWorth: 20.8, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Idan Ofer", slug: "idan-ofer", netWorth: 20.12, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Weston family", slug: "weston-family", netWorth: 17.75, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Sir Jim Ratcliffe", slug: "jim-ratcliffe", netWorth: 17.05, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Lakshmi Mittal & family", slug: "lakshmi-mittal", netWorth: 15.44, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "John Fredriksen & family", slug: "john-fredriksen", netWorth: 13.68, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
  { name: "Bukhman brothers", slug: "bukhman-brothers", netWorth: 12.54, citizenship: "United Kingdom", source: "Sunday Times Rich List 2025" },
];
