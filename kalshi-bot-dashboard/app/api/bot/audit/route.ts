import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BOT_URL = process.env.BOT_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const res = await fetch(`${BOT_URL}/audit`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_SHARED_SECRET}`,
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Bot API unreachable' }, { status: 503 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Bot connection failed' }, { status: 503 });
  }
}
