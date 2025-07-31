import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import express from 'express';
import mediaRouter from '../routes/media';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use('/media', mediaRouter);

describe('Duplicate Detection API', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.mediaFile.deleteMany({
      where: {
        originalName: {
          in: ['test-file.jpg', 'another-file.png', 'unique-file.pdf']
        }
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.mediaFile.deleteMany({
      where: {
        originalName: {
          in: ['test-file.jpg', 'another-file.png', 'unique-file.pdf']
        }
      }
    });
  });

  it('should detect duplicates based on original name and size', async () => {
    // Create test media files with duplicates
    const testFiles = [
      {
        name: 'Test File 1',
        filename: 'test-file-1.jpg',
        originalName: 'test-file.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file-1.jpg',
        type: 'image'
      },
      {
        name: 'Test File 2',
        filename: 'test-file-2.jpg',
        originalName: 'test-file.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file-2.jpg',
        type: 'image'
      },
      {
        name: 'Another File',
        filename: 'another-file.png',
        originalName: 'another-file.png',
        mimeType: 'image/png',
        size: 2048,
        url: '/uploads/another-file.png',
        type: 'image'
      },
      {
        name: 'Unique File',
        filename: 'unique-file.pdf',
        originalName: 'unique-file.pdf',
        mimeType: 'application/pdf',
        size: 4096,
        url: '/uploads/unique-file.pdf',
        type: 'document'
      }
    ];

    // Insert test files
    for (const file of testFiles) {
      await prisma.mediaFile.create({ data: file });
    }

    // Call the duplicate detection API
    const response = await request(app)
      .post('/media/detect-duplicates')
      .expect(200);

    expect(response.body).toHaveProperty('duplicateGroups');
    expect(response.body).toHaveProperty('totalDuplicates');
    expect(response.body).toHaveProperty('totalGroups');

    // Should find one group of duplicates (test-file.jpg with 2 files)
    expect(response.body.totalGroups).toBe(1);
    expect(response.body.totalDuplicates).toBe(1); // 2 files - 1 to keep = 1 duplicate

    const duplicateGroup = response.body.duplicateGroups[0];
    expect(duplicateGroup.originalName).toBe('test-file.jpg');
    expect(duplicateGroup.size).toBe(1024);
    expect(duplicateGroup.count).toBe(2);
    expect(duplicateGroup.mediaFiles).toHaveLength(2);
    expect(duplicateGroup.keepFile).toBeDefined();
    expect(duplicateGroup.duplicateFiles).toHaveLength(1);
  });

  it('should return empty result when no duplicates exist', async () => {
    // Create test media files without duplicates
    const testFiles = [
      {
        name: 'File 1',
        filename: 'file1.jpg',
        originalName: 'file1.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/file1.jpg',
        type: 'image'
      },
      {
        name: 'File 2',
        filename: 'file2.png',
        originalName: 'file2.png',
        mimeType: 'image/png',
        size: 2048,
        url: '/uploads/file2.png',
        type: 'image'
      }
    ];

    // Insert test files
    for (const file of testFiles) {
      await prisma.mediaFile.create({ data: file });
    }

    // Call the duplicate detection API
    const response = await request(app)
      .post('/media/detect-duplicates')
      .expect(200);

    expect(response.body.totalGroups).toBe(0);
    expect(response.body.totalDuplicates).toBe(0);
    expect(response.body.duplicateGroups).toHaveLength(0);
    expect(response.body.message).toBe('No duplicates found');
  });

  it('should handle case-insensitive duplicate detection', async () => {
    // Create test media files with same name but different case
    const testFiles = [
      {
        name: 'Test File 1',
        filename: 'test-file-1.jpg',
        originalName: 'Test-File.JPG',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file-1.jpg',
        type: 'image'
      },
      {
        name: 'Test File 2',
        filename: 'test-file-2.jpg',
        originalName: 'test-file.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file-2.jpg',
        type: 'image'
      }
    ];

    // Insert test files
    for (const file of testFiles) {
      await prisma.mediaFile.create({ data: file });
    }

    // Call the duplicate detection API
    const response = await request(app)
      .post('/media/detect-duplicates')
      .expect(200);

    expect(response.body.totalGroups).toBe(1);
    expect(response.body.totalDuplicates).toBe(1);
  });

  it('should sort files by creation date (newest first)', async () => {
    // Create test media files with different creation dates
    const now = new Date();
    const older = new Date(now.getTime() - 60000); // 1 minute ago

    const testFiles = [
      {
        name: 'Older File',
        filename: 'test-file-old.jpg',
        originalName: 'test-file.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file-old.jpg',
        type: 'image',
        createdAt: older
      },
      {
        name: 'Newer File',
        filename: 'test-file-new.jpg',
        originalName: 'test-file.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-file-new.jpg',
        type: 'image',
        createdAt: now
      }
    ];

    // Insert test files
    for (const file of testFiles) {
      await prisma.mediaFile.create({ data: file });
    }

    // Call the duplicate detection API
    const response = await request(app)
      .post('/media/detect-duplicates')
      .expect(200);

    const duplicateGroup = response.body.duplicateGroups[0];
    
    // The newest file should be marked as the one to keep
    expect(duplicateGroup.keepFile.name).toBe('Newer File');
    expect(duplicateGroup.duplicateFiles[0].name).toBe('Older File');
  });
});

