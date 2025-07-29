"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Schéma de validation pour les projets template Zesty
const templateProjectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Le titre est requis"),
    heroImage: zod_1.z.string().optional().default(''),
    challenge: zod_1.z.string().optional().default(''),
    approach: zod_1.z.string().optional().default(''),
    client: zod_1.z.string().min(1, "Le nom du client est requis"),
    year: zod_1.z.string().min(1, "L'année est requise"),
    duration: zod_1.z.string().optional().default(''),
    type: zod_1.z.string().optional().default(''),
    industry: zod_1.z.string().optional().default(''),
    scope: zod_1.z.array(zod_1.z.string()).optional().default([]),
    image1: zod_1.z.string().optional().default(''),
    textSection1: zod_1.z.string().optional().default(''),
    image2: zod_1.z.string().optional().default(''),
    image3: zod_1.z.string().optional().default(''),
    image4: zod_1.z.string().optional().default(''),
    video1: zod_1.z.string().optional().default(''),
    video1Poster: zod_1.z.string().optional().default(''),
    video2: zod_1.z.string().optional().default(''),
    video2Poster: zod_1.z.string().optional().default(''),
    testimonialQuote: zod_1.z.string().optional().default(''),
    testimonialAuthor: zod_1.z.string().optional().default(''),
    testimonialRole: zod_1.z.string().optional().default(''),
    testimonialImage: zod_1.z.string().optional().default(''),
    finalImage: zod_1.z.string().optional().default(''),
    textSection2: zod_1.z.string().optional().default(''),
    finalImage1: zod_1.z.string().optional().default(''),
    finalImage2: zod_1.z.string().optional().default(''),
    status: zod_1.z.enum(['draft', 'published', 'archived']).default('draft')
});
// Récupérer tous les projets template
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        // Construire les filtres
        const where = {};
        if (status && ['draft', 'published', 'archived'].includes(status)) {
            where.status = status;
        }
        const [projects, total] = await Promise.all([
            prisma.templateProject.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' }
            }),
            prisma.templateProject.count({ where })
        ]);
        res.json({
            data: projects,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching template projects:', error);
        res.status(500).json({ error: 'Failed to fetch template projects' });
    }
});
// Récupérer un projet template par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.templateProject.findUnique({
            where: { id }
        });
        if (!project) {
            return res.status(404).json({ error: 'Template project not found' });
        }
        res.json(project);
    }
    catch (error) {
        console.error('Error fetching template project:', error);
        res.status(500).json({ error: 'Failed to fetch template project' });
    }
});
// Créer un nouveau projet template
router.post('/', async (req, res) => {
    try {
        // Valider les données
        const validationResult = templateProjectSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation error',
                details: validationResult.error.format()
            });
        }
        const projectData = validationResult.data;
        // Créer le projet
        const project = await prisma.templateProject.create({
            data: {
                ...projectData,
                scope: JSON.stringify(projectData.scope) // Convertir le tableau en JSON
            }
        });
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating template project:', error);
        res.status(500).json({ error: 'Failed to create template project' });
    }
});
// Mettre à jour un projet template
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Vérifier si le projet existe
        const existingProject = await prisma.templateProject.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Template project not found' });
        }
        // Valider les données
        const validationResult = templateProjectSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation error',
                details: validationResult.error.format()
            });
        }
        const projectData = validationResult.data;
        // Mettre à jour le projet
        const project = await prisma.templateProject.update({
            where: { id },
            data: {
                ...projectData,
                scope: JSON.stringify(projectData.scope) // Convertir le tableau en JSON
            }
        });
        res.json(project);
    }
    catch (error) {
        console.error('Error updating template project:', error);
        res.status(500).json({ error: 'Failed to update template project' });
    }
});
// Supprimer un projet template
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Vérifier si le projet existe
        const existingProject = await prisma.templateProject.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Template project not found' });
        }
        // Supprimer le projet
        await prisma.templateProject.delete({
            where: { id }
        });
        res.json({ message: 'Template project deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting template project:', error);
        res.status(500).json({ error: 'Failed to delete template project' });
    }
});
// Dupliquer un projet template
router.post('/:id/duplicate', async (req, res) => {
    try {
        const { id } = req.params;
        // Récupérer le projet à dupliquer
        const sourceProject = await prisma.templateProject.findUnique({
            where: { id }
        });
        if (!sourceProject) {
            return res.status(404).json({ error: 'Template project not found' });
        }
        // Créer une copie du projet
        const { id: _, createdAt, updatedAt, ...projectData } = sourceProject;
        const duplicatedProject = await prisma.templateProject.create({
            data: {
                ...projectData,
                title: `${projectData.title} (Copie)`,
                client: `${projectData.client} (Copie)`,
                status: 'draft'
            }
        });
        res.status(201).json({
            message: 'Template project duplicated successfully',
            project: duplicatedProject
        });
    }
    catch (error) {
        console.error('Error duplicating template project:', error);
        res.status(500).json({ error: 'Failed to duplicate template project' });
    }
});
// Changer le statut d'un projet template
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['draft', 'published', 'archived'].includes(status)) {
            return res.status(400).json({ error: 'Status must be draft, published, or archived' });
        }
        // Vérifier si le projet existe
        const existingProject = await prisma.templateProject.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Template project not found' });
        }
        // Mettre à jour le statut
        const project = await prisma.templateProject.update({
            where: { id },
            data: {
                status,
                publishedAt: status === 'published' ? new Date() : existingProject.publishedAt
            }
        });
        res.json({
            message: `Template project ${status} successfully`,
            project
        });
    }
    catch (error) {
        console.error('Error updating template project status:', error);
        res.status(500).json({ error: 'Failed to update template project status' });
    }
});
exports.default = router;
//# sourceMappingURL=template-projects.js.map