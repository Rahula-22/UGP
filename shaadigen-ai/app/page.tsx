"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Gem,
  Handshake,
  Heart,
  Music,
  Palette,
  ShoppingBag,
  Sparkles,
  Users,
} from "lucide-react";
import { BUDGET_ALLOCATION } from "@/lib/mock-data";
import { useBudget } from "@/components/budget-context";
import { formatINR } from "@/lib/utils";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { Magnetic } from "@/components/magnetic";
import { Petals, Reveal, Stagger, staggerItem, Tilt } from "@/components/motion";

const FEATURES = [
  {
    href: "/vendors",
    emoji: "🤝",
    icon: Handshake,
    title: "Budget Vendor Matchmaker",
    desc: "Slide your budget and let AI shortlist verified photographers, caterers, decorators & MUAs — with pre-negotiated deals.",
    glow: "group-hover:shadow-[0_30px_70px_-18px_rgba(201,162,75,0.45)]",
  },
  {
    href: "/shopping-hub",
    emoji: "🛍️",
    icon: ShoppingBag,
    title: "Local Shopping Discovery",
    desc: "Curated Chandni Chowk lehenga guide — Asiana Couture, Om Prakash Jawahar Lal & hidden gems, filtered by your budget.",
    glow: "group-hover:shadow-[0_30px_70px_-18px_rgba(216,164,143,0.5)]",
  },
  {
    href: "/ai-studio",
    emoji: "🎨",
    icon: Palette,
    title: "AI Visual Studio",
    desc: "Virtual outfit try-on with lighting simulation, plus a 4K pre-wedding photoshoot generator in dream destinations.",
    glow: "group-hover:shadow-[0_30px_70px_-18px_rgba(201,162,75,0.45)]",
  },
  {
    href: "/media-suite",
    emoji: "🎵",
    icon: Music,
    title: "AI Media Suite",
    desc: "Generate a custom love song from your story and design animated invitation cards — export straight to WhatsApp.",
    glow: "group-hover:shadow-[0_30px_70px_-18px_rgba(216,164,143,0.5)]",
  },
  {
    href: "/guest-hub",
    emoji: "💒",
    icon: Users,
    title: '"Join My Wedding" Guest Portal',
    desc: "A shareable guest hub with event schedules, multicultural ritual explainers in 4 languages, and one-tap RSVP.",
    glow: "group-hover:shadow-[0_30px_70px_-18px_rgba(201,162,75,0.45)]",
  },
];

