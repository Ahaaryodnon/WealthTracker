"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

interface BridgeProps {
  children: React.ReactNode;
}

/**
 * Editorial bridge sentence between narrative sections.
 * Italic serif, muted, scroll-revealed.
 */
export default function Bridge({ children }: BridgeProps) {
  const ref = useScrollReveal<HTMLParagraphElement>();

  return (
    <p ref={ref} className="reveal bridge mx-auto max-w-xl px-4 py-14 italic sm:py-20">
      {children}
    </p>
  );
}
