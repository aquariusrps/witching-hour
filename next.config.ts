import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/i/:token.:ext(png|jpg|jpeg|gif|webp)',
        destination: '/i/:token',
      },
    ]
  },
};

export default nextConfig;
