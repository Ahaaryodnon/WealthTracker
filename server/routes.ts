import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { filterSchema } from "@shared/schema";
import { calculateWealthTax } from "@/lib/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  
  // Get public figures with filtering and pagination
  app.get("/api/public-figures", async (req, res) => {
    try {
      const query = req.query;
      
      // Parse and validate query parameters
      const validatedParams = filterSchema.parse({
        categories: query.categories ? (query.categories as string).split(',') : undefined,
        wealthRange: query.wealthRange as string | undefined,
        incomeRange: query.incomeRange as string | undefined,
        dataSources: query.dataSources ? (query.dataSources as string).split(',') : undefined,
        page: query.page ? parseInt(query.page as string) : 1,
        limit: query.limit ? parseInt(query.limit as string) : 10,
        sortBy: query.sortBy as string | undefined,
      });
      
      const searchQuery = query.search as string | undefined;
      
      // Get figures with filters
      const publicFigures = await storage.getPublicFigures(searchQuery, validatedParams);
      
      res.json(publicFigures);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid query parameters", details: error.errors });
      } else {
        console.error("Error fetching public figures:", error);
        res.status(500).json({ error: "Failed to fetch public figures" });
      }
    }
  });
  
  // Get application stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch application stats" });
    }
  });
  
  // Get a specific public figure by ID
  app.get("/api/public-figures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const figure = await storage.getPublicFigureById(id);
      
      if (!figure) {
        return res.status(404).json({ error: "Public figure not found" });
      }
      
      res.json(figure);
    } catch (error) {
      console.error("Error fetching public figure:", error);
      res.status(500).json({ error: "Failed to fetch public figure" });
    }
  });
  
  // Calculate wealth tax for a given wealth amount
  app.get("/api/calculate-tax", (req, res) => {
    try {
      const wealthStr = req.query.wealth as string | undefined;
      
      if (!wealthStr) {
        return res.status(400).json({ error: "Wealth parameter is required" });
      }
      
      const wealth = parseFloat(wealthStr);
      
      if (isNaN(wealth)) {
        return res.status(400).json({ error: "Invalid wealth value" });
      }
      
      const threshold = 2000000; // £2 million threshold
      const taxRate = 0.01; // 1% tax rate
      
      const taxAmount = calculateWealthTax(wealth, threshold, taxRate);
      
      res.json({
        wealth,
        threshold,
        taxRate,
        taxAmount
      });
    } catch (error) {
      console.error("Error calculating tax:", error);
      res.status(500).json({ error: "Failed to calculate wealth tax" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
