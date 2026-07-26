"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, input, select, textarea, label, [role='button']";

export function LuxCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.body.classList.add("lux-cursor");
    const dot = dotRef.current!;
    const glow = glowRef.current!;
    let x = -100;
    let y = -100;
    let gx = -100;
    let gy = -100;
    let rafId: number;
    let lastTrail = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;

      const now = performance.now();
      if (now - lastTrail > 55) {
        lastTrail = now;
        const t = document.createElement("div");
        t.className = "cursor-trail";
        t.style.transform = `translate(${x - 2}px, ${y - 2}px)`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 720);
      }

      const target = (e.target as HTMLElement)?.closest?.(INTERACTIVE);
      document.body.dataset.cursor = target ? "hover" : "";
    };

    const tick = () => {
      gx += (x - gx) * 0.16;
      gy += (y - gy) * 0.16;
      dot.style.transform = `translate(${x - 4}px, ${y - 4}px)`;
      const half = glow.offsetWidth / 2;
      glow.style.transform = `translate(${gx - half}px, ${gy - half}px)`;
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.body.classList.remove("lux-cursor");
      delete document.body.dataset.cursor;
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow hidden md:block" />
      <div ref={dotRef} className="cursor-dot hidden md:block" />
    </>
  );
}
