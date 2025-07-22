import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

// Utiliser une instance globale en développement pour éviter les reconnexions multiples
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

// Fonction pour initialiser la base de données
export async function initializeDatabase() {
  try {
    // Tester la connexion
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Vérifier si un utilisateur admin existe
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('ℹ️  No users found. You can create an admin user via POST /api/auth/register');
    } else {
      console.log(`ℹ️  Found ${userCount} user(s) in database`);
    }

    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Fonction pour nettoyer les connexions
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
}

// Gestionnaire de fermeture propre
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});