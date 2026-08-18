import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.162.219.80"],
  experimental: { useTypeScriptCli: false }
};

export default nextConfig;
