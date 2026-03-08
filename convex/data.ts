/**
 * Convex functions for pipeline (write) and sync (read) step.
 * Pipeline calls replaceCanonicalData; sync calls getCanonicalData.
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const billionaireEntryValidator = v.object({
  name: v.string(),
  forbesNetWorth: v.optional(v.number()),
  bloombergNetWorth: v.optional(v.number()),
  hurunNetWorth: v.optional(v.number()),
  ceoworldNetWorth: v.optional(v.number()),
});

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
        forbesNetWorth: entry.forbesNetWorth,
        bloombergNetWorth: entry.bloombergNetWorth,
        hurunNetWorth: entry.hurunNetWorth,
        ceoworldNetWorth: entry.ceoworldNetWorth,
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
      forbesNetWorth: r.forbesNetWorth,
      bloombergNetWorth: r.bloombergNetWorth,
      hurunNetWorth: r.hurunNetWorth,
      ceoworldNetWorth: r.ceoworldNetWorth,
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
