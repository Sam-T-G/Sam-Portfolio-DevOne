import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // Empty turbopack config to silence warning
  // React DevTools semver error is a known issue with React 19 and browser extensions
  // It doesn't affect functionality - the error is purely cosmetic from the DevTools extension
  turbopack: {},
};

export default nextConfig;
