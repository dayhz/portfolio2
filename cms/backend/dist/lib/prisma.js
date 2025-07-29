"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.initializeDatabase = initializeDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
// Utiliser une instance globale en développement pour éviter les reconnexions multiples
exports.prisma = globalThis.__prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV === 'development') {
    globalThis.__prisma = exports.prisma;
}
// Fonction pour initialiser la base de données
async function initializeDatabase() {
    try {
        // Tester la connexion
        await exports.prisma.$connect();
        console.log('✅ Database connected successfully');
        // Vérifier si un utilisateur admin existe
        const userCount = await exports.prisma.user.count();
        if (userCount === 0) {
            console.log('ℹ️  No users found. You can create an admin user via POST /api/auth/register');
        }
        else {
            console.log(`ℹ️  Found ${userCount} user(s) in database`);
        }
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
// Fonction pour nettoyer les connexions
async function disconnectDatabase() {
    try {
        await exports.prisma.$disconnect();
        console.log('✅ Database disconnected successfully');
    }
    catch (error) {
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
//# sourceMappingURL=prisma.js.map