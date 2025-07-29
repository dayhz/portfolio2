"use strict";
const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = new PrismaClient();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Email et mot de passe requis'
            });
        }
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid Credentials',
                message: 'Email ou mot de passe incorrect'
            });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid Credentials',
                message: 'Email ou mot de passe incorrect'
            });
        }
        const jwtSecret = process.env.JWT_SECRET;
        const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }
        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: jwtExpiresIn });
        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erreur lors de la connexion'
        });
    }
});
// GET /api/auth/verify
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'Access Denied',
                message: 'Token d\'authentification requis'
            });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jwt.verify(token, jwtSecret);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true }
        });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid Token',
                message: 'Utilisateur non trouvé'
            });
        }
        res.json({
            message: 'Token valide',
            user
        });
    }
    catch (error) {
        console.error('Verify error:', error);
        res.status(401).json({
            error: 'Invalid Token',
            message: 'Token invalide ou expiré'
        });
    }
});
// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                error: 'Access Denied',
                message: 'Token d\'authentification requis'
            });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }
        const decoded = jwt.verify(token, jwtSecret);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                error: 'User Not Found',
                message: 'Utilisateur non trouvé'
            });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Erreur lors de la récupération des informations utilisateur'
        });
    }
});
module.exports = router;
//# sourceMappingURL=auth.js.map