export default function DashboardPage() {
  const { budget, setBudget } = useBudget();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const heroBlur = useTransform(
    scrollYProgress,
    [0, 1],
    ["blur(0px)", "blur(8px)"],
  );

  return (
    <div className="pb-20">
      {/* ── Cinematic hero ─────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex min-h-[92vh] items-center justify-center overflow-hidden"
      >
        <HeroCanvas />
        <Petals count={12} />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale, filter: heroBlur }}
          className="relative z-10 mx-auto max-w-4xl px-4 text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="eyebrow inline-flex items-center gap-2 rounded-full border border-[#dcc48f]/70 bg-white/60 px-5 py-2 text-[#8a6a2f] shadow-sm backdrop-blur-xl"
          >
            <Sparkles className="h-3.5 w-3.5" /> Multimodal GenAI · Luxury
            Weddings
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 44, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            className="font-serif mt-8 text-5xl font-bold leading-[1.06] tracking-tight text-stone-900 sm:text-7xl"
          >
            Reimagining
            <br />
            Indian Weddings
            <br />
            <span className="text-gold-sheen italic">with Multimodal AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-stone-500 sm:text-lg"
          >
            From budget-matched vendors and Chandni Chowk shopping trails to
            AI-generated pre-wedding shoots, custom love songs and multilingual
            guest experiences — plan your entire shaadi in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.9 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Magnetic>
              <Link
                href="/vendors"
                className="btn-gold group inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold"
              >
                Start Planning
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/ai-studio"
                className="btn-ghost inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold"
              >
                <Heart className="h-4 w-4 text-[#d8a48f]" /> Try the AI Studio
              </Link>
            </Magnetic>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 1.2 }}
            className="mt-16 flex items-center justify-center gap-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-400"
          >
            <span className="flex items-center gap-1.5">
              <Gem className="h-3.5 w-3.5 text-[#c9a24b]" /> 5 AI Modules
            </span>
            <span className="hidden sm:block">·</span>
            <span className="hidden sm:flex items-center gap-1.5">
              Real-time 3D Experience
            </span>
            <span>·</span>
            <span>Made for India</span>
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="flex h-10 w-6 items-start justify-center rounded-full border border-[#c9a24b]/50 bg-white/40 p-1.5 backdrop-blur"
          >
            <div className="h-2 w-1 rounded-full bg-[#c9a24b]" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Feature cards ─────────────────────────── */}
      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6">
        <Reveal>
          <p className="eyebrow text-[#a8823d]">The Collection</p>
          <h2 className="font-serif mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Five AI modules. <span className="text-gold-sheen italic">One dream wedding.</span>
          </h2>
          <p className="mt-2 max-w-xl text-stone-500">
            Jump into any module — everything stays in sync with your budget.
          </p>
        </Reveal>

        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.1}>
          {FEATURES.map((f) => (
            <motion.div key={f.href} variants={staggerItem}>
              <Tilt className="h-full">
                <Link
                  href={f.href}
                  className={`glass-card glass-card-hover glass-reflection group flex h-full flex-col rounded-3xl p-7 transition-shadow duration-500 ${f.glow}`}
                >
                  <div className="flex items-center justify-between">
                    <motion.span
                      className="text-4xl drop-shadow-sm"
                      whileHover={{ scale: 1.25, rotate: -8 }}
                      transition={{ type: "spring", stiffness: 260, damping: 14 }}
                    >
                      {f.emoji}
                    </motion.span>
                    <span className="rounded-2xl border border-[#e5d3a8] bg-gradient-to-br from-white to-[#f7ecd6] p-2.5 shadow-sm">
                      <f.icon className="h-5 w-5 text-[#a8823d]" />
                    </span>
                  </div>
                  <h3 className="font-serif mt-5 text-xl font-bold text-stone-900">
                    {f.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-stone-500">
                    {f.desc}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#8a6a2f]">
                    Open module
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </span>
                </Link>
              </Tilt>
            </motion.div>
          ))}

          {/* Budget treasure widget */}
          <motion.div variants={staggerItem}>
            <Tilt className="h-full" max={4}>
              <div className="glass-card glass-card-hover relative h-full overflow-hidden rounded-3xl p-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    Live Budget
                  </h3>
                  <div className="relative">
                    <motion.span
                      className="relative z-10 inline-block text-4xl"
                      animate={{ rotate: [0, -6, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    >
                      🪙
                    </motion.span>
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="coin absolute -top-1 left-1/2 text-sm"
                        style={{
                          animationDelay: `${i * 0.55}s`,
                          marginLeft: `${(i - 1) * 10}px`,
                        }}
                      >
                        🪙
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-1">
                  <span className="font-serif text-3xl font-bold text-gold-sheen">
                    {formatINR(budget)}
                  </span>
                </div>
                <input
                  type="range"
                  min={500000}
                  max={10000000}
                  step={100000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="gold-slider mt-4 w-full"
                  aria-label="Total wedding budget"
                />
                <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  <span>₹5L</span>
                  <span>₹1 Cr</span>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {BUDGET_ALLOCATION.map((row, i) => (
                    <li key={row.label}>
                      <div className="flex items-center justify-between text-xs font-medium text-stone-600">
                        <span>
                          {row.emoji} {row.label}
                        </span>
                        <span className="font-bold text-stone-800">
                          {formatINR((budget * row.pct) / 100)}
                          <span className="ml-1 font-normal text-stone-400">
                            {row.pct}%
                          </span>
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#efe4cb]">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#c9a24b] via-[#e0bd77] to-[#d8a48f]"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${row.pct * 3}%` }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1,
                            delay: 0.15 + i * 0.08,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Tilt>
          </motion.div>
        </Stagger>
      </section>

      {/* ── Closing statement ─────────────────────── */}
      <section className="mx-auto mt-24 max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="font-serif text-2xl italic leading-relaxed text-stone-600 sm:text-3xl">
            &ldquo;Where a thousand-year-old celebration meets
            <span className="text-gold-sheen"> tomorrow&apos;s intelligence</span>.&rdquo;
          </p>
          <div className="mx-auto mt-6 h-px w-24 bg-gradient-to-r from-transparent via-[#c9a24b] to-transparent" />
        </Reveal>
      </section>
    </div>
  );
}
