import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await verifyJWT();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!orderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ success: false, error: 'Missing payment details' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: orderId },
      include: { product: true }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Verify ownership
    if (order.userId !== user.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // ALWAYS verify signature — removed NODE_ENV condition
    const body = orderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'failed' }
      });
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'paid',
        razorpayPaymentId,
        razorpaySignature
      }
    });

    // Increment product download count
    await prisma.product.update({
      where: { id: order.productId },
      data: { downloadsCount: { increment: 1 } }
    });

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
