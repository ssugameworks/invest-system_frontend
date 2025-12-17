import { NextResponse, type NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export async function GET(_request: NextRequest, context: { params: Promise<{ id?: string }> }) {
  const params = await context.params;
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { message: '팀 ID가 없습니다.' },
      { status: 404 },
    );
  }

  const backendBase = API_BASE_URL.replace(/\/+$/, '');
  const upstreamUrl = `${backendBase}/api/teams/${encodeURIComponent(id)}/pitch`;

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      // 항상 최신 파일을 보기 위해 캐시 사용 안 함
      cache: 'no-store',
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      return NextResponse.json(
        { message: '피치 자료를 불러오는 데 실패했습니다.' },
        { status: upstreamResponse.status || 502 },
      );
    }

    const contentType =
      upstreamResponse.headers.get('content-type') || 'application/pdf';

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'no-store');

    // 필요 시 Content-Disposition 등 추가 가능

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error proxying team pitch:', error);
    return NextResponse.json(
      { message: '피치 자료를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}


