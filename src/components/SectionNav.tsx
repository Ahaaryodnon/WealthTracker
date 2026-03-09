"use client";

import { useEffect, useState, useRef } from "react";

interface NavSection {
  id: string;
  label: string;
}

const SECTIONS: NavSection[] = [
  { id: "hero", label: "The Hook" },
  { id: "scale", label: "Scale" },
  { id: "comparisons", label: "Comparisons" },
  { id: "budget", label: "Public Goods" },
  { id: "calculator", label: "Calculator" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "methodology", label: "Method" },
  { id: "share", label: "Share" },
];

/**
 * Fixed vertical section navigation dots on the right edge.
 * Highlights the current section based on IntersectionObserver.
 * Hidden on mobile for cleanliness.
 */
export default function SectionNav() {
  const [activeId, setActiveId] = useState("hero");
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    // Show nav dots only after scrolling past hero
    const heroEl = document.getElementById("hero");
    if (!heroEl) {
      setVisible(true);
      return;
    }

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    heroObserver.observe(heroEl);
    return () => heroObserver.disconnect();
  }, []);

  useEffect(() => {
    // Track which section is currently in view
    const ratioMap = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratioMap.set(entry.target.id, entry.intersectionRatio);
        });

        // Find the section with highest visibility
        let maxRatio = 0;
        let maxId = "hero";
        ratioMap.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            maxId = id;
          }
        });

        if (maxRatio > 0) {
          setActiveId(maxId);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1],
      }
    );

    // Observe all sections
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav
      className={`section-nav fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 transition-opacity duration-300 lg:flex ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-label="Page sections"
    >
      {SECTIONS.map(({ id, label }) => {
        const isActive = activeId === id;
        return (
          <button
            key={id}
            onClick={() => handleClick(id)}
            className="group relative flex items-center justify-end"
            aria-label={label}
            aria-current={isActive ? "true" : undefined}
          >
            {/* Tooltip label on hover */}
            <span className="mr-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
              {label}
            </span>
            {/* Dot */}
            <span
              className={`nav-dot block rounded-full transition-all duration-300 ${
                isActive
                  ? "h-3 w-3 bg-accent shadow-[0_0_8px_rgba(30,64,175,0.4)]"
                  : "h-2 w-2 bg-zinc-300 group-hover:bg-zinc-500"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
