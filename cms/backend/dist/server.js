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
const path_1 = __importDefault(require("path"));
const prisma_1 = require("./lib/prisma");
const authRoutes = require('./routes/auth-working');
const media_1 = __importDefault(require("./routes/media"));
const profile_1 = __importDefault(require("./routes/profile"));
const projects_1 = __importDefault(require("./routes/projects"));
const template_projects_1 = __importDefault(require("./routes/template-projects"));
const about_1 = __importDefault(require("./routes/about"));
const auth_debug_1 = __importDefault(require("./routes/auth-debug"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
// Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? ['https://your-domain.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Static files for uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const uploadsPath = path_1.default.join(process.cwd(), uploadDir);
console.log(`Serving static files from: ${uploadsPath}`);
app.use(`/${uploadDir}`, (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express_1.default.static(uploadsPath));
// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Portfolio CMS API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/debug', auth_debug_1.default);
// TODO: Add other route handlers
app.use('/api/projects', projects_1.default);
app.use('/api/template-projects', template_projects_1.default);
app.use('/api/about', about_1.default);
// app.use('/api/testimonials', testimonialRoutes);
app.use('/api/media', media_1.default);
app.use('/api/profile', profile_1.default);
// app.use('/api/services', serviceRoutes);
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
// Initialize database and start server
async function startServer() {
    const dbConnected = await (0, prisma_1.initializeDatabase)();
    if (!dbConnected) {
        console.error('❌ Failed to connect to database. Exiting...');
        process.exit(1);
    }
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
        console.log(`🔐 Auth endpoints:`);
        console.log(`   POST /api/auth/register - Create admin user`);
        console.log(`   POST /api/auth/login - Login`);
        console.log(`   GET /api/auth/verify - Verify token`);
        console.log(`   GET /api/auth/me - Get user info`);
    });
}
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map