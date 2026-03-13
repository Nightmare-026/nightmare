import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

const DEVELOPER_EMAIL = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL || 'ganeshsharna7114@gmail.com';

export async function GET() {
  try {
    const user = await verifyJWT();
    if (!user || user.email !== DEVELOPER_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
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
    if (!user || user.email !== DEVELOPER_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { action, details } = await request.json();

    const log = await prisma.adminLog.create({
      data: {
        action,
        userEmail: user.email,
        ipAddress: 'serverless-func',
        details: details || {}
      }
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
