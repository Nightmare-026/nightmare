import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL;

export async function GET() {
  try {
    const user = await verifyJWT();
    if (!user || !DEVELOPER_EMAIL || user.email !== DEVELOPER_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyJWT();
    if (!user || !DEVELOPER_EMAIL || user.email !== DEVELOPER_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { action, details } = await request.json();

    // Get real IP from request headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown';

    const log = await prisma.adminLog.create({
      data: {
        action,
        userEmail: user.email,
        ipAddress: ip,
        details: details || {}
      }
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
