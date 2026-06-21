"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  hue: number;
}

interface EarningsParticlesProps {
  /** Number of concurrent particles (default 20) */
  count?: number;
  /** Enable/disable the effect */
  active?: boolean;
}

/**
 * Ambient floating particles rendered on a canvas.
 * Creates a subtle "wealth flowing" visual effect behind the accumulator.
 * Respects prefers-reduced-motion.
 */
export default function EarningsParticles({
  count = 20,
  active = true,
}: EarningsParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const nextIdRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reducedMotion || !active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function spawnParticle(): Particle {
      const rect = canvas!.parentElement?.getBoundingClientRect();
      const w = rect?.width ?? 400;
      const h = rect?.height ?? 400;

      return {
        id: nextIdRef.current++,
        x: Math.random() * w,
        y: h * 0.3 + Math.random() * h * 0.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.6,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0,
        life: 0,
        maxLife: 100 + Math.random() * 150,
        hue: 200 + Math.random() * 40, // blue range (200-240)
      };
    }

    // Initial spawn
    particlesRef.current = Array.from({ length: count }, spawnParticle);

    function tick() {
      if (!canvas || !ctx) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect?.width ?? 400;
      const h = rect?.height ?? 400;

      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        // Fade in first 20%, fade out last 30%
        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.2) {
          p.opacity = lifeRatio / 0.2;
        } else if (lifeRatio > 0.7) {
          p.opacity = (1 - lifeRatio) / 0.3;
        } else {
          p.opacity = 1;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity * 0.35})`;
        ctx.fill();

        // Optional glow
        if (p.size > 2.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity * 0.08})`;
          ctx.fill();
        }

        // Respawn when dead
        if (p.life >= p.maxLife) {
          particles[i] = spawnParticle();
        }
      }

      // Maintain particle count
      while (particles.length < count) {
        particles.push(spawnParticle());
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [count, active, reducedMotion]);

  if (reducedMotion || !active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}
