"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Wallet, X } from "lucide-react";
import { useBudget } from "@/components/budget-context";
import { cn, formatINR } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/vendors", label: "Vendors" },
  { href: "/shopping-hub", label: "Shopping Hub" },
  { href: "/ai-studio", label: "AI Studio" },
  { href: "/media-suite", label: "Media Suite" },
  { href: "/guest-hub", label: "Guest Hub" },
];

export function Navbar() {
  const pathname = usePathname();
  const { budget } = useBudget();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="border-b border-white/70 bg-white/55 shadow-[0_8px_32px_-16px_rgba(160,120,45,0.25)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-lg font-bold tracking-tight text-stone-900"
          >
            <motion.span
              className="text-2xl"
              aria-hidden
              whileHover={{ rotate: [0, -12, 10, 0], scale: 1.15 }}
              transition={{ duration: 0.5 }}
            >
              💍
            </motion.span>
            <span className="font-serif">
              ShaadiGen <span className="text-gold-sheen">AI</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 rounded-full border border-white/80 bg-white/50 p-1 shadow-inner backdrop-blur-xl lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-300",
                    active
                      ? "text-[#5d4718]"
                      : "text-stone-500 hover:text-stone-900",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#f0dcae] to-[#e9c9a8] shadow"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={cn("relative", active && "text-[#5d4718]")}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <motion.div
              className="flex items-center gap-2 rounded-full border border-[#d9c491] bg-gradient-to-r from-[#faf3e2] to-[#f5e7cd] px-3.5 py-1.5 text-sm font-bold text-[#7a5c1e] shadow-[0_4px_16px_-6px_rgba(160,120,45,0.45)]"
              title="Your working wedding budget"
              whileHover={{ scale: 1.05, y: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Budget:</span>
              <span>{formatINR(budget)}</span>
            </motion.div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl border border-white/80 bg-white/60 p-2 text-stone-700 shadow-sm backdrop-blur transition-all hover:scale-105 lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-white/70 bg-white/70 px-4 backdrop-blur-2xl lg:hidden"
            >
              <div className="py-3">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                        pathname === link.href
                          ? "bg-gradient-to-r from-[#f0dcae] to-[#e9c9a8] text-[#5d4718]"
                          : "text-stone-600 hover:bg-white/80",
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
