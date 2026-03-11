import type { LocaleId, LocaleConfig } from "./types";
import { enUS } from "./packs/en-US";
import { enGB } from "./packs/en-GB";

export type { LocaleId, LocaleConfig, ComparisonItem, BudgetItem, SalaryPreset } from "./types";

export const DEFAULT_LOCALE_ID: LocaleId = "en-US";
export const SUPPORTED_LOCALES: LocaleId[] = ["en-US", "en-GB"];

const packs: Record<LocaleId, LocaleConfig> = {
  "en-US": enUS,
  "en-GB": enGB,
};

export function getLocaleConfig(localeId: LocaleId): LocaleConfig {
  const config = packs[localeId];
  if (!config) return packs[DEFAULT_LOCALE_ID];
  return config;
}

export function isSupportedLocale(tag: string): LocaleId | null {
  const normalized = tag.trim().replace(/_/g, "-");
  if (SUPPORTED_LOCALES.includes(normalized as LocaleId)) return normalized as LocaleId;
  const lang = normalized.split("-")[0];
  if (lang === "en") {
    const region = normalized.split("-")[1]?.toUpperCase();
    if (region === "GB" || region === "UK") return "en-GB";
    return "en-US";
  }
  return null;
}

export function getMedianSalaryFromLocale(locale: LocaleConfig): number {
  const c = locale.comparisons.find((x) => x.id === "medianSalary");
  return c?.value ?? 0;
}
