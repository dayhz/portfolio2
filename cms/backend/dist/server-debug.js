"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Test route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Portfolio CMS API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// Test d'import du router
console.log('Tentative d\'import du router auth...');
try {
    const authRoutes = require('./routes/auth');
    console.log('authRoutes type:', typeof authRoutes);
    console.log('authRoutes keys:', Object.keys(authRoutes));
    console.log('authRoutes:', authRoutes);
    if (typeof authRoutes === 'function') {
        app.use('/api/auth', authRoutes);
        console.log('✅ Router auth ajouté avec succès');
    }
    else {
        console.log('❌ authRoutes n\'est pas une fonction');
    }
}
catch (error) {
    console.error('❌ Erreur lors de l\'import du router auth:', error);
}
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
});
//# sourceMappingURL=server-debug.js.map