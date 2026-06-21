"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountUpOptions {
  /** Target value to count up to */
  end: number;
  /** Duration of animation in ms (default 1500) */
  duration?: number;
  /** Only start when element is in view (default true) */
  startOnView?: boolean;
  /** IntersectionObserver threshold (default 0.3) */
  threshold?: number;
  /** Easing function (default ease-out-cubic) */
  easing?: (t: number) => number;
  /** Number of decimal places (default 0) */
  decimals?: number;
  /** Optional formatter function */
  formatter?: (value: number) => string;
}

/** Ease-out cubic: decelerating curve */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Hook that animates a number from 0 to `end` when the element scrolls into view.
 * Returns [ref, displayValue] — attach the ref to the container element.
 */
export function useCountUp<T extends HTMLElement = HTMLDivElement>({
  end,
  duration = 1500,
  startOnView = true,
  threshold = 0.3,
  easing = easeOutCubic,
  decimals = 0,
  formatter,
}: UseCountUpOptions): [React.RefObject<T | null>, string] {
  const ref = useRef<T | null>(null);
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Respect reduced motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      setValue(end);
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const current = easedProgress * end;

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(end);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [end, duration, easing]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!startOnView) {
      animate();
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          animate();
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [startOnView, threshold, animate]);

  // Reset animation when `end` changes
  useEffect(() => {
    hasAnimated.current = false;
    setValue(0);
    animate();
  }, [end, animate]);

  const displayValue = formatter
    ? formatter(value)
    : decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toString();

  return [ref, displayValue];
}
