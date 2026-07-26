import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { BudgetProvider } from "@/components/budget-context";
import { ToastProvider } from "@/components/toast";
import { LenisProvider } from "@/components/lenis-provider";
import { LuxCursor } from "@/components/cursor";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShaadiGen AI — Reimagining Indian Weddings",
  description:
    "A Generative AI-powered platform for planning Indian weddings: vendor matchmaking, shopping discovery, AI visual studio, custom songs, invites and guest experiences.",
};

function LivingBackground() {
  return (
    <div className="lux-bg" aria-hidden>
      <div
        className="bokeh h-72 w-72"
        style={{ top: "8%", left: "6%", background: "#f3ddb2", animationDelay: "0s" }}
      />
      <div
        className="bokeh h-96 w-96"
        style={{ top: "42%", right: "-6%", background: "#eec9b4", animationDelay: "-7s" }}
      />
      <div
        className="bokeh h-64 w-64"
        style={{ bottom: "4%", left: "22%", background: "#f6e7c8", animationDelay: "-13s" }}
      />
      <div
        className="bokeh h-40 w-40"
        style={{ top: "18%", right: "28%", background: "#f0d3c2", animationDelay: "-4s" }}
      />
      <div className="light-ray" style={{ left: "16%" }} />
      <div className="light-ray" style={{ left: "58%", animationDelay: "-8s" }} />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <LivingBackground />
        <LuxCursor />
        <BudgetProvider>
          <ToastProvider>
            <LenisProvider>
              <Navbar />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <footer className="mt-4 border-t border-[#e9dcc2]/70 bg-white/40 py-10 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
                  <p className="font-serif text-lg text-[#6b5326]">
                    💍 ShaadiGen <span className="text-gold-sheen">AI</span>
                  </p>
                  <p className="mt-2 text-xs tracking-wide text-stone-500">
                    Reimagining the Indian Wedding Industry with Multimodal
                    Generative AI · Prototype build, all data is simulated
                  </p>
                </div>
              </footer>
            </LenisProvider>
          </ToastProvider>
        </BudgetProvider>
      </body>
    </html>
  );
}
