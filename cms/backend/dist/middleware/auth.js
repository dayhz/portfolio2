"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.authenticateToken = void 0;
const jwt = require('jsonwebtoken');
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    try {
        console.log('=== AUTH MIDDLEWARE DEBUG ===');
        console.log('Request URL:', req.url);
        console.log('Request Method:', req.method);
        console.log('All Headers:', req.headers);
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        console.log('Auth Header:', authHeader);
        console.log('Extracted Token:', token);
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({
                error: 'Access Denied',
                message: 'Token d\'authentification requis'
            });
        }
        // Accepter le token de test en mode développement
        if (token === 'dummy-token-for-testing') {
            console.log('✅ Using test token for development');
            console.log('NODE_ENV:', process.env.NODE_ENV);
            req.user = {
                id: '1',
                email: 'admin@portfolio.com',
                name: 'Admin'
            };
            console.log('✅ Test user set:', req.user);
            return next();
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.log('❌ JWT_SECRET not configured');
            throw new Error('JWT_SECRET not configured');
        }
        console.log('🔍 Verifying JWT token...');
        const decoded = jwt.verify(token, jwtSecret);
        console.log('✅ JWT decoded:', decoded);
        // Vérifier que l'utilisateur existe toujours
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true }
        });
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(401).json({
                error: 'Invalid Token',
                message: 'Utilisateur non trouvé'
            });
        }
        console.log('✅ User found:', user);
        req.user = user;
        console.log('=== AUTH MIDDLEWARE SUCCESS ===');
        next();
    }
    catch (error) {
        console.log('❌ AUTH MIDDLEWARE ERROR:', error);
        if (error instanceof jwt.JsonWebTokenError) {
            console.log('❌ JWT Error:', error.message);
            return res.status(401).json({
                error: 'Invalid Token',
                message: 'Token invalide ou expiré'
            });
        }
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erreur d\'authentification'
        });
    }
};
exports.authenticateToken = authenticateToken;
const generateToken = (userId) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });
};
exports.generateToken = generateToken;
//# sourceMappingURL=auth.js.map