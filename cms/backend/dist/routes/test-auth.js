"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Route de test pour vérifier l'authentification
router.get('/protected', auth_1.authenticateToken, async (req, res) => {
    try {
        console.log('Route de test protégée appelée');
        console.log('Utilisateur authentifié:', req.user);
        res.json({
            message: 'Authentification réussie',
            user: req.user,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
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
exports.default = router;
//# sourceMappingURL=test-auth.js.map