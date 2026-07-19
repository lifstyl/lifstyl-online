"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient animated waves for the hero — a vertical adaptation of the flowing
 * lines on limitlesslifstyl.com (there they run horizontally). Here each line
 * runs top-to-bottom and waves left/right. Mostly cool navy/white threads with
 * occasional gold ones. Pauses when off-screen and honors reduced-motion.
 */
export function HeroWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;

    const LINE_COUNT = 26;
    type Line = {
      baseX: number;
      amp: number;
      len: number;
      speed: number;
      phase: number;
      breathe: number;
      hue: number;
      weight: number;
    };
    let lines: Line[] = [];

    function buildLines() {
      lines = [];
      for (let i = 0; i < LINE_COUNT; i++) {
        const t = i / (LINE_COUNT - 1);
        lines.push({
          baseX: t, // 0..1 horizontal position across the hero
          amp: 26 + Math.random() * 46, // horizontal wave amplitude (px)
          len: 0.7 + Math.random() * 0.9, // vertical wavelength factor
          speed: 0.1 + Math.random() * 0.22, // vertical drift speed
          phase: Math.random() * Math.PI * 2,
          breathe: 0.5 + Math.random() * 1.1,
          hue: Math.random(), // 0 = navy/white, 1 = gold
          weight: 0.6 + Math.random() * 1.0,
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now: number) {
      const time = now * 0.001;
      ctx!.clearRect(0, 0, width, height);
      ctx!.lineCap = "round";

      for (const ln of lines) {
        const breath = Math.sin(time * ln.breathe + ln.phase) * 0.5 + 0.5;
        const midX = ln.baseX * width + Math.sin(time * 0.35 + ln.phase) * 18;
        const amp = ln.amp * (0.65 + breath * 0.5);

        ctx!.beginPath();
        const step = 14;
        for (let y = -20; y <= height + 20; y += step) {
          const ny = y / height;
          const x =
            midX +
            Math.sin(ny * Math.PI * 2 * ln.len + time * ln.speed * 3 + ln.phase) *
              amp +
            Math.sin(ny * Math.PI * 4 * ln.len - time * ln.speed * 1.6 + ln.phase) *
              amp *
              0.35;
          if (y === -20) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }

        const goldish = ln.hue > 0.72;
        const alpha = (goldish ? 0.16 : 0.1) + breath * 0.1;
        ctx!.strokeStyle = goldish
          ? `rgba(191,148,35,${alpha + 0.06})`
          : `rgba(180,200,235,${alpha})`;
        ctx!.lineWidth = ln.weight;
        ctx!.stroke();
      }
    }

    function loop(now: number) {
      draw(now);
      rafId = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(rafId);
      resize();
      buildLines();
      if (reduceMotion) draw(0);
      else rafId = requestAnimationFrame(loop);
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(start, 150);
    };
    window.addEventListener("resize", onResize);

    // Pause when the hero scrolls out of view.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (reduceMotion) return;
          if (entry.isIntersecting) {
            if (!rafId) rafId = requestAnimationFrame(loop);
          } else {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
        });
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    start();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-[5] h-full w-full"
    />
  );
}
