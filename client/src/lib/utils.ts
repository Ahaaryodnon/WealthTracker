import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, abbreviate: boolean = false): string {
  if (abbreviate) {
    if (amount >= 1e12) {
      return `£${(amount / 1e12).toFixed(1)}T`;
    }
    if (amount >= 1e9) {
      return `£${(amount / 1e9).toFixed(1)}B`;
    }
    if (amount >= 1e6) {
      return `£${(amount / 1e6).toFixed(1)}M`;
    }
    if (amount >= 1e3) {
      return `£${(amount / 1e3).toFixed(1)}K`;
    }
    return `£${amount}`;
  }

  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateWealthTax(wealth: number, threshold: number = 2000000, rate: number = 0.01): number {
  if (wealth <= threshold) {
    return 0;
  }
  
  return (wealth - threshold) * rate;
}
