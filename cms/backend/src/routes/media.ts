import express from 'express';
import { PrismaClient } from '@prisma/client';
import { uploadMedia, optimizeImage, generateFileUrls } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';
import path from 'path';
import fs from 'fs/promises';
import * as fsSync from 'fs';
import sharp from 'sharp';

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
router.post('/', uploadMedia.single('file'), async (req, res) => {
  try {
    console.log('Début de la route d\'upload');
    
    if (!req.file) {
      console.log('Aucun fichier trouvé dans la requête');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Fichier reçu:', req.file.originalname, req.file.mimetype, req.file.size);
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
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/${uploadDir}/${file.filename}`;
    
    console.log(`URL générée: ${url}`);
    
    // Créer l'entrée dans la base de données
    const media = await prisma.mediaFile.create({
      data: {
        name: name || file.originalname,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url,
        thumbnailUrl: undefined,
        alt: alt || '',
        description: description || '',
        type
      }
    });

    // Copier le fichier vers le répertoire public
    try {
      const sourceDir = path.join(process.cwd(), uploadDir);
      const targetDir = path.join(process.cwd(), '../frontend/public/uploads');
      
      // Créer le répertoire cible s'il n'existe pas
      if (!fsSync.existsSync(targetDir)) {
        await fs.mkdir(targetDir, { recursive: true });
        console.log(`Répertoire créé: ${targetDir}`);
      }
      
      // Copier le fichier
      const sourcePath = path.join(sourceDir, file.filename);
      const targetPath = path.join(targetDir, file.filename);
      
      await fs.copyFile(sourcePath, targetPath);
      console.log(`Fichier copié: ${file.filename}`);
    } catch (syncError) {
      console.error('Error copying file:', syncError);
      // Ne pas bloquer la réponse en cas d'erreur de copie
    }

    res.status(201).json(media);
  } catch (error) {
    console.error('Error uploading media:', error);
    
    // Afficher plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    res.status(500).json({ error: 'Failed to upload media', details: error instanceof Error ? error.message : String(error) });
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

// Régénérer les miniatures manquantes
router.post('/regenerate-thumbnails', async (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const mediaFiles = await prisma.mediaFile.findMany({
      where: {
        type: 'image'
      }
    });
    
    const results = [];
    
    for (const media of mediaFiles) {
      if (!media.url) continue;
      
      const filename = path.basename(media.url);
      const filePath = path.join(process.cwd(), uploadDir, filename);
      
      // Vérifier si le fichier original existe
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      if (!fileExists) {
        results.push({
          id: media.id,
          filename,
          status: 'skipped',
          reason: 'original file not found'
        });
        continue;
      }
      
      // Générer le nom de la miniature
      const thumbnailFilename = filename.replace(/\.[^/.]+$/, '-thumb.webp');
      const thumbnailPath = path.join(process.cwd(), uploadDir, thumbnailFilename);
      
      try {
        // Créer une miniature
        await sharp(filePath)
          .resize(300, 300, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .webp({ quality: 80 })
          .toFile(thumbnailPath);
        
        // Mettre à jour l'URL de la miniature dans la base de données
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const thumbnailUrl = `${baseUrl}/${uploadDir}/${thumbnailFilename}`;
        
        await prisma.mediaFile.update({
          where: { id: media.id },
          data: { thumbnailUrl }
        });
        
        results.push({
          id: media.id,
          filename: thumbnailFilename,
          status: 'success',
          url: thumbnailUrl
        });
      } catch (error) {
        console.error(`Error generating thumbnail for ${filename}:`, error);
        results.push({
          id: media.id,
          filename,
          status: 'error',
          error: error.message
        });
      }
    }
    
    res.json({
      total: mediaFiles.length,
      processed: results.length,
      success: results.filter(r => r.status === 'success').length,
      results
    });
  } catch (error) {
    console.error('Error regenerating thumbnails:', error);
    res.status(500).json({ error: 'Failed to regenerate thumbnails' });
  }
});

// Vérifier l'existence des fichiers de miniatures
router.get('/check-thumbnails', async (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const mediaFiles = await prisma.mediaFile.findMany({
      where: {
        type: 'image',
        thumbnailUrl: { not: null }
      }
    });
    
    const results = [];
    
    for (const media of mediaFiles) {
      if (!media.thumbnailUrl) continue;
      
      const thumbnailFilename = path.basename(media.thumbnailUrl);
      const thumbnailPath = path.join(process.cwd(), uploadDir, thumbnailFilename);
      
      const exists = await fs.access(thumbnailPath).then(() => true).catch(() => false);
      
      results.push({
        id: media.id,
        filename: thumbnailFilename,
        exists,
        url: media.thumbnailUrl
      });
    }
    
    res.json({
      total: results.length,
      missing: results.filter(r => !r.exists).length,
      thumbnails: results
    });
  } catch (error) {
    console.error('Error checking thumbnails:', error);
    res.status(500).json({ error: 'Failed to check thumbnails' });
  }
});

// Synchroniser les fichiers entre le backend et le frontend
router.post('/sync', async (req, res) => {
  try {
    // Exécuter le script de synchronisation
    const { exec } = require('child_process');
    const scriptPath = path.join(process.cwd(), 'copy-uploads-to-public.js');
    
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Exec error: ${error}`);
        return res.status(500).json({ error: 'Failed to sync files', details: error.message });
      }
      
      console.log(`Sync output: ${stdout}`);
      
      if (stderr) {
        console.error(`Sync stderr: ${stderr}`);
      }
      
      res.json({ message: 'Files synchronized successfully', output: stdout });
    });
  } catch (error) {
    console.error('Error syncing files:', error);
    res.status(500).json({ error: 'Failed to sync files' });
  }
});

export default router;