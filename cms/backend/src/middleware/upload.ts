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
    if (!req.file) {
      console.log('Aucun fichier trouvé dans la requête');
      return next();
    }
    
    console.log(`Traitement du fichier: ${req.file.originalname}, type: ${req.file.mimetype}`);
    
    if (!req.file.mimetype.startsWith('image/')) {
      console.log(`Le fichier n'est pas une image: ${req.file.mimetype}`);
      return next();
    }

    const inputPath = req.file.path;
    console.log(`Chemin du fichier d'entrée: ${inputPath}`);
    
    // Vérifier si le fichier existe
    try {
      await fs.access(inputPath);
      console.log(`Le fichier d'entrée existe: ${inputPath}`);
    } catch (err) {
      console.error(`Le fichier d'entrée n'existe pas: ${inputPath}`, err);
      return next(new Error(`Le fichier d'entrée n'existe pas: ${inputPath}`));
    }
    
    const outputPath = inputPath.replace(/\.[^/.]+$/, '.webp');
    const thumbnailPath = inputPath.replace(/\.[^/.]+$/, '-thumb.webp');
    
    console.log(`Chemin du fichier de sortie: ${outputPath}`);
    console.log(`Chemin de la miniature: ${thumbnailPath}`);

    try {
      // Optimiser l'image principale
      console.log('Début de l\'optimisation de l\'image principale');
      await sharp(inputPath)
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 85 })
        .toFile(outputPath);
      console.log('Image principale optimisée avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'optimisation de l\'image principale:', err);
      return next(err);
    }

    try {
      // Créer une miniature
      console.log('Début de la création de la miniature');
      await sharp(inputPath)
        .resize(300, 300, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);
      console.log(`Miniature créée avec succès: ${thumbnailPath}`);
    } catch (err) {
      console.error('Erreur lors de la création de la miniature:', err);
      // Continuer même si la création de la miniature échoue
    }

    try {
      // Supprimer le fichier original
      console.log(`Suppression du fichier original: ${inputPath}`);
      await fs.unlink(inputPath);
      console.log('Fichier original supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression du fichier original:', err);
      // Continuer même si la suppression échoue
    }

    // Mettre à jour les informations du fichier
    req.file.path = outputPath;
    req.file.filename = path.basename(outputPath);
    req.file.mimetype = 'image/webp';
    
    // Ajouter le chemin et le nom de fichier de la miniature
    (req.file as any).thumbnailPath = thumbnailPath;
    (req.file as any).thumbnailFilename = path.basename(thumbnailPath);
    
    console.log(`Miniature générée: ${path.basename(thumbnailPath)}`);

    next();
  } catch (error) {
    console.error('Image optimization error:', error);
    // Ne pas propager l'erreur pour éviter de bloquer l'upload
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

// Utilitaire pour générer les URLs des fichiers
export const generateFileUrls = (req: Request, filename: string, thumbnailFilename?: string) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  
  const url = `${baseUrl}/${uploadDir}/${filename}`;
  const thumbnailUrl = thumbnailFilename ? `${baseUrl}/${uploadDir}/${thumbnailFilename}` : undefined;
  
  console.log(`generateFileUrls - URL: ${url}`);
  console.log(`generateFileUrls - Miniature URL: ${thumbnailUrl}`);
  
  return { url, thumbnailUrl };
};