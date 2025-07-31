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
    const { name, alt, description, action } = req.body;

    // Vérifier les doublons avant de sauvegarder
    const existingMedia = await prisma.mediaFile.findFirst({
      where: {
        originalName: file.originalname,
        size: file.size
      }
    });

    // Si un doublon existe et qu'aucune action n'est spécifiée, retourner l'information du doublon
    if (existingMedia && !action) {
      console.log(`Doublon détecté: ${file.originalname} (${file.size} bytes)`);
      
      // Supprimer le fichier temporaire uploadé
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const tempFilePath = path.join(process.cwd(), uploadDir, file.filename);
      try {
        await fs.unlink(tempFilePath);
        console.log(`Fichier temporaire supprimé: ${tempFilePath}`);
      } catch (unlinkError) {
        console.warn(`Impossible de supprimer le fichier temporaire: ${tempFilePath}`, unlinkError);
      }

      return res.status(409).json({
        error: 'Duplicate file detected',
        duplicate: true,
        existingFile: {
          id: existingMedia.id,
          name: existingMedia.name,
          originalName: existingMedia.originalName,
          size: existingMedia.size,
          createdAt: existingMedia.createdAt,
          url: existingMedia.url
        },
        uploadedFile: {
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        },
        message: `Un fichier avec le nom "${file.originalname}" et la taille ${file.size} bytes existe déjà.`,
        actions: ['replace', 'rename', 'cancel']
      });
    }

    // Si un doublon existe et que l'action est "replace", supprimer l'ancien fichier
    if (existingMedia && action === 'replace') {
      console.log(`Remplacement du fichier existant: ${existingMedia.name}`);
      
      // Supprimer l'ancien fichier physique
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const oldFilePath = path.join(process.cwd(), uploadDir, path.basename(existingMedia.url));
      
      try {
        await fs.unlink(oldFilePath);
        console.log(`Ancien fichier supprimé: ${oldFilePath}`);
      } catch (fileError) {
        console.warn(`Impossible de supprimer l'ancien fichier: ${oldFilePath}`, fileError);
      }

      // Supprimer également l'ancienne miniature si elle existe
      if (existingMedia.thumbnailUrl) {
        const oldThumbnailPath = path.join(process.cwd(), uploadDir, path.basename(existingMedia.thumbnailUrl));
        try {
          await fs.unlink(oldThumbnailPath);
          console.log(`Ancienne miniature supprimée: ${oldThumbnailPath}`);
        } catch (thumbError) {
          console.warn(`Impossible de supprimer l'ancienne miniature: ${oldThumbnailPath}`, thumbError);
        }
      }

      // Supprimer l'ancienne entrée de la base de données
      await prisma.mediaFile.delete({
        where: { id: existingMedia.id }
      });
      
      console.log(`Ancienne entrée supprimée de la base de données: ${existingMedia.id}`);
    }

    // Si l'action est "rename", générer un nouveau nom de fichier unique
    let finalFilename = file.filename;
    let finalOriginalName = file.originalname;
    
    if (existingMedia && action === 'rename') {
      console.log(`Renommage du fichier: ${file.originalname}`);
      
      // Générer un nom unique en ajoutant un suffixe
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const timestamp = Date.now();
      
      finalOriginalName = `${baseName}_${timestamp}${ext}`;
      
      // Renommer également le fichier physique
      const uploadDir = process.env.UPLOAD_DIR || 'uploads';
      const oldPath = path.join(process.cwd(), uploadDir, file.filename);
      const newFilename = file.filename.replace(path.extname(file.filename), `_${timestamp}${path.extname(file.filename)}`);
      const newPath = path.join(process.cwd(), uploadDir, newFilename);
      
      try {
        await fs.rename(oldPath, newPath);
        finalFilename = newFilename;
        console.log(`Fichier renommé: ${oldPath} -> ${newPath}`);
      } catch (renameError) {
        console.error(`Erreur lors du renommage: ${renameError}`);
        // En cas d'erreur, garder le nom original mais quand même changer l'originalName
        finalOriginalName = `${baseName}_${timestamp}${ext}`;
      }
    }

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
    // Utiliser une URL relative qui sera accessible via le proxy Vite
    const url = `/${uploadDir}/${finalFilename}`;
    
    console.log(`URL générée: ${url}`);
    
    // Créer l'entrée dans la base de données
    const media = await prisma.mediaFile.create({
      data: {
        name: name || finalOriginalName,
        filename: finalFilename,
        originalName: finalOriginalName,
        mimeType: file.mimetype,
        size: file.size,
        url,
        thumbnailUrl: undefined,
        alt: alt || '',
        description: description || '',
        type
      }
    });

    console.log(`Fichier sauvegardé: ${finalFilename} -> ${url}`);

    const response: any = {
      ...media,
      message: 'File uploaded successfully'
    };

    // Ajouter des informations sur l'action effectuée
    if (existingMedia && action === 'replace') {
      response.message = 'File uploaded successfully (replaced existing file)';
      response.replaced = true;
      response.replacedFile = {
        id: existingMedia.id,
        name: existingMedia.name
      };
    } else if (existingMedia && action === 'rename') {
      response.message = 'File uploaded successfully (renamed to avoid duplicate)';
      response.renamed = true;
      response.originalRequestedName = file.originalname;
    }

    res.status(201).json(response);
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

