import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Canonical billionaire and metadata schema for WealthTracker.
 * Pipeline writes here; sync step reads and writes src/data/ for the app.
 * Field names camelCase to align with app/pipeline types (Story 1.3).
 */
export default defineSchema({
  billionaires: defineTable({
    name: v.string(),
    forbesNetWorth: v.optional(v.number()),
    bloombergNetWorth: v.optional(v.number()),
    hurunNetWorth: v.optional(v.number()),
    ceoworldNetWorth: v.optional(v.number()),
  }),

  metadata: defineTable({
    dataAsOf: v.string(), // ISO 8601 date string
    medianSalary: v.number(), // comparison baseline for methodology
  }),
});
