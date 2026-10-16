import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Lock this app as Turbopack root so a stray ~/package-lock.json does not become the workspace root. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  turbopack: {
    root: projectRoot,
  },
  // Serve the standalone, static design-system reference (public/DS) at the bare /DS entry point.
  async rewrites() {
    return [
      { source: "/DS", destination: "/DS/index.html" },
      { source: "/DS/", destination: "/DS/index.html" },
      { source: "/DS/Audits", destination: "/DS/Audits/index.html" },
      { source: "/DS/Audits/", destination: "/DS/Audits/index.html" },
      // The sitemap lives at /sitemap, outside the design-system reference.
      { source: "/sitemap", destination: "/sitemap/index.html" },
      { source: "/sitemap/", destination: "/sitemap/index.html" },
      // NHS layout & typography audit (public/nhs-audit). Reachable by URL only — not linked from any navigation.
      { source: "/nhs-audit", destination: "/nhs-audit/index.html" },
      { source: "/nhs-audit/", destination: "/nhs-audit/index.html" },
    ];
  },
  async redirects() {
    return [
      { source: "/DS/Report-v:slug", destination: "/DS/Audits/Report-v:slug/index.html", permanent: true },
      { source: "/DS/Report-v:slug/", destination: "/DS/Audits/Report-v:slug/index.html", permanent: true },
      { source: "/DS/Report-v:slug/index.html", destination: "/DS/Audits/Report-v:slug/index.html", permanent: true },
      // Supplier onboarding now lives inside the Supplier portal.
      { source: "/supplier-onboard", destination: "/supplier-portal", permanent: false },
      { source: "/supplier-onboard/:path*", destination: "/supplier-portal", permanent: false },
    ];
  },
};

export default nextConfig;
