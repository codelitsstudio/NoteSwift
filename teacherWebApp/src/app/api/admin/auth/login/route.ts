import { NextRequest } from 'next/server';
import { AdminAuth } from '@/apiHandling/controllers/adminAuth';

export async function POST(req: NextRequest) {
  return AdminAuth.login(req);
}
