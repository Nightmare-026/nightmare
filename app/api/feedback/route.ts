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
        rating,
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
