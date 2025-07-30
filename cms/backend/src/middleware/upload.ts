import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { Request, Response, NextFunction } from 'express';
import { mediaOptimizationService } from '../services/mediaOptimizationService';

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

// Enhanced middleware for image optimization with responsive variants
export const optimizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      console.log('No file found in request');
      return next();
    }
    
    console.log(`Processing file: ${req.file.originalname}, type: ${req.file.mimetype}`);
    
    if (!req.file.mimetype.startsWith('image/')) {
      console.log(`File is not an image: ${req.file.mimetype}`);
      return next();
    }

    const inputPath = req.file.path;
    console.log(`Input file path: ${inputPath}`);
    
    // Validate image file
    const isValid = await mediaOptimizationService.validateImage(inputPath);
    if (!isValid) {
      return next(new Error('Invalid image file'));
    }
    
    // Get image metadata
    const metadata = await mediaOptimizationService.getImageMetadata(inputPath);
    console.log('Image metadata:', metadata);

    // Optimize image with responsive variants
    const result = await mediaOptimizationService.optimizeImage(inputPath);
    
    console.log(`Image optimized successfully. Compression ratio: ${(result.compressionRatio * 100).toFixed(2)}%`);
    console.log(`Generated ${result.variants.length} responsive variants`);

    // Update file information
    req.file.path = result.optimizedPath;
    req.file.filename = path.basename(result.optimizedPath);
    req.file.mimetype = 'image/webp';
    
    // Add optimization results to file object
    (req.file as any).thumbnailPath = result.thumbnailPath;
    (req.file as any).thumbnailFilename = path.basename(result.thumbnailPath);
    (req.file as any).variants = result.variants.map(v => ({
      path: v.path,
      filename: path.basename(v.path),
      width: v.width,
      height: v.height,
      size: v.size
    }));
    (req.file as any).compressionRatio = result.compressionRatio;
    (req.file as any).metadata = metadata;

    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    // Continue without optimization to avoid blocking upload
    next();
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

// Enhanced utility for generating responsive image URLs
export const generateFileUrls = (req: Request, filename: string, thumbnailFilename?: string, variants?: any[]) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  
  const url = `${baseUrl}/${uploadDir}/${filename}`;
  const thumbnailUrl = thumbnailFilename ? `${baseUrl}/${uploadDir}/${thumbnailFilename}` : undefined;
  
  // Generate responsive image URLs
  const responsiveUrls = variants ? variants.map(variant => ({
    url: `${baseUrl}/${uploadDir}/${variant.filename}`,
    width: variant.width,
    height: variant.height,
    size: variant.size
  })) : [];
  
  // Generate srcSet for responsive images
  const srcSet = variants ? variants.map(variant => 
    `${baseUrl}/${uploadDir}/${variant.filename} ${variant.width}w`
  ).join(', ') : '';
  
  const sizes = mediaOptimizationService.generateSizes();
  
  console.log(`generateFileUrls - Main URL: ${url}`);
  console.log(`generateFileUrls - Thumbnail URL: ${thumbnailUrl}`);
  console.log(`generateFileUrls - Generated ${responsiveUrls.length} responsive variants`);
  
  return { 
    url, 
    thumbnailUrl, 
    responsiveUrls,
    srcSet,
    sizes
  };
};