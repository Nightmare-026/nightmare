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

    const products = await prisma.product.findMany({
      include: {
        category: true,
        subject: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
