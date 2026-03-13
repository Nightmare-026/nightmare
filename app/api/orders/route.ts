import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';

export const dynamic = "force-dynamic";

const orderSchema = z.object({
  productId: z.string().uuid(),
  promoCode: z.string().optional()
});

// Initialize once, not inside handler
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ 
      key_id: process.env.RAZORPAY_KEY_ID, 
      key_secret: process.env.RAZORPAY_KEY_SECRET 
    })
  : null;

export async function POST(request: Request) {
  try {
    const user = await verifyJWT();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = orderSchema.parse(body);
    const userId = user.id;

    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json({ success: false, error: 'Product is not available' }, { status: 400 });
    }

    // Check if already purchased
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId,
        productId: data.productId,
        status: 'paid'
      }
    });

    if (existingOrder) {
      return NextResponse.json({ success: false, error: 'Product already purchased' }, { status: 400 });
    }

    // Calculate price with promo code
    let finalPrice = product.isFree ? 0 : Number(product.price) || 0;
    let promoCodeId: string | null = null;

    if (data.promoCode && finalPrice > 0) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: data.promoCode.toUpperCase() }
      });

      if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date())) {
        if (promo.usageLimit === null || promo.usageCount < promo.usageLimit) {
          if (promo.discountType === 'percent') {
            finalPrice = finalPrice * (1 - Number(promo.discountValue) / 100);
          } else {
            finalPrice = Math.max(0, finalPrice - Number(promo.discountValue));
          }
          promoCodeId = promo.id;
          
          // Increment usage count
          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { usageCount: { increment: 1 } }
          });
        }
      }
    }

    // Create Razorpay order for paid products
    let razorpayOrderId = null;
    if (finalPrice > 0) {
      if (!razorpay) {
        return NextResponse.json({ success: false, error: 'Payment gateway not configured' }, { status: 500 });
      }
      
      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(finalPrice * 100), // Razorpay expects amount in paise
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            productId: data.productId,
            userId
          }
        });
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpError: any) {
        return NextResponse.json({ success: false, error: rzpError.message || 'Payment gateway error' }, { status: 502 });
      }
    }

    const order = await prisma.order.create({
      data: {
        userId,
        productId: data.productId,
        amount: finalPrice,
        status: finalPrice === 0 ? 'paid' : 'pending',
        razorpayOrderId,
        promoCodeId
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        order,
        razorpayKeyId: finalPrice > 0 ? (process.env.RAZORPAY_KEY_ID) : null
      }
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await verifyJWT();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            type: true,
            thumbnailUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: orders
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
