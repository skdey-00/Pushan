import { NextRequest, NextResponse } from 'next/server';

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

    // Forward request to Flask API
    const apiUrl = process.env.FLASK_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal, speed_limit }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'API error' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Override API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
