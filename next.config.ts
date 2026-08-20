import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.110.55"],
  experimental: { useTypeScriptCli: false },
};

export default nextConfig;
