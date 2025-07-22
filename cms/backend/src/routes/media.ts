import express from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadMedia, optimizeImage, generateFileUrls } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const prisma = new PrismaClient();

// Récupérer tous les médias
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [media, total] = await Promise.all([
      prisma.mediaFile.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.mediaFile.count()
    ]);

    res.json({
      data: media,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Récupérer un média par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const media = await prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    res.json(media);
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ error: 'Failed to fetch media' });
  }
});

// Uploader un nouveau média
router.post('/', uploadMedia.single('file'), optimizeImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const { name, alt, description } = req.body;

    // Déterminer le type de média
    let type = 'other';
    if (file.mimetype.startsWith('image/')) {
      type = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      type = 'video';
    } else if (file.mimetype === 'application/pdf') {
      type = 'document';
    }

    // Générer les URLs
    const thumbnailFilename = file.mimetype.startsWith('image/') 
      ? path.basename(file.path).replace(/\.[^/.]+$/, '-thumb.webp')
      : undefined;
    
    const { url, thumbnailUrl } = generateFileUrls(req, file.filename, thumbnailFilename);

    // Créer l'entrée dans la base de données
    const media = await prisma.mediaFile.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        thumbnailUrl,
        alt: alt || ''
      }
    });

    res.status(201).json(media);
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ error: 'Failed to upload media' });
  }
});

// Mettre à jour un média
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { alt } = req.body;

    const media = await prisma.mediaFile.update({
      where: { id },
      data: {
        alt
      }
    });

    res.json(media);
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json({ error: 'Failed to update media' });
  }
});

// Supprimer un média
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer les informations du média avant de le supprimer
    const media = await prisma.mediaFile.findUnique({
      where: { id }
    });

    if (!media) {
      return res.status(404).json({ error: 'Media not found' });
    }

    // Supprimer le fichier physique
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const filePath = path.join(process.cwd(), uploadDir, path.basename(media.url));
    
    try {
      await fs.unlink(filePath);
      
      // Supprimer également la miniature si elle existe
      if (media.thumbnailUrl) {
        const thumbnailPath = path.join(process.cwd(), uploadDir, path.basename(media.thumbnailUrl));
        await fs.unlink(thumbnailPath).catch(() => {
          // Ignorer les erreurs si la miniature n'existe pas
          console.log('Thumbnail not found or already deleted');
        });
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continuer même si le fichier n'existe pas
    }

    // Supprimer l'entrée de la base de données
    await prisma.mediaFile.delete({
      where: { id }
    });

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Failed to delete media' });
  }
});

export default router;