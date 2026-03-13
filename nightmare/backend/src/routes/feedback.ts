import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyJWT, AuthRequest } from '../middleware/auth';
import { developerOnly } from '../middleware/developerOnly';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const feedbackSchema = z.object({
  sectionName: z.string(),
  pageUrl: z.string(),
  rating: z.number().min(1).max(5),
  message: z.string().optional(),
  email: z.string().email().optional()
});

const reviewSchema = z.object({
  productId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  reviewText: z.string().optional()
});

const quickReactionSchema = z.object({
  productId: z.string().uuid(),
  reactionType: z.enum(['fire', 'premium', 'creative', 'useful'])
});

// Submit site feedback (public, optional auth)
router.post('/site', async (req, res) => {
  try {
    const data = feedbackSchema.parse(req.body);

    const feedback = await prisma.siteFeedback.create({
      data: {
        sectionName: data.sectionName,
        pageUrl: data.pageUrl,
        rating: data.rating,
        message: data.message,
        email: data.email
      }
    });

    // TODO: Send email notification to admin

    res.status(201).json({ success: true, data: feedback });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit product review (authenticated)
router.post('/review', verifyJWT, async (req: AuthRequest, res) => {
  try {
    const data = reviewSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if user has purchased the product
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        productId: data.productId,
        status: 'paid'
      }
    });

    // Check if already reviewed
    const existingReview = await prisma.productReview.findFirst({
      where: { userId, productId: data.productId }
    });

    if (existingReview) {
      return res.status(400).json({ success: false, error: 'You have already reviewed this product' });
    }

    const review = await prisma.productReview.create({
      data: {
        userId,
        productId: data.productId,
        rating: data.rating,
        reviewText: data.reviewText,
        isVerifiedPurchase: !!hasPurchased
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit quick reaction (public, IP-based)
router.post('/reaction', async (req, res) => {
  try {
    const data = quickReactionSchema.parse(req.body);
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    // Check if already reacted from this IP
    const existing = await prisma.quickReaction.findFirst({
      where: {
        productId: data.productId,
        ipAddress
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'You have already reacted to this product' });
    }

    const reaction = await prisma.quickReaction.create({
      data: {
        productId: data.productId,
        reactionType: data.reactionType,
        ipAddress
      }
    });

    res.status(201).json({ success: true, data: reaction });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all site feedback (developer only)
router.get('/site', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const feedback = await prisma.siteFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all product reviews (developer only)
router.get('/reviews', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const reviews = await prisma.productReview.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, slug: true } }
      }
    });

    res.json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve/reject review (developer only)
router.patch('/reviews/:id/approve', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const review = await prisma.productReview.update({
      where: { id },
      data: { isApproved: isApproved === true }
    });

    res.json({ success: true, data: review });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete review (developer only)
router.delete('/reviews/:id', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.productReview.delete({ where: { id } });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
