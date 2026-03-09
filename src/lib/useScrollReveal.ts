"use client";

import { useEffect, useRef } from "react";

/**
 * Intersection-Observer hook that adds the `revealed` class once an element
 * scrolls into view. Pair with the `.reveal` CSS class from globals.css.
 *
 * Returns a ref to attach to the container element.
 *
 * @param options.threshold  fraction visible before triggering (default 0.15)
 * @param options.once       unobserve after first trigger (default true)
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; once?: boolean }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip animation if user prefers reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      el.classList.add("revealed");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          if (options?.once !== false) observer.unobserve(el);
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.once]);

  return ref;
}
