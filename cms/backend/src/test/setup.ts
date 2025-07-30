import { beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

// Test database setup
const testDatabaseUrl = 'file:./test.db';
process.env.DATABASE_URL = testDatabaseUrl;
process.env.NODE_ENV = 'test';
process.env.PORT = '8001'; // Use different port for tests

const prisma = new PrismaClient();

beforeAll(async () => {
  try {
    // Generate Prisma client for test database
    execSync('npx prisma generate', { stdio: 'pipe' });
    
    // Push schema to test database
    execSync('npx prisma db push --force-reset', { 
      stdio: 'pipe',
      env: { ...process.env, DATABASE_URL: testDatabaseUrl }
    });
  } catch (error) {
    console.warn('Database setup warning:', error);
  }
});

beforeEach(async () => {
  try {
    // Clean up database before each test
    await prisma.homepageVersion.deleteMany();
    await prisma.homepageContent.deleteMany();
    await prisma.mediaFile.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.warn('Database cleanup warning:', error);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };