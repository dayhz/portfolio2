import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Route de test pour vérifier l'authentification
router.get('/check-auth', authenticateToken, (req: AuthRequest, res) => {
  console.log('Headers de la requête:', req.headers);
  console.log('User authentifié:', req.user);
  
  res.json({
    message: 'Authentification réussie',
    user: req.user
  });
});

export default router;