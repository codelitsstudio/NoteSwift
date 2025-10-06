import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const hash = Array.from(text).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const score = (hash % 51) + 50; // 50-100
    return NextResponse.json({ score, matchedSources: [] });
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
