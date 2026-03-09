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
    slug: v.optional(v.string()),
    rank: v.optional(v.number()),
    forbesNetWorth: v.optional(v.number()),
    bloombergNetWorth: v.optional(v.number()),
    hurunNetWorth: v.optional(v.number()),
    ceoworldNetWorth: v.optional(v.number()),
    citizenship: v.optional(v.string()),
    source: v.optional(v.string()),
    industries: v.optional(v.array(v.string())),
    organization: v.optional(v.string()),
    title: v.optional(v.string()),
    age: v.optional(v.number()),
    gender: v.optional(v.string()),
    selfMade: v.optional(v.boolean()),
    imageUrl: v.optional(v.string()),
    bio: v.optional(v.array(v.string())),
    about: v.optional(v.array(v.string())),
  }).index("by_slug", ["slug"]),

  metadata: defineTable({
    dataAsOf: v.string(), // ISO 8601 date string
    medianSalary: v.number(), // comparison baseline for methodology
  }),
});