// Supprimer plusieurs médias en masse
router.delete('/bulk/delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        error: 'No media IDs provided',
        details: 'La liste des IDs de médias est vide ou invalide'
      });
    }

    console.log(`Bulk delete requested for ${ids.length} media files`);

    // Récupérer les informations des médias avant de les supprimer
    const mediaFiles = await prisma.mediaFile.findMany({
      where: { id: { in: ids } }
    });

    if (mediaFiles.length === 0) {
      return res.status(404).json({ 
        error: 'No media found for the provided IDs',
        details: 'Aucun média trouvé avec les IDs fournis'
      });
    }

    // Vérifier s'il y a des IDs qui n'existent pas
    const foundIds = mediaFiles.map(m => m.id);
    const missingIds = ids.filter(id => !foundIds.includes(id));
    
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const results = {
      deleted: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Ajouter des avertissements pour les IDs manquants
    if (missingIds.length > 0) {
      results.warnings.push(`${missingIds.length} média(s) non trouvé(s) dans la base de données`);
    }

    console.log(`Processing ${mediaFiles.length} media files for deletion`);

    // Traiter les fichiers par lots pour de meilleures performances
    const BATCH_SIZE = 10;
    const batches = [];
    for (let i = 0; i < mediaFiles.length; i += BATCH_SIZE) {
      batches.push(mediaFiles.slice(i, i + BATCH_SIZE));
    }

    // Supprimer chaque lot
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} files)`);

      // Traiter les fichiers du lot en parallèle
      const batchPromises = batch.map(async (media) => {
        try {
          // Supprimer le fichier physique
          const filePath = path.join(process.cwd(), uploadDir, path.basename(media.url));
          
          try {
            await fs.unlink(filePath);
            console.log(`File deleted: ${filePath}`);
          } catch (fileError) {
            console.warn(`File not found or already deleted: ${filePath}`);
            // Continuer même si le fichier n'existe pas
          }

          // Supprimer également la miniature si elle existe
          if (media.thumbnailUrl) {
            const thumbnailPath = path.join(process.cwd(), uploadDir, path.basename(media.thumbnailUrl));
            try {
              await fs.unlink(thumbnailPath);
              console.log(`Thumbnail deleted: ${thumbnailPath}`);
            } catch (thumbError) {
              console.warn(`Thumbnail not found: ${thumbnailPath}`);
            }
          }

          // Supprimer l'entrée de la base de données
          await prisma.mediaFile.delete({
            where: { id: media.id }
          });

          console.log(`Successfully deleted media: ${media.name} (ID: ${media.id})`);
          return { success: true, media };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error deleting media ${media.name} (ID: ${media.id}):`, error);
          return { 
            success: false, 
            media, 
            error: errorMessage 
          };
        }
      });

      // Attendre que tous les fichiers du lot soient traités
      const batchResults = await Promise.all(batchPromises);
      
      // Compter les succès et erreurs
      batchResults.forEach(result => {
        if (result.success) {
          results.deleted++;
        } else {
          results.errors.push(`Échec de suppression de "${result.media.name}": ${result.error}`);
        }
      });
    }

    const responseData = {
      message: `Suppression en masse terminée. ${results.deleted}/${mediaFiles.length} fichier(s) supprimé(s).`,
      deleted: results.deleted,
      total: mediaFiles.length,
      requested: ids.length,
      errors: results.errors,
      warnings: results.warnings,
      success: results.errors.length === 0
    };

    // Log du résumé
    console.log(`Bulk delete completed:`, {
      requested: ids.length,
      found: mediaFiles.length,
      deleted: results.deleted,
      errors: results.errors.length,
      warnings: results.warnings.length
    });

    res.json(responseData);
  } catch (error) {
    console.error('Error in bulk delete:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to delete media files',
      details: `Erreur serveur lors de la suppression en masse: ${errorMessage}`,
      deleted: 0,
      total: 0,
      errors: [errorMessage]
    });
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

