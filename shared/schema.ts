import { pgTable, text, serial, integer, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const publicFigures = pgTable("publicFigures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(), // Politicians, Business Leaders, Celebrities, Sports
  estimatedWealth: real("estimatedWealth").notNull(),
  passiveIncome: real("passiveIncome").notNull(),
  wealthTax: real("wealthTax").notNull(),
  dataSources: jsonb("dataSources").$type<string[]>().notNull(),
});

export const insertPublicFigureSchema = createInsertSchema(publicFigures).pick({
  name: true,
  title: true,
  category: true,
  estimatedWealth: true,
  passiveIncome: true,
  wealthTax: true,
  dataSources: true,
});

export type InsertPublicFigure = z.infer<typeof insertPublicFigureSchema>;
export type PublicFigure = typeof publicFigures.$inferSelect;

// Additional types for application stats
export interface AppStats {
  totalProfiles: number;
  totalPassiveIncome: number;
  potentialTaxRevenue: number;
}

// Validation schemes for filtering and sorting
export const searchQuerySchema = z.string().optional();

export const filterSchema = z.object({
  categories: z.array(z.string()).optional(),
  wealthRange: z.string().optional(),
  incomeRange: z.string().optional(),
  dataSources: z.array(z.string()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  sortBy: z.string().optional(),
});

export type FilterParams = z.infer<typeof filterSchema>;
