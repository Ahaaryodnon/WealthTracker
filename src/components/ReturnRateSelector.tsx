"use client";

const RATES = [
  { label: "3%", value: 0.03 },
  { label: "5%", value: 0.05 },
  { label: "7%", value: 0.07 },
] as const;

interface ReturnRateSelectorProps {
  value: number;
  onChange: (rate: number) => void;
  /** Optional extra CSS classes on the outer wrapper */
  className?: string;
}

/**
 * Pill toggle for switching between 3 / 5 / 7 % return rate assumptions.
 * Self-contained, no external state beyond the value + onChange callback.
 */
export default function ReturnRateSelector({
  value,
  onChange,
  className = "",
}: ReturnRateSelectorProps) {
  return (
    <div className={`rate-pill ${className}`} role="radiogroup" aria-label="Return rate assumption">
      {RATES.map((r) => (
        <button
          key={r.value}
          type="button"
          role="radio"
          aria-checked={value === r.value}
          data-active={value === r.value ? "true" : undefined}
          onClick={() => onChange(r.value)}
          aria-label={`${r.label} annual return`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
