import { NextResponse } from 'next/server';

const BOT_URL = process.env.BOT_URL || 'http://localhost:8080';

export async function GET() {
  try {
    // Proxy to the Go bot's health endpoint with secret
    const res = await fetch(`${BOT_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_SHARED_SECRET}`,
      },
      next: { revalidate: 1 }, // Cache for 1 second
    });

    if (!res.ok) {
      if (res.status === 401) {
         throw new Error('Bot API: Unauthorized (Secret mismatch)');
      }
      throw new Error('Bot API unreachable');
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Could not connect to bot engine' },
      { status: 503 }
    );
  }
}
