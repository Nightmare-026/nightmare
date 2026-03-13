import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await verifyJWT();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, razorpayPaymentId, razorpaySignature } = await request.json();

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: orderId },
      include: { product: true }
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Verify signature
    const body = orderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'test_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature && process.env.NODE_ENV === 'production') {
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
