"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const readline_1 = __importDefault(require("readline"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}
async function createAdminUser() {
    try {
        console.log('🔧 Initialisation du CMS Portfolio');
        console.log('=====================================\n');
        // Vérifier si un utilisateur existe déjà
        const existingUsers = await prisma.user.count();
        if (existingUsers > 0) {
            console.log('ℹ️  Un ou plusieurs utilisateurs existent déjà.');
            const overwrite = await question('Voulez-vous créer un nouvel utilisateur admin ? (y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('❌ Opération annulée.');
                process.exit(0);
            }
        }
        // Collecter les informations de l'admin
        const name = await question('Nom complet: ');
        const email = await question('Email: ');
        // Validation email simple
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Email invalide.');
            process.exit(1);
        }
        const password = await question('Mot de passe (min. 6 caractères): ');
        if (password.length < 6) {
            console.log('❌ Le mot de passe doit contenir au moins 6 caractères.');
            process.exit(1);
        }
        const confirmPassword = await question('Confirmer le mot de passe: ');
        if (password !== confirmPassword) {
            console.log('❌ Les mots de passe ne correspondent pas.');
            process.exit(1);
        }
        // Vérifier si l'email existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            console.log('❌ Un utilisateur avec cet email existe déjà.');
            process.exit(1);
        }
        // Hasher le mot de passe
        const saltRounds = 12;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        console.log('\n✅ Utilisateur admin créé avec succès !');
        console.log(`📧 Email: ${user.email}`);
        console.log(`👤 Nom: ${user.name}`);
        console.log(`🆔 ID: ${user.id}`);
        // Créer un profil par défaut
        await prisma.profile.create({
            data: {
                name: user.name,
                title: 'Designer & Developer',
                description: 'Passionate about creating beautiful and functional digital experiences.',
                email: user.email,
                location: 'Paris, France'
            }
        });
        console.log('✅ Profil par défaut créé.');
        console.log('\n🚀 Vous pouvez maintenant démarrer le serveur avec:');
        console.log('   npm run dev');
        console.log('\n🔐 Connectez-vous avec:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Mot de passe: [le mot de passe que vous avez saisi]`);
    }
    catch (error) {
        console.error('❌ Erreur lors de la création de l\'utilisateur admin:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
        rl.close();
    }
}
createAdminUser();
//# sourceMappingURL=init-admin.js.map