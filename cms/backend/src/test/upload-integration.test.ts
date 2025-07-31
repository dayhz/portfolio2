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

describe('Upload Integration Test', () => {
  const testUploadDir = 'integration-test-uploads';
  const testFilePath = path.join(process.cwd(), testUploadDir, 'integration-test.jpg');
  
  beforeEach(async () => {
    // Nettoyer la base de données
    await prisma.mediaFile.deleteMany();
    
    // Créer le dossier de test
    await fs.mkdir(path.join(process.cwd(), testUploadDir), { recursive: true });
    
    // Créer un fichier de test
    const testImageBuffer = Buffer.from('integration-test-image-data');
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

  it('should demonstrate complete duplicate detection workflow', async () => {
    console.log('=== Integration Test: Complete Duplicate Detection Workflow ===');
    
    // Step 1: Upload initial file
    console.log('Step 1: Uploading initial file...');
    const firstUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Original Image')
      .field('alt', 'Original alt text');

    expect(firstUpload.status).toBe(201);
    expect(firstUpload.body.originalName).toBe('integration-test.jpg');
    console.log('✓ First upload successful:', firstUpload.body.name);

    // Step 2: Attempt duplicate upload (should be detected)
    console.log('Step 2: Attempting duplicate upload...');
    const duplicateAttempt = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Duplicate Image');

    expect(duplicateAttempt.status).toBe(409);
    expect(duplicateAttempt.body.duplicate).toBe(true);
    expect(duplicateAttempt.body.actions).toEqual(['replace', 'rename', 'cancel']);
    console.log('✓ Duplicate detected successfully');
    console.log('  - Existing file:', duplicateAttempt.body.existingFile.name);
    console.log('  - Available actions:', duplicateAttempt.body.actions);

    // Step 3: Replace existing file
    console.log('Step 3: Replacing existing file...');
    const replaceUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Replaced Image')
      .field('alt', 'Replaced alt text')
      .field('action', 'replace');

    expect(replaceUpload.status).toBe(201);
    expect(replaceUpload.body.replaced).toBe(true);
    expect(replaceUpload.body.name).toBe('Replaced Image');
    console.log('✓ File replaced successfully:', replaceUpload.body.name);

    // Verify only one file exists
    const filesAfterReplace = await prisma.mediaFile.findMany();
    expect(filesAfterReplace).toHaveLength(1);
    expect(filesAfterReplace[0].name).toBe('Replaced Image');
    console.log('✓ Database contains only the replaced file');

    // Step 4: Upload with rename action
    console.log('Step 4: Uploading with rename action...');
    const renameUpload = await request(app)
      .post('/media')
      .attach('file', testFilePath)
      .field('name', 'Renamed Image')
      .field('action', 'rename');

    expect(renameUpload.status).toBe(201);
    expect(renameUpload.body.renamed).toBe(true);
    expect(renameUpload.body.originalName).not.toBe('integration-test.jpg');
    expect(renameUpload.body.originalName).toContain('integration-test_');
    console.log('✓ File renamed successfully:', renameUpload.body.originalName);

    // Verify two files exist now
    const filesAfterRename = await prisma.mediaFile.findMany();
    expect(filesAfterRename).toHaveLength(2);
    console.log('✓ Database now contains 2 files');

    // Step 5: Verify no duplicate detection for different files
    console.log('Step 5: Testing different file (should not detect duplicate)...');
    const differentFilePath = path.join(process.cwd(), testUploadDir, 'different-file.jpg');
    const differentBuffer = Buffer.from('completely-different-content-here');
    await fs.writeFile(differentFilePath, differentBuffer);

    const differentUpload = await request(app)
      .post('/media')
      .attach('file', differentFilePath)
      .field('name', 'Different Image');

    expect(differentUpload.status).toBe(201);
    expect(differentUpload.body.duplicate).toBeUndefined();
    console.log('✓ Different file uploaded without duplicate detection');

    // Final verification
    const finalFiles = await prisma.mediaFile.findMany();
    expect(finalFiles).toHaveLength(3);
    console.log('✓ Final database state: 3 files total');
    
    finalFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file.name} (${file.originalName})`);
    });

    console.log('=== Integration Test Completed Successfully ===');
  });
});