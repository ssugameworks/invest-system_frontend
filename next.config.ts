import type { NextConfig } from "next";

type SvgCapableRule = {
  test?: RegExp;
  issuer?: unknown;
  resourceQuery?: {
    not?: RegExp[];
  };
  [key: string]: unknown;
};

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3845',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'supabase.io',
        pathname: '/storage/**',
      },
    ],
  },
  async headers() {
    const posthogDomains = [
      'https://us.i.posthog.com',
      'https://eu.i.posthog.com',
      'https://*.i.posthog.com',
      'https://us-assets.i.posthog.com',
      'https://eu-assets.i.posthog.com',
      'https://*.posthog.com',
      'https://app.posthog.com',
      'wss://us.i.posthog.com',
      'wss://eu.i.posthog.com',
      'wss://*.i.posthog.com',
    ];
    
    const backendDomains = new Set<string>();
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (apiBaseUrl) {
      try {
        const url = new URL(apiBaseUrl);
        backendDomains.add(apiBaseUrl);
      } catch {
        backendDomains.add(apiBaseUrl);
      }
    }
    
    backendDomains.add('https://*.up.railway.app');
    backendDomains.add('https://*.railway.app');
    backendDomains.add('https://invest-systembackend-production.up.railway.app');
    
    if (process.env.NODE_ENV !== 'production') {
      backendDomains.add('http://localhost:3001');
      backendDomains.add('http://localhost:*');
    }
    
    const backendDomainsArray = Array.from(backendDomains);
    
    const scriptSrc = `'self' 'unsafe-eval' 'unsafe-inline' ${posthogDomains.filter(d => d.startsWith('https://')).join(' ')}`;
    const scriptSrcElem = `'self' 'unsafe-inline' ${posthogDomains.filter(d => d.startsWith('https://')).join(' ')}`;
    const connectSrc = `'self' ${posthogDomains.join(' ')} ${backendDomainsArray.join(' ')}`;
    
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              `script-src ${scriptSrc}`,
              `script-src-elem ${scriptSrcElem}`,
              `connect-src ${connectSrc}`,
              // 외부 슬라이드/PDF 임베딩을 위한 frame-src 허용 도메인
              `frame-src 'self' https://*.supabase.co https://mieoqhpegvdjsvhtwnlb.supabase.co ${backendDomainsArray.join(' ')}`,
              // PDF.js worker를 위한 worker-src
              "worker-src 'self' blob:",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline'",
              "font-src 'self' data:",
            ].join('; '),
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  webpack(config) {
    const fileLoaderRule = config.module.rules.find(
      (rule: unknown): rule is SvgCapableRule =>
        typeof rule === 'object' &&
        rule !== null &&
        'test' in rule &&
        rule.test instanceof RegExp &&
        rule.test.test('.svg'),
    );

    if (!fileLoaderRule) {
      return config;
    }

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] },
        use: ['@svgr/webpack'],
      },
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default nextConfig;
