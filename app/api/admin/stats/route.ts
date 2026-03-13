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

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      popularProducts,
      totalWishlists
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true }
      }),
      prisma.order.findMany({
        where: { status: 'paid' },
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.product.findMany({
        orderBy: { downloadsCount: 'desc' },
        take: 5
      }),
      prisma.wishlist.count()
    ]);

    // Orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.amount) || 0,
        totalWishlists,
        ordersByStatus,
        recentOrders,
        popularProducts
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
