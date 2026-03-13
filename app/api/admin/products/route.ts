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
