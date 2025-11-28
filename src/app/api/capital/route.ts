import { NextResponse } from 'next/server';
import { FALLBACK_CAPITAL_AMOUNT } from '@/api/api';

export async function GET() {
  return NextResponse.json(
    {
      capital: FALLBACK_CAPITAL_AMOUNT,
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}

