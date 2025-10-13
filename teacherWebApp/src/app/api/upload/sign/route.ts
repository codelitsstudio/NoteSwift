import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const folder = body.folder || '';

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: true, message: 'Cloudinary not configured' }, { status: 500 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign: Record<string, any> = { timestamp };
    if (folder) paramsToSign.folder = folder;

    const queryString = Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join('&');

    const crypto = require('crypto');
    const signature = crypto.createHash('sha1').update(queryString + apiSecret).digest('hex');

    return NextResponse.json({
      error: false,
      data: {
        cloudName,
        apiKey,
        timestamp,
        signature,
        folder,
      }
    });

  } catch (err: any) {
    console.error('Sign endpoint error:', err);
    return NextResponse.json({ error: true, message: err.message || 'Failed to generate signature' }, { status: 500 });
  }
}
