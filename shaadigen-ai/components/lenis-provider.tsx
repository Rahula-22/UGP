"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { motion, useScroll, useSpring } from "framer-motion";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <motion.div
        className="scroll-progress w-full"
        style={{ scaleX: progress }}
      />
      {children}
    </>
  );
}