// Détecter les doublons de médias
router.post('/detect-duplicates', async (req, res) => {
  try {
    console.log('Starting duplicate detection...');

    // Récupérer tous les médias
    const allMedia = await prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${allMedia.length} media files to analyze`);

    if (allMedia.length === 0) {
      return res.json({
        duplicateGroups: [],
        totalDuplicates: 0,
        message: 'No media files found'
      });
    }

    // Grouper les médias par nom de fichier original et taille
    const duplicateMap = new Map<string, typeof allMedia>();

    allMedia.forEach(media => {
      // Créer une clé unique basée sur le nom original et la taille
      const key = `${media.originalName.toLowerCase()}_${media.size}`;
      
      if (!duplicateMap.has(key)) {
        duplicateMap.set(key, []);
      }
      
      duplicateMap.get(key)!.push(media);
    });

    // Filtrer pour ne garder que les groupes avec plus d'un fichier (doublons)
    const duplicateGroups = Array.from(duplicateMap.entries())
      .filter(([_, mediaFiles]) => mediaFiles.length > 1)
      .map(([key, mediaFiles]) => {
        // Trier par date de création (plus récent en premier)
        const sortedFiles = mediaFiles.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          originalName: sortedFiles[0].originalName,
          size: sortedFiles[0].size,
          count: sortedFiles.length,
          mediaFiles: sortedFiles,
          // Identifier le fichier à conserver (le plus récent)
          keepFile: sortedFiles[0],
          // Identifier les fichiers à supprimer
          duplicateFiles: sortedFiles.slice(1)
        };
      })
      .sort((a, b) => b.count - a.count); // Trier par nombre de doublons (plus de doublons en premier)

    // Calculer le nombre total de doublons (fichiers en trop)
    const totalDuplicates = duplicateGroups.reduce((sum, group) => 
      sum + (group.count - 1), 0
    );

    console.log(`Found ${duplicateGroups.length} duplicate groups with ${totalDuplicates} duplicate files`);

    res.json({
      duplicateGroups,
      totalDuplicates,
      totalGroups: duplicateGroups.length,
      message: duplicateGroups.length > 0 
        ? `Found ${duplicateGroups.length} groups of duplicates with ${totalDuplicates} duplicate files`
        : 'No duplicates found'
    });

  } catch (error) {
    console.error('Error detecting duplicates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to detect duplicates',
      details: `Error during duplicate detection: ${errorMessage}`,
      duplicateGroups: [],
      totalDuplicates: 0
    });
  }
});

// Supprimer les doublons de médias
router.delete('/duplicates/delete', async (req, res) => {
  try {
    console.log('Starting duplicate deletion...');

    // Récupérer tous les médias pour détecter les doublons
    const allMedia = await prisma.mediaFile.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`Found ${allMedia.length} media files to analyze for duplicates`);

    if (allMedia.length === 0) {
      return res.json({
        message: 'No media files found',
        deleted: 0,
        kept: 0,
        errors: []
      });
    }

    // Grouper les médias par nom de fichier original et taille (même logique que detect-duplicates)
    const duplicateMap = new Map<string, typeof allMedia>();

    allMedia.forEach(media => {
      const key = `${media.originalName.toLowerCase()}_${media.size}`;
      
      if (!duplicateMap.has(key)) {
        duplicateMap.set(key, []);
      }
      
      duplicateMap.get(key)!.push(media);
    });

    // Filtrer pour ne garder que les groupes avec plus d'un fichier (doublons)
    const duplicateGroups = Array.from(duplicateMap.entries())
      .filter(([_, mediaFiles]) => mediaFiles.length > 1)
      .map(([_, mediaFiles]) => {
        // Trier par date de création (plus récent en premier)
        const sortedFiles = mediaFiles.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          keepFile: sortedFiles[0], // Le plus récent
          duplicateFiles: sortedFiles.slice(1) // Les autres à supprimer
        };
      });

    if (duplicateGroups.length === 0) {
      return res.json({
        message: 'No duplicates found to delete',
        deleted: 0,
        kept: 0,
        errors: []
      });
    }

    // Collecter tous les fichiers à supprimer
    const filesToDelete = duplicateGroups.flatMap(group => group.duplicateFiles);
    const filesToKeep = duplicateGroups.map(group => group.keepFile);

    console.log(`Found ${duplicateGroups.length} duplicate groups`);
    console.log(`Will delete ${filesToDelete.length} duplicate files`);
    console.log(`Will keep ${filesToKeep.length} files (newest from each group)`);

    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const results = {
      deleted: 0,
      kept: filesToKeep.length,
      errors: [] as string[]
    };

    // Traiter les fichiers par lots pour de meilleures performances
    const BATCH_SIZE = 10;
    const batches = [];
    for (let i = 0; i < filesToDelete.length; i += BATCH_SIZE) {
      batches.push(filesToDelete.slice(i, i + BATCH_SIZE));
    }

    // Supprimer chaque lot
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing duplicate deletion batch ${batchIndex + 1}/${batches.length} (${batch.length} files)`);

      // Traiter les fichiers du lot en parallèle
      const batchPromises = batch.map(async (media) => {
        try {
          // Supprimer le fichier physique
          const filePath = path.join(process.cwd(), uploadDir, path.basename(media.url));
          
          try {
            await fs.unlink(filePath);
            console.log(`Duplicate file deleted: ${filePath}`);
          } catch (fileError) {
            console.warn(`Duplicate file not found or already deleted: ${filePath}`);
            // Continuer même si le fichier n'existe pas
          }

          // Supprimer également la miniature si elle existe
          if (media.thumbnailUrl) {
            const thumbnailPath = path.join(process.cwd(), uploadDir, path.basename(media.thumbnailUrl));
            try {
              await fs.unlink(thumbnailPath);
              console.log(`Duplicate thumbnail deleted: ${thumbnailPath}`);
            } catch (thumbError) {
              console.warn(`Duplicate thumbnail not found: ${thumbnailPath}`);
            }
          }

          // Supprimer l'entrée de la base de données
          await prisma.mediaFile.delete({
            where: { id: media.id }
          });

          console.log(`Successfully deleted duplicate media: ${media.name} (ID: ${media.id})`);
          return { success: true, media };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error deleting duplicate media ${media.name} (ID: ${media.id}):`, error);
          return { 
            success: false, 
            media, 
            error: errorMessage 
          };
        }
      });

      // Attendre que tous les fichiers du lot soient traités
      const batchResults = await Promise.all(batchPromises);
      
      // Compter les succès et erreurs
      batchResults.forEach(result => {
        if (result.success) {
          results.deleted++;
        } else {
          results.errors.push(`Échec de suppression du doublon "${result.media.name}": ${result.error}`);
        }
      });
    }

    const responseData = {
      message: `Suppression des doublons terminée. ${results.deleted} doublon(s) supprimé(s), ${results.kept} fichier(s) conservé(s).`,
      deleted: results.deleted,
      kept: results.kept,
      totalGroups: duplicateGroups.length,
      errors: results.errors,
      success: results.errors.length === 0
    };

    // Log du résumé
    console.log(`Duplicate deletion completed:`, {
      groups: duplicateGroups.length,
      deleted: results.deleted,
      kept: results.kept,
      errors: results.errors.length
    });

    res.json(responseData);
  } catch (error) {
    console.error('Error in duplicate deletion:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to delete duplicate files',
      details: `Erreur serveur lors de la suppression des doublons: ${errorMessage}`,
      deleted: 0,
      kept: 0,
      errors: [errorMessage]
    });
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