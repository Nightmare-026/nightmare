import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const type = searchParams.get('type');
    const isFree = searchParams.get('isFree');
    const search = searchParams.get('search');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(subject && { subject: { slug: subject } }),
      ...(type && { type: type as any }),
      ...(isFree !== null && { isFree: isFree === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          subject: true,
          _count: {
            select: { reviews: true, quickReactions: true }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
