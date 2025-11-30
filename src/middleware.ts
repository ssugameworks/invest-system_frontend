import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔒 인증이 필요한 페이지 경로
const protectedRoutes = ['/main', '/detail', '/chat', '/portfolio', '/history'];

// 🔒 인증이 필요 없는 페이지 경로
const publicRoutes = ['/login', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 액세스 토큰 확인
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!accessToken;

  // 보호된 경로에 인증 없이 접근 시도
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 로그인 상태에서 로그인 페이지 접근 시 메인으로 리다이렉트
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/main', request.url));
  }

  // 🔒 보안 헤더 추가
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

  return response;
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청 경로에 적용:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

