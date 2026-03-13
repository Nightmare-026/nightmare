import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary';
import { verifyJWT } from '../middleware/auth';
import { developerOnly } from '../middleware/developerOnly';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload image (thumbnails/previews)
router.post('/image', verifyJWT, developerOnly, upload.single('image'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Convert buffer to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'nightmare/products/images',
      resource_type: 'auto'
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload PDF (product files)
router.post('/pdf', verifyJWT, developerOnly, upload.single('pdf'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // Convert buffer to base64
    const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'nightmare/products/files',
      resource_type: 'auto'
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
