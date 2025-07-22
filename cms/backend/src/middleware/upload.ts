import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';

// Configuration de stockage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const fullPath = path.join(process.cwd(), uploadDir);
    
    try {
      await fs.mkdir(fullPath, { recursive: true });
      cb(null, fullPath);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    // Générer un nom unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Filtres de fichiers
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers image sont autorisés'));
  }
};

const mediaFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'application/pdf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'));
  }
};

// Configuration Multer
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB par défaut

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: maxFileSize
  }
});

export const uploadMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: {
    fileSize: maxFileSize
  }
});

// Middleware pour optimiser les images avec Sharp
export const optimizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }

    const inputPath = req.file.path;
    const outputPath = inputPath.replace(/\.[^/.]+$/, '.webp');
    const thumbnailPath = inputPath.replace(/\.[^/.]+$/, '-thumb.webp');

    // Optimiser l'image principale
    await sharp(inputPath)
      .resize(1920, 1080, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Créer une miniature
    await sharp(inputPath)
      .resize(400, 300, { 
        fit: 'cover' 
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    // Supprimer le fichier original
    await fs.unlink(inputPath);

    // Mettre à jour les informations du fichier
    req.file.path = outputPath;
    req.file.filename = path.basename(outputPath);
    req.file.mimetype = 'image/webp';
    
    // Ajouter le chemin de la miniature
    (req.file as any).thumbnailPath = thumbnailPath;

    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    next(error);
  }
};

// Middleware pour optimiser plusieurs images
export const optimizeImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return next();
    }

    const optimizedFiles = [];

    for (const file of req.files) {
      if (!file.mimetype.startsWith('image/')) {
        optimizedFiles.push(file);
        continue;
      }

      const inputPath = file.path;
      const outputPath = inputPath.replace(/\.[^/.]+$/, '.webp');
      const thumbnailPath = inputPath.replace(/\.[^/.]+$/, '-thumb.webp');

      // Optimiser l'image principale
      await sharp(inputPath)
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

      // Créer une miniature
      await sharp(inputPath)
        .resize(400, 300, { 
          fit: 'cover' 
        })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);

      // Supprimer le fichier original
      await fs.unlink(inputPath);

      // Mettre à jour les informations du fichier
      const optimizedFile = {
        ...file,
        path: outputPath,
        filename: path.basename(outputPath),
        mimetype: 'image/webp',
        thumbnailPath
      };

      optimizedFiles.push(optimizedFile);
    }

    req.files = optimizedFiles;
    next();
  } catch (error) {
    console.error('Images optimization error:', error);
    next(error);
  }
};

// Utilitaire pour générer les URLs des fichiers
export const generateFileUrls = (req: Request, filename: string, thumbnailFilename?: string) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  
  return {
    url: `${baseUrl}/${uploadDir}/${filename}`,
    thumbnailUrl: thumbnailFilename ? `${baseUrl}/${uploadDir}/${thumbnailFilename}` : undefined
  };
};