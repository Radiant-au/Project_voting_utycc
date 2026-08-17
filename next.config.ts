import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.102.143"],
  experimental: { useTypeScriptCli: false }
};

export default nextConfig;
