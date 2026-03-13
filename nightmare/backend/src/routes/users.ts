import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyJWT, AuthRequest } from '../middleware/auth';
import { developerOnly } from '../middleware/developerOnly';

const router = Router();
const prisma = new PrismaClient();

// Get all users (developer only)
router.get('/', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { search, isBanned, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ]
      }),
      ...(isBanned !== undefined && { isBanned: isBanned === 'true' })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          isBanned: true,
          createdAt: true,
          _count: {
            select: { orders: true }
          }
        },
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: users,
      meta: { total, page: parseInt(page as string), limit: parseInt(limit as string) }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single user details (developer only)
router.get('/:id', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        isBanned: true,
        createdAt: true,
        orders: {
          include: {
            product: { select: { id: true, title: true, type: true, thumbnailUrl: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        wishlists: {
          include: {
            product: { select: { id: true, title: true, thumbnailUrl: true } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ban/unban user (developer only)
router.patch('/:id/ban', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { isBanned: isBanned === true },
      select: {
        id: true,
        email: true,
        name: true,
        isBanned: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: isBanned ? 'User banned successfully' : 'User unbanned successfully'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get current user profile (authenticated)
router.get('/me/profile', verifyJWT, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        orders: {
          where: { status: 'paid' },
          include: {
            product: { select: { id: true, title: true, type: true, thumbnailUrl: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        wishlists: {
          include: {
            product: { select: { id: true, title: true, thumbnailUrl: true, isFree: true, price: true } }
          }
        }
      }
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update current user profile (authenticated)
router.patch('/me/profile', verifyJWT, async (req: AuthRequest, res) => {
  try {
    const { name, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl })
      },
      select: { id: true, email: true, name: true, avatarUrl: true }
    });

    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
