import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      include: {
        category: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({ success: true, data: subjects });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
