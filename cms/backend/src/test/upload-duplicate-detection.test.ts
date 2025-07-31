import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import mediaRouter from '../routes/media';
import path from 'path';
import fs from 'fs/promises';

const app = express();
app.use(express.json());
app.use('/media', mediaRouter);

const prisma = new PrismaClient();

describe('Upload Duplicate Detection', () => {
  const testUploadDir = 'test-uploads';
  const testFilePath = path.join(process.cwd(), testUploadDir, 'test-image.jpg');
  
  beforeEach(async () => {
    // Nettoyer la base de données
    await prisma.mediaFile.deleteMany();
    
    // Créer le dossier de test
    await fs.mkdir(path.join(process.cwd(), testUploadDir), { recursive: true });
    
    // Créer un fichier de test
    const testImageBuffer = Buffer.from('fake-image-data');
    await fs.writeFile(testFilePath, testImageBuffer);
    
    // Configurer l'environnement de test
    process.env.UPLOAD_DIR = testUploadDir;
  });

  afterEach(async () => {
    // Nettoyer les fichiers de test
    try {
      const files = await fs.readdir(path.join(process.cwd(), testUploadDir));
      for (const file of files) {
        await fs.unlink(path.join(process.cwd(), testUploadDir, file));
      }
      await fs.rmdir(path.join(process.cwd(), testUploadDir));
    } catch (error) {
      // Ignorer les erreurs de nettoyage
    }
    
    // Nettoyer la base de données
    await prisma.mediaFile.deleteMany();
  });

  it('should detect duplicate file and return 409 status', async () => {
    // Premier upload - doit réussir
    const firstUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Test Image')
      .field('alt', 'Test alt text');

    expect(firstUpload.status).toBe(201);
    expect(firstUpload.body.originalName).toBe('test-image.jpg');

    // Deuxième upload du même fichier - doit détecter le doublon
    const secondUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Test Image Duplicate');

    expect(secondUpload.status).toBe(409);
    expect(secondUpload.body.duplicate).toBe(true);
    expect(secondUpload.body.error).toBe('Duplicate file detected');
    expect(secondUpload.body.existingFile).toBeDefined();
    expect(secondUpload.body.existingFile.originalName).toBe('test-image.jpg');
    expect(secondUpload.body.uploadedFile).toBeDefined();
    expect(secondUpload.body.actions).toEqual(['replace', 'rename', 'cancel']);
  });

  it('should replace existing file when action is "replace"', async () => {
    // Premier upload
    const firstUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Original File')
      .field('alt', 'Original alt');

    expect(firstUpload.status).toBe(201);
    const originalId = firstUpload.body.id;

    // Deuxième upload avec action "replace"
    const replaceUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Replaced File')
      .field('alt', 'Replaced alt')
      .field('action', 'replace');

    expect(replaceUpload.status).toBe(201);
    expect(replaceUpload.body.replaced).toBe(true);
    expect(replaceUpload.body.name).toBe('Replaced File');
    expect(replaceUpload.body.alt).toBe('Replaced alt');
    expect(replaceUpload.body.message).toContain('replaced existing file');

    // Vérifier que l'ancien fichier n'existe plus dans la base de données
    const oldFile = await prisma.mediaFile.findUnique({
      where: { id: originalId }
    });
    expect(oldFile).toBeNull();

    // Vérifier qu'il n'y a qu'un seul fichier dans la base de données
    const allFiles = await prisma.mediaFile.findMany();
    expect(allFiles).toHaveLength(1);
    expect(allFiles[0].name).toBe('Replaced File');
  });

  it('should rename file when action is "rename"', async () => {
    // Premier upload
    const firstUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Original File');

    expect(firstUpload.status).toBe(201);

    // Deuxième upload avec action "rename"
    const renameUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Renamed File')
      .field('action', 'rename');

    expect(renameUpload.status).toBe(201);
    expect(renameUpload.body.renamed).toBe(true);
    expect(renameUpload.body.originalName).not.toBe('test-image.jpg');
    expect(renameUpload.body.originalName).toContain('test-image_');
    expect(renameUpload.body.originalRequestedName).toBe('test-image.jpg');
    expect(renameUpload.body.message).toContain('renamed to avoid duplicate');

    // Vérifier qu'il y a maintenant deux fichiers dans la base de données
    const allFiles = await prisma.mediaFile.findMany();
    expect(allFiles).toHaveLength(2);
    
    // Vérifier que les noms sont différents
    const originalNames = allFiles.map(f => f.originalName);
    expect(originalNames).toContain('test-image.jpg');
    expect(originalNames.some(name => name.includes('test-image_'))).toBe(true);
  });

  it('should not detect duplicate for files with same name but different size', async () => {
    // Premier upload
    const firstUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Test Image');

    expect(firstUpload.status).toBe(201);

    // Créer un fichier avec le même nom mais une taille différente
    const differentSizeFilePath = path.join(process.cwd(), testUploadDir, 'test-image-different.jpg');
    const differentSizeBuffer = Buffer.from('fake-image-data-with-different-size-content');
    await fs.writeFile(differentSizeFilePath, differentSizeBuffer);

    // Renommer temporairement pour avoir le même nom
    const tempPath = path.join(process.cwd(), testUploadDir, 'test-image-temp.jpg');
    await fs.rename(differentSizeFilePath, tempPath);

    // Deuxième upload avec même nom mais taille différente
    const secondUpload = await request(app)
      .post('/media')
      .attach('file', tempPath)
      .field('name', 'Test Image Different Size');

    expect(secondUpload.status).toBe(201);
    expect(secondUpload.body.duplicate).toBeUndefined();

    // Vérifier qu'il y a deux fichiers dans la base de données
    const allFiles = await prisma.mediaFile.findMany();
    expect(allFiles).toHaveLength(2);
  });

  it('should not detect duplicate for files with different name but same size', async () => {
    // Premier upload
    const firstUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Test Image');

    expect(firstUpload.status).toBe(201);

    // Créer un fichier avec un nom différent mais la même taille
    const differentNameFilePath = path.join(process.cwd(), testUploadDir, 'different-name.jpg');
    const sameContentBuffer = Buffer.from('fake-image-data'); // Même contenu = même taille
    await fs.writeFile(differentNameFilePath, sameContentBuffer);

    // Deuxième upload avec nom différent mais même taille
    const secondUpload = await request(app)
      .post('/media')
      .attach('file', differentNameFilePath)
      .field('name', 'Different Name Image');

    expect(secondUpload.status).toBe(201);
    expect(secondUpload.body.duplicate).toBeUndefined();

    // Vérifier qu'il y a deux fichiers dans la base de données
    const allFiles = await prisma.mediaFile.findMany();
    expect(allFiles).toHaveLength(2);
  });

  it('should handle upload without duplicate detection when no existing files', async () => {
    // Upload sur une base de données vide
    const upload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'First File');

    expect(upload.status).toBe(201);
    expect(upload.body.duplicate).toBeUndefined();
    expect(upload.body.name).toBe('First File');
    expect(upload.body.originalName).toBe('test-image.jpg');

    // Vérifier qu'il y a un fichier dans la base de données
    const allFiles = await prisma.mediaFile.findMany();
    expect(allFiles).toHaveLength(1);
  });
});