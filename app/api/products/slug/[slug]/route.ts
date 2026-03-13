import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        subject: true,
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true, quickReactions: true, wishlists: true }
        }
      }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
