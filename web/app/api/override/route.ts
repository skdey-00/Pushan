import { NextRequest, NextResponse } from 'next/server';
import { setOverride as apiSetOverride } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signal, speed_limit } = body;

    // Validate inputs
    if (!signal || !speed_limit) {
      return NextResponse.json(
        { error: 'Missing required fields: signal, speed_limit' },
        { status: 400 }
      );
    }

    if (!['RED', 'YELLOW', 'GREEN'].includes(signal)) {
      return NextResponse.json(
        { error: 'Invalid signal. Must be RED, YELLOW, or GREEN' },
        { status: 400 }
      );
    }

    if (![20, 30, 40, 60, 80].includes(speed_limit)) {
      return NextResponse.json(
        { error: 'Invalid speed_limit. Must be 20, 30, 40, 60, or 80' },
        { status: 400 }
      );
    }

    const result = await apiSetOverride(signal, speed_limit);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Override API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
