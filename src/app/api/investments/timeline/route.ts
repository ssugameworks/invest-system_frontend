import { NextResponse } from 'next/server';
import { FALLBACK_TREND_POINTS } from '@/api/api';

export async function GET() {
  return NextResponse.json(
    {
      data: FALLBACK_TREND_POINTS,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

