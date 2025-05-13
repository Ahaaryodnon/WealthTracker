import { PublicFigure, InsertPublicFigure, type FilterParams, AppStats } from "@shared/schema";
import { calculateWealthTax } from "@/lib/utils";

export interface IStorage {
  getPublicFigures(searchQuery?: string, filters?: FilterParams): Promise<PublicFigure[]>;
  getPublicFigureById(id: number): Promise<PublicFigure | undefined>;
  getStats(): Promise<AppStats>;
  createPublicFigure(figure: InsertPublicFigure): Promise<PublicFigure>;
}

export class MemStorage implements IStorage {
  private figures: Map<number, PublicFigure>;
  private currentId: number;

  constructor() {
    this.figures = new Map();
    this.currentId = 1;
    this.seedData();
  }

  async getPublicFigures(searchQuery?: string, filters?: FilterParams): Promise<PublicFigure[]> {
    let results = Array.from(this.figures.values());
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(figure => 
        figure.name.toLowerCase().includes(query) || 
        figure.title.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filters?.categories && filters.categories.length > 0) {
      results = results.filter(figure => 
        filters.categories!.includes(figure.category)
      );
    }
    
    // Apply wealth range filter
    if (filters?.wealthRange) {
      switch (filters.wealthRange) {
        case "£2M - £10M":
          results = results.filter(figure => 
            figure.estimatedWealth >= 2000000 && figure.estimatedWealth <= 10000000
          );
          break;
        case "£10M - £100M":
          results = results.filter(figure => 
            figure.estimatedWealth > 10000000 && figure.estimatedWealth <= 100000000
          );
          break;
        case "£100M - £1B":
          results = results.filter(figure => 
            figure.estimatedWealth > 100000000 && figure.estimatedWealth <= 1000000000
          );
          break;
        case "Over £1B":
          results = results.filter(figure => 
            figure.estimatedWealth > 1000000000
          );
          break;
      }
    }
    
    // Apply income range filter
    if (filters?.incomeRange) {
      switch (filters.incomeRange) {
        case "Under £100K":
          results = results.filter(figure => 
            figure.passiveIncome < 100000
          );
          break;
        case "£100K - £1M":
          results = results.filter(figure => 
            figure.passiveIncome >= 100000 && figure.passiveIncome <= 1000000
          );
          break;
        case "£1M - £10M":
          results = results.filter(figure => 
            figure.passiveIncome > 1000000 && figure.passiveIncome <= 10000000
          );
          break;
        case "Over £10M":
          results = results.filter(figure => 
            figure.passiveIncome > 10000000
          );
          break;
      }
    }
    
    // Apply data sources filter
    if (filters?.dataSources && filters.dataSources.length > 0) {
      results = results.filter(figure => 
        figure.dataSources.some(source => filters.dataSources!.includes(source))
      );
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "Passive Income (Highest)":
          results.sort((a, b) => b.passiveIncome - a.passiveIncome);
          break;
        case "Wealth Tax Impact (Highest)":
          results.sort((a, b) => b.wealthTax - a.wealthTax);
          break;
        case "Total Wealth (Highest)":
          results.sort((a, b) => b.estimatedWealth - a.estimatedWealth);
          break;
        case "Name (A-Z)":
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    } else {
      // Default sort by passive income
      results.sort((a, b) => b.passiveIncome - a.passiveIncome);
    }
    
    // Apply pagination
    if (filters?.page && filters?.limit) {
      const startIndex = (filters.page - 1) * filters.limit;
      results = results.slice(startIndex, startIndex + filters.limit);
    }
    
    return results;
  }

  async getPublicFigureById(id: number): Promise<PublicFigure | undefined> {
    return this.figures.get(id);
  }

  async getStats(): Promise<AppStats> {
    const figures = Array.from(this.figures.values());
    
    const totalProfiles = figures.length;
    const totalPassiveIncome = figures.reduce((sum, figure) => sum + figure.passiveIncome, 0);
    const potentialTaxRevenue = figures.reduce((sum, figure) => sum + figure.wealthTax, 0);
    
    return {
      totalProfiles,
      totalPassiveIncome,
      potentialTaxRevenue
    };
  }

  async createPublicFigure(figureData: InsertPublicFigure): Promise<PublicFigure> {
    const id = this.currentId++;
    
    // Calculate wealth tax based on the 1% above £2 million
    const wealthTax = calculateWealthTax(figureData.estimatedWealth);
    
    const figure: PublicFigure = {
      ...figureData,
      id,
      wealthTax
    };
    
    this.figures.set(id, figure);
    return figure;
  }

  private seedData() {
    const sampleData: InsertPublicFigure[] = [
      {
        name: "Rishi Sunak",
        title: "Prime Minister",
        category: "Politicians",
        estimatedWealth: 730000000,
        passiveIncome: 10700000,
        wealthTax: 7280000,
        dataSources: ["MPs' Register", "Forbes Lists"]
      },
      {
        name: "James Dyson",
        title: "Entrepreneur",
        category: "Business Leaders",
        estimatedWealth: 23000000000,
        passiveIncome: 487000000,
        wealthTax: 230000000,
        dataSources: ["Companies House", "Forbes Lists"]
      },
      {
        name: "Adele Adkins",
        title: "Musician",
        category: "Celebrities",
        estimatedWealth: 162000000,
        passiveIncome: 12400000,
        wealthTax: 1600000,
        dataSources: ["Companies House", "Land Registry"]
      },
      {
        name: "David Mogg",
        title: "MP for North Somerset",
        category: "Politicians",
        estimatedWealth: 9500000,
        passiveIncome: 823000,
        wealthTax: 75000,
        dataSources: ["MPs' Register", "Land Registry"]
      },
      {
        name: "Lewis Hamilton",
        title: "F1 Driver",
        category: "Sports",
        estimatedWealth: 300000000,
        passiveIncome: 9200000,
        wealthTax: 2980000,
        dataSources: ["Companies House", "Forbes Lists"]
      },
      {
        name: "Richard Branson",
        title: "Virgin Group Founder",
        category: "Business Leaders",
        estimatedWealth: 4200000000,
        passiveIncome: 123000000,
        wealthTax: 41980000,
        dataSources: ["Companies House", "Forbes Lists"]
      },
      {
        name: "Emma Watson",
        title: "Actress",
        category: "Celebrities",
        estimatedWealth: 85000000,
        passiveIncome: 3700000,
        wealthTax: 830000,
        dataSources: ["Companies House", "Land Registry"]
      },
      {
        name: "Harry Kane",
        title: "Footballer",
        category: "Sports",
        estimatedWealth: 51000000,
        passiveIncome: 1900000,
        wealthTax: 490000,
        dataSources: ["Companies House", "Forbes Lists"]
      },
      {
        name: "Margaret Hodge",
        title: "MP for Barking",
        category: "Politicians",
        estimatedWealth: 18000000,
        passiveIncome: 420000,
        wealthTax: 160000,
        dataSources: ["MPs' Register", "Land Registry"]
      },
      {
        name: "Lakshmi Mittal",
        title: "Steel Magnate",
        category: "Business Leaders",
        estimatedWealth: 12500000000,
        passiveIncome: 275000000,
        wealthTax: 124980000,
        dataSources: ["Companies House", "Forbes Lists"]
      }
    ];
    
    sampleData.forEach(figure => {
      this.createPublicFigure(figure);
    });
  }
}

export const storage = new MemStorage();
