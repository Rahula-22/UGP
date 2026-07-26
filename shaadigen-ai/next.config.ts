import type { NextConfig } from "next";

// STATIC_EXPORT enables a fully static build for GitHub Pages hosting
// (with the repo-name base path). Vercel and local dev are unaffected.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(staticExport && {
    output: "export" as const,
    basePath: process.env.PAGES_BASE_PATH ?? "",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
