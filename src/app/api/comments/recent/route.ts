import { NextResponse } from 'next/server';
import { FALLBACK_RECENT_COMMENTS_RESULT, type RecentCommentsResult } from '@/api/api';

function buildResponse(limit?: number): RecentCommentsResult {
  const fallback = FALLBACK_RECENT_COMMENTS_RESULT;
  const safeLimit = typeof limit === 'number' && Number.isFinite(limit) && limit > 0 ? limit : undefined;

  return {
    comments: safeLimit ? fallback.comments.slice(0, safeLimit) : fallback.comments,
    totalCount: fallback.totalCount,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : undefined;

  return NextResponse.json(buildResponse(limit), {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

