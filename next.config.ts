import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['via.placeholder.com', 'img.khan.co.kr', 'cdn.spotvnews.co.kr'],
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      // Convert all other svg imports to React components
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // Exclude if 'url' query param is used
        use: ['@svgr/webpack'],
      }
    );

    // Modify the file loader rule to ignore SVG files
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  /* config options here */
};

export default nextConfig;
