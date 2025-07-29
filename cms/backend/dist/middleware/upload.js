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
// Middleware pour optimiser les images avec Sharp
const optimizeImage = async (req, res, next) => {
    try {
        if (!req.file) {
            console.log('Aucun fichier trouvé dans la requête');
            return next();
        }
        console.log(`Traitement du fichier: ${req.file.originalname}, type: ${req.file.mimetype}`);
        if (!req.file.mimetype.startsWith('image/')) {
            console.log(`Le fichier n'est pas une image: ${req.file.mimetype}`);
            return next();
        }
        const inputPath = req.file.path;
        console.log(`Chemin du fichier d'entrée: ${inputPath}`);
        // Vérifier si le fichier existe
        try {
            await promises_1.default.access(inputPath);
            console.log(`Le fichier d'entrée existe: ${inputPath}`);
        }
        catch (err) {
            console.error(`Le fichier d'entrée n'existe pas: ${inputPath}`, err);
            return next(new Error(`Le fichier d'entrée n'existe pas: ${inputPath}`));
        }
        const outputPath = inputPath.replace(/\.[^/.]+$/, '.webp');
        const thumbnailPath = inputPath.replace(/\.[^/.]+$/, '-thumb.webp');
        console.log(`Chemin du fichier de sortie: ${outputPath}`);
        console.log(`Chemin de la miniature: ${thumbnailPath}`);
        try {
            // Optimiser l'image principale
            console.log('Début de l\'optimisation de l\'image principale');
            await (0, sharp_1.default)(inputPath)
                .resize(1920, 1080, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .webp({ quality: 85 })
                .toFile(outputPath);
            console.log('Image principale optimisée avec succès');
        }
        catch (err) {
            console.error('Erreur lors de l\'optimisation de l\'image principale:', err);
            return next(err);
        }
        try {
            // Créer une miniature
            console.log('Début de la création de la miniature');
            await (0, sharp_1.default)(inputPath)
                .resize(300, 300, {
                fit: 'inside',
                withoutEnlargement: true
            })
                .webp({ quality: 80 })
                .toFile(thumbnailPath);
            console.log(`Miniature créée avec succès: ${thumbnailPath}`);
        }
        catch (err) {
            console.error('Erreur lors de la création de la miniature:', err);
            // Continuer même si la création de la miniature échoue
        }
        try {
            // Supprimer le fichier original
            console.log(`Suppression du fichier original: ${inputPath}`);
            await promises_1.default.unlink(inputPath);
            console.log('Fichier original supprimé avec succès');
        }
        catch (err) {
            console.error('Erreur lors de la suppression du fichier original:', err);
            // Continuer même si la suppression échoue
        }
        // Mettre à jour les informations du fichier
        req.file.path = outputPath;
        req.file.filename = path_1.default.basename(outputPath);
        req.file.mimetype = 'image/webp';
        // Ajouter le chemin et le nom de fichier de la miniature
        req.file.thumbnailPath = thumbnailPath;
        req.file.thumbnailFilename = path_1.default.basename(thumbnailPath);
        console.log(`Miniature générée: ${path_1.default.basename(thumbnailPath)}`);
        next();
    }
    catch (error) {
        console.error('Image optimization error:', error);
        // Ne pas propager l'erreur pour éviter de bloquer l'upload
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
// Utilitaire pour générer les URLs des fichiers
const generateFileUrls = (req, filename, thumbnailFilename) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const url = `${baseUrl}/${uploadDir}/${filename}`;
    const thumbnailUrl = thumbnailFilename ? `${baseUrl}/${uploadDir}/${thumbnailFilename}` : undefined;
    console.log(`generateFileUrls - URL: ${url}`);
    console.log(`generateFileUrls - Miniature URL: ${thumbnailUrl}`);
    return { url, thumbnailUrl };
};
exports.generateFileUrls = generateFileUrls;
//# sourceMappingURL=upload.js.map