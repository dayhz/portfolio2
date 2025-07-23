import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access Denied',
        message: 'Token d\'authentification requis'
      });
    }

    // Accepter le token de test en mode développement
    if (token === 'dummy-token-for-testing' && process.env.NODE_ENV !== 'production') {
      console.log('Utilisation du token de test pour le développement');
      req.user = {
        id: '1',
        email: 'admin@portfolio.com',
        name: 'Admin'
      };
      return next();
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    // Vérifier que l'utilisateur existe toujours
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

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
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

export const generateToken = (userId: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });
};