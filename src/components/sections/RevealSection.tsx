"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms — adds a stagger effect when multiple RevealSections appear together */
  delay?: number;
  ariaLabel?: string;
  id?: string;
}

/**
 * Wrapper that scroll-reveals its children with an optional stagger delay.
 */
export default function RevealSection({
  children,
  className = "",
  delay = 0,
  ariaLabel,
  id,
}: RevealSectionProps) {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      id={id}
      aria-label={ariaLabel}
      className={`reveal ${className}`}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </section>
  );
}
