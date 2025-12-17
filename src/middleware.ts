import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/main', '/detail', '/chat', '/portfolio', '/history'];
const publicRoutes = ['/login', '/'];

const SERVICE_OPEN_DATE = new Date('2025-12-19T19:00:00+09:00');

function isValidReturnUrl(url: string): boolean {
  try {
    const parsed = new URL(url, 'http://localhost');
    return parsed.pathname.startsWith('/') && !parsed.pathname.startsWith('//') && !parsed.hostname;
  } catch {
    return false;
  }
}

function isServiceOpen(): boolean {
  const now = new Date();
  return now >= SERVICE_OPEN_DATE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 개발 모드 확인 (프로덕션에서는 반드시 false)
  const isDevelopment = process.env.NODE_ENV === 'development';

  const accessToken = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!accessToken && accessToken.length >= 10;

  // 서비스 오픈 전: 로그인하지 않은 사용자는 login 페이지로 리다이렉트
  // 로그인한 사용자는 허용 (login 페이지에서 이미 학번 체크를 했음)
  if (!isDevelopment && !isServiceOpen() && !isAuthenticated && pathname !== '/login' && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isDevelopment && isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    if (isValidReturnUrl(pathname)) {
      loginUrl.searchParams.set('returnUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && isAuthenticated && isServiceOpen()) {
    return NextResponse.redirect(new URL('/main', request.url));
  }

  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  const posthogDomains = [
    'https://us.i.posthog.com',
    'https://eu.i.posthog.com',
    'https://us-assets.i.posthog.com',
    'https://eu-assets.i.posthog.com',
    'https://app.posthog.com',
    'wss://us.i.posthog.com',
    'wss://eu.i.posthog.com',
  ];

  const backendDomains = [
    'https://*.up.railway.app',
    'https://*.railway.app',
    'https://invest-systembackend-production.up.railway.app',
  ];

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiBaseUrl) {
    try {
      const url = new URL(apiBaseUrl);
      if (!backendDomains.includes(apiBaseUrl)) {
        backendDomains.push(apiBaseUrl);
      }
    } catch {
    }
  }

  const connectSrc = isDevelopment
    ? `'self' http://localhost:* ${posthogDomains.join(' ')} ${backendDomains.join(' ')} ws: wss:`
    : `'self' ${posthogDomains.join(' ')} ${backendDomains.join(' ')}`;

  const scriptSrc = `'self' 'unsafe-eval' 'unsafe-inline' ${posthogDomains.filter(d => d.startsWith('https://')).join(' ')}`;
  const scriptSrcElem = `'self' 'unsafe-inline' ${posthogDomains.filter(d => d.startsWith('https://')).join(' ')}`;

  // PDF.js worker를 위한 worker-src 추가
  const workerSrc = `'self' blob:`;
  
  response.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src ${scriptSrc}; script-src-elem ${scriptSrcElem}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src ${connectSrc}; frame-src 'self'; worker-src ${workerSrc}`
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

