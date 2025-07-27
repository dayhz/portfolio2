import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Route de test pour vérifier l'authentification
router.get('/protected', authenticateToken, async (req, res) => {
  try {
    console.log('Route de test protégée appelée');
    console.log('Utilisateur authentifié:', req.user);
    
    res.json({
      message: 'Authentification réussie',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur dans la route de test:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de test publique
router.get('/public', async (req, res) => {
  res.json({
    message: 'Route publique accessible',
    timestamp: new Date().toISOString()
  });
});

export default router;