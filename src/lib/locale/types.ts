/**
 * Locale configuration for formatting and market-specific benchmark data.
 * Each locale has its own currency, number/date formatting, and comparison data.
 */

export type LocaleId = "en-US" | "en-GB";

export interface ComparisonItem {
  id: "medianSalary" | "averageHomePrice" | "teacherSalary";
  label: string;
  value: number;
  source: string;
  effortLabel: string;
}

export interface BudgetItem {
  id: string;
  label: string;
  annualCost: number;
  icon: string;
  description: string;
  source: string;
}

export interface SalaryPreset {
  label: string;
  value: number;
  note: string;
}

export interface LocaleConfig {
  id: LocaleId;
  lang: string;
  currency: string;
  /** Symbol for currency input (e.g. $, £). */
  currencySymbol: string;
  /** Multiply USD amounts by this to get locale currency (e.g. 1 for USD, ~0.79 for GBP). */
  exchangeRateFromUsd: number;
  numberLocale: string;
  dateLocale: string;
  comparisons: readonly ComparisonItem[];
  budgetItems: readonly BudgetItem[];
  salaryPresets: readonly SalaryPreset[];
}
