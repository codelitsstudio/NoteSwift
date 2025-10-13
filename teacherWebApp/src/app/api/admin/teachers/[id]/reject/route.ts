import { NextRequest } from 'next/server';
import { Admin } from '@/apiHandling/controllers/admin';

export async function POST(req: NextRequest) {
  return Admin.rejectTeacher(req);
}

export async function OPTIONS() {
  const origin = process.env.ADMIN_ALLOWED_ORIGIN || '*';
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });
}
