import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/positions',
        destination: '/mgmt',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
