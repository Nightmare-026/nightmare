import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyJWT, AuthRequest } from '../middleware/auth';
import { developerOnly } from '../middleware/developerOnly';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Product type definition
type ProductType = 'pdf' | 'wallpaper';

const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  categoryId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  type: z.enum(['pdf', 'wallpaper']),
  price: z.number().optional(),
  isFree: z.boolean().default(false),
  fileUrl: z.string().url(),
  previewUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([])
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, subject, type, isFree, search, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      isActive: true,
      ...(category && { category: { slug: category as string } }),
      ...(subject && { subject: { slug: subject as string } }),
      ...(type && { type: type as ProductType }),
      ...(isFree !== undefined && { isFree: isFree === 'true' }),
      ...(search && {
        OR: [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { tags: { has: search as string } }
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
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      success: true,
      data: products,
      meta: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single product by slug (public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

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
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create product (developer only)
router.post('/', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const data = productSchema.parse(req.body);

    // Generate unique slug
    let slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        categoryId: data.categoryId,
        subjectId: data.subjectId,
        type: data.type,
        price: data.isFree ? null : data.price,
        isFree: data.isFree,
        fileUrl: data.fileUrl,
        previewUrl: data.previewUrl,
        thumbnailUrl: data.thumbnailUrl,
        tags: data.tags
      }
    });

    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update product (developer only)
router.put('/:id', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.subjectId !== undefined && { subjectId: data.subjectId }),
        ...(data.type && { type: data.type }),
        ...(data.price !== undefined && { price: data.isFree ? null : data.price }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.fileUrl && { fileUrl: data.fileUrl }),
        ...(data.previewUrl !== undefined && { previewUrl: data.previewUrl }),
        ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
        ...(data.tags && { tags: data.tags }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      }
    });

    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete product (developer only)
router.delete('/:id', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
