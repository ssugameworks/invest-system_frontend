import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // SVG를 React 컴포넌트로 불러오기 위한 SVGR 설정
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

export default nextConfig;