describe('Duplicate Deletion API', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.mediaFile.deleteMany({
      where: {
        originalName: {
          in: ['test-duplicate.jpg', 'another-duplicate.png', 'unique-file.pdf']
        }
      }
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.mediaFile.deleteMany({
      where: {
        originalName: {
          in: ['test-duplicate.jpg', 'another-duplicate.png', 'unique-file.pdf']
        }
      }
    });
  });

  it('should delete duplicate files and keep the newest', async () => {
    // Create test media files with duplicates
    const now = new Date();
    const older1 = new Date(now.getTime() - 60000); // 1 minute ago
    const older2 = new Date(now.getTime() - 120000); // 2 minutes ago

    const testFiles = [
      {
        name: 'Oldest File',
        filename: 'test-duplicate-1.jpg',
        originalName: 'test-duplicate.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-duplicate-1.jpg',
        type: 'image',
        createdAt: older2
      },
      {
        name: 'Middle File',
        filename: 'test-duplicate-2.jpg',
        originalName: 'test-duplicate.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-duplicate-2.jpg',
        type: 'image',
        createdAt: older1
      },
      {
        name: 'Newest File',
        filename: 'test-duplicate-3.jpg',
        originalName: 'test-duplicate.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-duplicate-3.jpg',
        type: 'image',
        createdAt: now
      },
      {
        name: 'Unique File',
        filename: 'unique-file.pdf',
        originalName: 'unique-file.pdf',
        mimeType: 'application/pdf',
        size: 4096,
        url: '/uploads/unique-file.pdf',
        type: 'document'
      }
    ];

    // Insert test files
    const createdFiles = [];
    for (const file of testFiles) {
      const created = await prisma.mediaFile.create({ data: file });
      createdFiles.push(created);
    }

    // Call the duplicate deletion API
    const response = await request(app)
      .delete('/media/duplicates/delete')
      .expect(200);

    expect(response.body).toHaveProperty('deleted');
    expect(response.body).toHaveProperty('kept');
    expect(response.body).toHaveProperty('totalGroups');
    expect(response.body).toHaveProperty('errors');

    // Should delete 2 duplicates and keep 1 + 1 unique file
    expect(response.body.deleted).toBe(2);
    expect(response.body.kept).toBe(1); // Only counts files kept from duplicate groups
    expect(response.body.totalGroups).toBe(1);
    expect(response.body.errors).toHaveLength(0);

    // Verify that only the newest duplicate and the unique file remain
    const remainingFiles = await prisma.mediaFile.findMany({
      where: {
        originalName: {
          in: ['test-duplicate.jpg', 'unique-file.pdf']
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    expect(remainingFiles).toHaveLength(2);
    
    // The remaining duplicate should be the newest one
    const remainingDuplicate = remainingFiles.find(f => f.originalName === 'test-duplicate.jpg');
    expect(remainingDuplicate?.name).toBe('Newest File');
    
    // The unique file should still be there
    const uniqueFile = remainingFiles.find(f => f.originalName === 'unique-file.pdf');
    expect(uniqueFile?.name).toBe('Unique File');
  });

  it('should return appropriate message when no duplicates exist', async () => {
    // Create test media files without duplicates
    const testFiles = [
      {
        name: 'File 1',
        filename: 'file1.jpg',
        originalName: 'file1.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/file1.jpg',
        type: 'image'
      },
      {
        name: 'File 2',
        filename: 'file2.png',
        originalName: 'file2.png',
        mimeType: 'image/png',
        size: 2048,
        url: '/uploads/file2.png',
        type: 'image'
      }
    ];

    // Insert test files
    for (const file of testFiles) {
      await prisma.mediaFile.create({ data: file });
    }

    // Call the duplicate deletion API
    const response = await request(app)
      .delete('/media/duplicates/delete')
      .expect(200);

    expect(response.body.deleted).toBe(0);
    expect(response.body.kept).toBe(0);
    expect(response.body.message).toBe('No duplicates found to delete');
  });

  it('should handle multiple duplicate groups correctly', async () => {
    // Create test media files with multiple duplicate groups
    const now = new Date();
    const older = new Date(now.getTime() - 60000);

    const testFiles = [
      // Group 1: test-duplicate.jpg
      {
        name: 'Test Duplicate Old',
        filename: 'test-duplicate-old.jpg',
        originalName: 'test-duplicate.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-duplicate-old.jpg',
        type: 'image',
        createdAt: older
      },
      {
        name: 'Test Duplicate New',
        filename: 'test-duplicate-new.jpg',
        originalName: 'test-duplicate.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        url: '/uploads/test-duplicate-new.jpg',
        type: 'image',
        createdAt: now
      },
      // Group 2: another-duplicate.png
      {
        name: 'Another Duplicate Old',
        filename: 'another-duplicate-old.png',
        originalName: 'another-duplicate.png',
        mimeType: 'image/png',
        size: 2048,
        url: '/uploads/another-duplicate-old.png',
        type: 'image',
        createdAt: older
      },
      {
        name: 'Another Duplicate New',
        filename: 'another-duplicate-new.png',
        originalName: 'another-duplicate.png',
        mimeType: 'image/png',
        size: 2048,
        url: '/uploads/another-duplicate-new.png',
        type: 'image',
        createdAt: now
      }
    ];

    // Insert test files
    for (const file of testFiles) {
      await prisma.mediaFile.create({ data: file });
    }

    // Call the duplicate deletion API
    const response = await request(app)
      .delete('/media/duplicates/delete')
      .expect(200);

    // Should delete 2 duplicates (1 from each group) and keep 2 files
    expect(response.body.deleted).toBe(2);
    expect(response.body.kept).toBe(2);
    expect(response.body.totalGroups).toBe(2);
    expect(response.body.errors).toHaveLength(0);

    // Verify that only the newest files from each group remain
    const remainingFiles = await prisma.mediaFile.findMany({
      where: {
        originalName: {
          in: ['test-duplicate.jpg', 'another-duplicate.png']
        }
      },
      orderBy: { name: 'asc' }
    });

    expect(remainingFiles).toHaveLength(2);
    expect(remainingFiles[0].name).toBe('Another Duplicate New');
    expect(remainingFiles[1].name).toBe('Test Duplicate New');
  });

  it('should handle empty database gracefully', async () => {
    // Ensure database is empty for this test
    await prisma.mediaFile.deleteMany();

    // Call the duplicate deletion API
    const response = await request(app)
      .delete('/media/duplicates/delete')
      .expect(200);

    expect(response.body.deleted).toBe(0);
    expect(response.body.kept).toBe(0);
    expect(response.body.message).toBe('No media files found');
  });
});