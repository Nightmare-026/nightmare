import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyJWT, AuthRequest } from '../middleware/auth';
import { developerOnly } from '../middleware/developerOnly';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const subjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().uuid(),
  description: z.string().optional(),
  displayOrder: z.number().default(0)
});

// Get all subjects (public)
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query;

    const subjects = await prisma.subject.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId: categoryId as string })
      },
      include: {
        category: true,
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });

    res.json({ success: true, data: subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get subjects by category slug (public)
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        categoryId: category.id,
        isActive: true
      },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      },
      orderBy: { displayOrder: 'asc' }
    });

    res.json({ success: true, data: subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create subject (developer only)
router.post('/', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const data = subjectSchema.parse(req.body);

    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check if slug exists
    const existing = await prisma.subject.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Subject with similar name already exists' });
    }

    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        slug,
        categoryId: data.categoryId,
        description: data.description,
        displayOrder: data.displayOrder
      }
    });

    res.status(201).json({ success: true, data: subject });
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ success: false, error: error.errors });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update subject (developer only)
router.put('/:id', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      }
    });

    res.json({ success: true, data: subject });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete subject (developer only)
router.delete('/:id', verifyJWT, developerOnly, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if subject has products
    const productCount = await prisma.product.count({
      where: { subjectId: id }
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete subject with assigned products'
      });
    }

    await prisma.subject.delete({ where: { id } });

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
