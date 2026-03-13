import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyJWT, AuthRequest } from '../middleware/auth';
import { developerOnly } from '../middleware/developerOnly';

const router = Router();
const prisma = new PrismaClient();

// Get admin dashboard stats (developer only)
router.get('/stats', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
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

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalWishlists,
        ordersByStatus,
        recentOrders,
        popularProducts
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get admin logs (developer only)
router.get('/logs', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create admin log entry (internal use)
router.post('/log', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { action, details } = req.body;

    const log = await prisma.adminLog.create({
      data: {
        action,
        userEmail: req.user!.email,
        ipAddress: req.ip || 'unknown',
        details: details || {}
      }
    });

    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get recent feedback (developer only)
router.get('/feedback', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const feedback = await prisma.siteFeedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all products including inactive (developer only)
router.get('/products', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subject: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reply to feedback (developer only)
router.post('/feedback/reply', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { feedbackId, replyMessage } = req.body;
    
    const feedback = await prisma.siteFeedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback || !feedback.email) {
      return res.status(404).json({ success: false, error: 'Feedback not found or missing email' });
    }

    // Send actual email using EmailService
    const emailRes = await EmailService.sendFeedbackReply(
      feedback.email, 
      replyMessage, 
      feedback.message || 'No message provided'
    );

    if (!emailRes.success) {
      return res.status(500).json({ success: false, error: 'Failed to send email reply' });
    }

    res.json({ success: true, message: 'Reply sent successfully via email' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
