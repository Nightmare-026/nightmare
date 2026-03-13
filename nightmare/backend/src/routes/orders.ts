import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyJWT, AuthRequest } from '../middleware/auth';
import { developerOnly } from '../middleware/developerOnly';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const orderSchema = z.object({
  productId: z.string().uuid(),
  promoCode: z.string().optional()
});

// Create order (authenticated)
router.post('/', verifyJWT, async (req: AuthRequest, res) => {
  try {
    const data = orderSchema.parse(req.body);
    const userId = req.user!.id;

    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (!product.isActive) {
      return res.status(400).json({ success: false, error: 'Product is not available' });
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
      return res.status(400).json({ success: false, error: 'Product already purchased' });
    }

    // Calculate price with promo code
    let finalPrice = product.isFree ? 0 : product.price?.toNumber() || 0;

    if (data.promoCode && finalPrice > 0) {
      const promo = await prisma.promoCode.findUnique({
        where: { code: data.promoCode.toUpperCase() }
      });

      if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date())) {
        if (promo.usageLimit === null || promo.usageCount < promo.usageLimit) {
          if (promo.discountType === 'percent') {
            finalPrice = finalPrice * (1 - promo.discountValue.toNumber() / 100);
          } else {
            finalPrice = Math.max(0, finalPrice - promo.discountValue.toNumber());
          }
        }
      }
    }

    // Create Razorpay order for paid products
    let razorpayOrderId = null;
    if (finalPrice > 0) {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

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
    }

    const order = await prisma.order.create({
      data: {
        userId,
        productId: data.productId,
        amount: finalPrice,
        status: finalPrice === 0 ? 'paid' : 'pending',
        razorpayOrderId
      }
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        razorpayKeyId: finalPrice > 0 ? process.env.RAZORPAY_KEY_ID : null
      }
    });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify payment (authenticated)
router.post('/verify-payment', verifyJWT, async (req: AuthRequest, res) => {
  try {
    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await prisma.order.findFirst({
      where: { razorpayOrderId: orderId },
      include: { product: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Verify signature
    const crypto = require('crypto');
    const body = orderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'failed' }
      });
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
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

    res.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's orders (authenticated)
router.get('/my-orders', verifyJWT, async (req: AuthRequest, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: { category: true, subject: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all orders (developer only)
router.get('/', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { status, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      ...(status && { status: status as any })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: { select: { id: true, title: true, type: true } }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: orders,
      meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process refund (developer only)
router.post('/:id/refund', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.status !== 'paid') {
      return res.status(400).json({ success: false, error: 'Cannot refund this order' });
    }

    // Process Razorpay refund
    if (order.razorpayPaymentId) {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });

      await razorpay.payments.refund(order.razorpayPaymentId, {
        amount: Math.round(order.amount.toNumber() * 100)
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'refunded' }
    });

    res.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
