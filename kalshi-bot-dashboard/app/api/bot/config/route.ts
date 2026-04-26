import { NextResponse } from 'next/server';

const BOT_URL = process.env.BOT_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const res = await fetch(`${BOT_URL}/config`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_SHARED_SECRET}`,
      },
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const res = await fetch(`${BOT_URL}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_SHARED_SECRET}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Bot update failed' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Bot connection failed' }, { status: 503 });
  }
}
