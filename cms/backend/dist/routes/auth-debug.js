"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Route de test pour vérifier l'authentification
router.get('/check-auth', auth_1.authenticateToken, (req, res) => {
    console.log('Headers de la requête:', req.headers);
    console.log('User authentifié:', req.user);
    res.json({
        message: 'Authentification réussie',
        user: req.user
    });
});
exports.default = router;
//# sourceMappingURL=auth-debug.js.map