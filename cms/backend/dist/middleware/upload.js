"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFileUrls = exports.optimizeImages = exports.optimizeImage = exports.uploadMedia = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const mediaOptimizationService_1 = require("../services/mediaOptimizationService");
// Configuration de stockage
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        const fullPath = path_1.default.join(process.cwd(), uploadDir);
        try {
            await promises_1.default.mkdir(fullPath, { recursive: true });
            cb(null, fullPath);
        }
        catch (error) {
            cb(error, '');
        }
    },
    filename: (req, file, cb) => {
        // Générer un nom unique
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
// Filtres de fichiers
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Seuls les fichiers image sont autorisés'));
    }
};
const mediaFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'video/mp4',
        'video/webm',
        'application/pdf'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Type de fichier non autorisé'));
    }
};
// Configuration Multer
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB par défaut
exports.uploadImage = (0, multer_1.default)({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: maxFileSize
    }
});
exports.uploadMedia = (0, multer_1.default)({
    storage,
    fileFilter: mediaFilter,
    limits: {
        fileSize: maxFileSize
    }
});
// Enhanced middleware for image optimization with responsive variants
const optimizeImage = async (req, res, next) => {
    try {
        if (!req.file) {
            console.log('No file found in request');
            return next();
        }
        console.log(`Processing file: ${req.file.originalname}, type: ${req.file.mimetype}`);
        if (!req.file.mimetype.startsWith('image/')) {
            console.log(`File is not an image: ${req.file.mimetype}`);
            return next();
        }
        const inputPath = req.file.path;
        console.log(`Input file path: ${inputPath}`);
        // Validate image file
        const isValid = await mediaOptimizationService_1.mediaOptimizationService.validateImage(inputPath);
        if (!isValid) {
            return next(new Error('Invalid image file'));
        }
        // Get image metadata
        const metadata = await mediaOptimizationService_1.mediaOptimizationService.getImageMetadata(inputPath);
        console.log('Image metadata:', metadata);
        // Optimize image with responsive variants
        const result = await mediaOptimizationService_1.mediaOptimizationService.optimizeImage(inputPath);
        console.log(`Image optimized successfully. Compression ratio: ${(result.compressionRatio * 100).toFixed(2)}%`);
        console.log(`Generated ${result.variants.length} responsive variants`);
        // Update file information
        req.file.path = result.optimizedPath;
        req.file.filename = path_1.default.basename(result.optimizedPath);
        req.file.mimetype = 'image/webp';
        // Add optimization results to file object
        req.file.thumbnailPath = result.thumbnailPath;
        req.file.thumbnailFilename = path_1.default.basename(result.thumbnailPath);
        req.file.variants = result.variants.map(v => ({
            path: v.path,
            filename: path_1.default.basename(v.path),
            width: v.width,
            height: v.height,
            size: v.size
        }));
        req.file.compressionRatio = result.compressionRatio;
        req.file.metadata = metadata;
        next();
    }
    catch (error) {
        console.error('Image optimization error:', error);
        // Continue without optimization to avoid blocking upload
        next();
    }
};
exports.optimizeImage = optimizeImage;
// Middleware pour optimiser plusieurs images
const optimizeImages = async (req, res, next) => {
    try {
        if (!req.files || !Array.isArray(req.files)) {
            return next();
        }
        const optimizedFiles = [];
        for (const file of req.files) {
            if (!file.mimetype.startsWith('image/')) {
                optimizedFiles.push(file);
                continue;
            }
            const inputPath = file.path;
            const outputPath = inputPath.replace(/\.[^/.]+$/, '.webp');
            const thumbnailPath = inputPath.replace(/\.[^/.]+$/, '-thumb.webp');
            // Optimiser l'image principale
            await (0, sharp_1.default)(inputPath)
                .resize(1920, 1080, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .webp({ quality: 85 })
                .toFile(outputPath);
            // Créer une miniature
            await (0, sharp_1.default)(inputPath)
                .resize(400, 300, {
                fit: 'cover'
            })
                .webp({ quality: 80 })
                .toFile(thumbnailPath);
            // Supprimer le fichier original
            await promises_1.default.unlink(inputPath);
            // Mettre à jour les informations du fichier
            const optimizedFile = {
                ...file,
                path: outputPath,
                filename: path_1.default.basename(outputPath),
                mimetype: 'image/webp',
                thumbnailPath
            };
            optimizedFiles.push(optimizedFile);
        }
        req.files = optimizedFiles;
        next();
    }
    catch (error) {
        console.error('Images optimization error:', error);
        next(error);
    }
};
exports.optimizeImages = optimizeImages;
// Enhanced utility for generating responsive image URLs
const generateFileUrls = (req, filename, thumbnailFilename, variants) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const url = `${baseUrl}/${uploadDir}/${filename}`;
    const thumbnailUrl = thumbnailFilename ? `${baseUrl}/${uploadDir}/${thumbnailFilename}` : undefined;
    // Generate responsive image URLs
    const responsiveUrls = variants ? variants.map(variant => ({
        url: `${baseUrl}/${uploadDir}/${variant.filename}`,
        width: variant.width,
        height: variant.height,
        size: variant.size
    })) : [];
    // Generate srcSet for responsive images
    const srcSet = variants ? variants.map(variant => `${baseUrl}/${uploadDir}/${variant.filename} ${variant.width}w`).join(', ') : '';
    const sizes = mediaOptimizationService_1.mediaOptimizationService.generateSizes();
    console.log(`generateFileUrls - Main URL: ${url}`);
    console.log(`generateFileUrls - Thumbnail URL: ${thumbnailUrl}`);
    console.log(`generateFileUrls - Generated ${responsiveUrls.length} responsive variants`);
    return {
        url,
        thumbnailUrl,
        responsiveUrls,
        srcSet,
        sizes
    };
};
exports.generateFileUrls = generateFileUrls;
//# sourceMappingURL=upload.js.map