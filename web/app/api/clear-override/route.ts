import { NextRequest, NextResponse } from 'next/server';
import { clearOverride as apiClearOverride } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    const result = await apiClearOverride();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Clear override API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
