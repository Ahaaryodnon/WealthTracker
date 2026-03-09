/**
 * Convex functions for pipeline (write) and sync (read) step.
 * Pipeline calls replaceCanonicalData; sync calls getCanonicalData.
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const billionaireEntryValidator = v.object({
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
});

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const canonicalDataValidator = v.object({
  dataAsOf: v.string(),
  medianSalary: v.number(),
  entries: v.array(billionaireEntryValidator),
});

/** Replace all billionaires and metadata with the given canonical dataset. Called by pipeline. */
export const replaceCanonicalData = mutation({
  args: { data: canonicalDataValidator },
  handler: async (ctx, args) => {
    const { data } = args;

    const existingBillionaires = await ctx.db.query("billionaires").collect();
    for (const row of existingBillionaires) {
      await ctx.db.delete("billionaires", row._id);
    }

    const existingMetadata = await ctx.db.query("metadata").collect();
    for (const row of existingMetadata) {
      await ctx.db.delete("metadata", row._id);
    }

    await ctx.db.insert("metadata", {
      dataAsOf: data.dataAsOf,
      medianSalary: data.medianSalary,
    });

    for (const entry of data.entries) {
      await ctx.db.insert("billionaires", {
        name: entry.name,
        slug: entry.slug ?? nameToSlug(entry.name),
        rank: entry.rank,
        forbesNetWorth: entry.forbesNetWorth,
        bloombergNetWorth: entry.bloombergNetWorth,
        hurunNetWorth: entry.hurunNetWorth,
        ceoworldNetWorth: entry.ceoworldNetWorth,
        citizenship: entry.citizenship,
        source: entry.source,
        industries: entry.industries,
        organization: entry.organization,
        title: entry.title,
        age: entry.age,
        gender: entry.gender,
        selfMade: entry.selfMade,
        imageUrl: entry.imageUrl,
        bio: entry.bio,
        about: entry.about,
      });
    }
  },
});

/** Return full canonical dataset for sync step. */
export const getCanonicalData = query({
  args: {},
  handler: async (ctx) => {
    const [meta] = await ctx.db.query("metadata").collect();
    const rows = await ctx.db.query("billionaires").collect();

    if (!meta) {
      return null;
    }

    const entries = rows.map((r) => ({
      name: r.name,
      slug: r.slug ?? nameToSlug(r.name),
      rank: r.rank,
      forbesNetWorth: r.forbesNetWorth,
      bloombergNetWorth: r.bloombergNetWorth,
      hurunNetWorth: r.hurunNetWorth,
      ceoworldNetWorth: r.ceoworldNetWorth,
      citizenship: r.citizenship,
      source: r.source,
      industries: r.industries,
      organization: r.organization,
      title: r.title,
      age: r.age,
      gender: r.gender,
      selfMade: r.selfMade,
      imageUrl: r.imageUrl,
      bio: r.bio,
      about: r.about,
      netWorth: (() => {
        const values = [
          r.forbesNetWorth,
          r.bloombergNetWorth,
          r.hurunNetWorth,
          r.ceoworldNetWorth,
        ].filter((v): v is number => v != null);
        if (values.length === 0) return undefined;
        const total = values.reduce((sum, value) => sum + value, 0);
        return total / values.length;
      })(),
    }));

    return {
      dataAsOf: meta.dataAsOf,
      medianSalary: meta.medianSalary,
      entries,
    };
  },
});
