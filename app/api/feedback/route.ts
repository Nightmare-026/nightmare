import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import { verifyJWT } from '@/lib/auth';

const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL;

export async function GET() {
  try {
    const user = await verifyJWT();
    if (!user || !DEVELOPER_EMAIL || user.email !== DEVELOPER_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const feedback = await prisma.siteFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyJWT();
    const { rating, message, pageUrl, sectionName, email } = await request.json();

    const feedback = await prisma.siteFeedback.create({
      data: {
        rating: Number(rating),
        message,
        pageUrl: pageUrl || '/',
        sectionName: sectionName || 'general',
        email: email || user?.email,
        userId: user?.id
      }
    });

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
