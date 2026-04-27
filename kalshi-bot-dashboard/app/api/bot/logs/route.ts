import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOT_URL = process.env.BOT_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const res = await fetch(`${BOT_URL}/logs`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_SHARED_SECRET}`,
      },
      next: { revalidate: 0 }, // Do not cache decision logs
    });

    if (!res.ok) {
      throw new Error('Bot API unreachable');
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Logs fetch error:', error);
    return NextResponse.json(
      { error: 'Could not connect to bot engine' },
      { status: 503 }
    );
  }
}
