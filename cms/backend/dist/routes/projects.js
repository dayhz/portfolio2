"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Schéma de validation pour la création/mise à jour d'un projet
const projectSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Le titre est requis"),
    description: zod_1.z.string().min(1, "La description est requise"),
    category: zod_1.z.enum(["WEBSITE", "PRODUCT", "MOBILE"], {
        errorMap: () => ({ message: "La catégorie doit être WEBSITE, PRODUCT ou MOBILE" })
    }),
    thumbnail: zod_1.z.string().min(1, "L'image miniature est requise"),
    images: zod_1.z.string().min(1, "Au moins une image est requise"), // JSON array as string
    year: zod_1.z.number().int().min(1990).max(new Date().getFullYear() + 1),
    client: zod_1.z.string().min(1, "Le nom du client est requis"),
    duration: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    scope: zod_1.z.string().optional(), // JSON array as string
    challenge: zod_1.z.string().optional(),
    approach: zod_1.z.string().optional(),
    testimonial: zod_1.z.string().optional(),
    content: zod_1.z.string().optional(), // Rich text content
    isPublished: zod_1.z.boolean().default(false),
    order: zod_1.z.number().int().default(0)
});
// Récupérer tous les projets
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const isPublished = req.query.isPublished === 'true' ? true :
            req.query.isPublished === 'false' ? false : undefined;
        const format = req.query.format; // Pour différencier les appels CMS vs Portfolio
        // Construire les filtres
        const where = {};
        if (category) {
            where.category = category;
        }
        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }
        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip,
                take: limit,
                orderBy: { order: 'asc' }
            }),
            prisma.project.count({ where })
        ]);
        // Si c'est un appel depuis le portfolio (pas de format spécifié), retourner le format simple
        if (!format || format === 'portfolio') {
            // Mapper les projets au format attendu par le portfolio
            const portfolioProjects = projects.map(project => {
                let images = [];
                try {
                    images = JSON.parse(project.images || '[]');
                }
                catch (e) {
                    console.warn('Failed to parse images for project:', project.id);
                }
                return {
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, ''),
                    imageUrl: images.length > 0 ? images[0] : project.thumbnail,
                    category: project.category,
                    year: project.year,
                    client: project.client,
                    isPublished: project.isPublished
                };
            });
            return res.json(portfolioProjects);
        }
        // Format CMS avec pagination
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
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
// Récupérer un projet par ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    }
    catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});
// Créer un nouveau projet
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        // Valider les données
        const validationResult = projectSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation error',
                details: validationResult.error.format()
            });
        }
        const projectData = validationResult.data;
        // Vérifier que les images sont un tableau JSON valide
        try {
            const images = JSON.parse(projectData.images);
            if (!Array.isArray(images)) {
                return res.status(400).json({ error: 'Le champ images doit être un tableau JSON' });
            }
        }
        catch (e) {
            return res.status(400).json({ error: 'Le champ images doit être un tableau JSON valide' });
        }
        // Vérifier que scope est un tableau JSON valide s'il est fourni
        if (projectData.scope) {
            try {
                const scope = JSON.parse(projectData.scope);
                if (!Array.isArray(scope)) {
                    return res.status(400).json({ error: 'Le champ scope doit être un tableau JSON' });
                }
            }
            catch (e) {
                return res.status(400).json({ error: 'Le champ scope doit être un tableau JSON valide' });
            }
        }
        // Déterminer l'ordre du nouveau projet
        const maxOrderProject = await prisma.project.findFirst({
            orderBy: { order: 'desc' }
        });
        const newOrder = maxOrderProject ? maxOrderProject.order + 1 : 0;
        // Créer le projet
        const project = await prisma.project.create({
            data: {
                ...projectData,
                order: newOrder
            }
        });
        res.status(201).json(project);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
// Mettre à jour un projet
router.put('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Vérifier si le projet existe
        const existingProject = await prisma.project.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Valider les données
        const validationResult = projectSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation error',
                details: validationResult.error.format()
            });
        }
        const projectData = validationResult.data;
        // Vérifier que les images sont un tableau JSON valide
        try {
            const images = JSON.parse(projectData.images);
            if (!Array.isArray(images)) {
                return res.status(400).json({ error: 'Le champ images doit être un tableau JSON' });
            }
        }
        catch (e) {
            return res.status(400).json({ error: 'Le champ images doit être un tableau JSON valide' });
        }
        // Vérifier que scope est un tableau JSON valide s'il est fourni
        if (projectData.scope) {
            try {
                const scope = JSON.parse(projectData.scope);
                if (!Array.isArray(scope)) {
                    return res.status(400).json({ error: 'Le champ scope doit être un tableau JSON' });
                }
            }
            catch (e) {
                return res.status(400).json({ error: 'Le champ scope doit être un tableau JSON valide' });
            }
        }
        // Mettre à jour le projet
        const project = await prisma.project.update({
            where: { id },
            data: projectData
        });
        res.json(project);
    }
    catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});
// Supprimer un projet
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Vérifier si le projet existe
        const existingProject = await prisma.project.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Supprimer le projet
        await prisma.project.delete({
            where: { id }
        });
        res.json({ message: 'Project deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
// Mettre à jour l'ordre des projets
router.put('/reorder', auth_1.authenticateToken, async (req, res) => {
    try {
        const { projectOrders } = req.body;
        if (!Array.isArray(projectOrders)) {
            return res.status(400).json({ error: 'projectOrders doit être un tableau' });
        }
        // Valider la structure des données
        for (const item of projectOrders) {
            if (!item.id || typeof item.order !== 'number') {
                return res.status(400).json({
                    error: 'Chaque élément doit avoir un id et un ordre',
                    example: [{ id: 'project-id', order: 0 }]
                });
            }
        }
        // Mettre à jour l'ordre de chaque projet
        const updates = projectOrders.map(item => prisma.project.update({
            where: { id: item.id },
            data: { order: item.order }
        }));
        await prisma.$transaction(updates);
        res.json({ message: 'Projects reordered successfully' });
    }
    catch (error) {
        console.error('Error reordering projects:', error);
        res.status(500).json({ error: 'Failed to reorder projects' });
    }
});
// Publier/dépublier un projet
router.patch('/:id/publish', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;
        if (typeof isPublished !== 'boolean') {
            return res.status(400).json({ error: 'isPublished doit être un booléen' });
        }
        // Vérifier si le projet existe
        const existingProject = await prisma.project.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Mettre à jour le statut de publication
        const project = await prisma.project.update({
            where: { id },
            data: { isPublished }
        });
        res.json({
            message: isPublished ? 'Project published successfully' : 'Project unpublished successfully',
            project
        });
    }
    catch (error) {
        console.error('Error updating project publication status:', error);
        res.status(500).json({ error: 'Failed to update project publication status' });
    }
});
// Dupliquer un projet
router.post('/:id/duplicate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Récupérer le projet à dupliquer
        const sourceProject = await prisma.project.findUnique({
            where: { id }
        });
        if (!sourceProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Déterminer l'ordre du nouveau projet
        const maxOrderProject = await prisma.project.findFirst({
            orderBy: { order: 'desc' }
        });
        const newOrder = maxOrderProject ? maxOrderProject.order + 1 : 0;
        // Créer une copie du projet
        const { id: _, createdAt, updatedAt, ...projectData } = sourceProject;
        const duplicatedProject = await prisma.project.create({
            data: {
                ...projectData,
                title: `${projectData.title} (copie)`,
                isPublished: false,
                order: newOrder
            }
        });
        res.status(201).json({
            message: 'Project duplicated successfully',
            project: duplicatedProject
        });
    }
    catch (error) {
        console.error('Error duplicating project:', error);
        res.status(500).json({ error: 'Failed to duplicate project' });
    }
});
// Récupérer le contenu d'un projet
router.get('/:id/content', async (req, res) => {
    try {
        const { id } = req.params;
        // Utiliser une requête SQL brute pour récupérer le contenu
        const result = await prisma.$queryRaw `
      SELECT "content" FROM "Project" WHERE "id" = ${id}
    `;
        if (!result || !Array.isArray(result) || result.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Récupérer le contenu du premier résultat
        const content = result[0]?.content || '';
        res.json({ content });
    }
    catch (error) {
        console.error('Error fetching project content:', error);
        res.status(500).json({ error: 'Failed to fetch project content' });
    }
});
// Mettre à jour le contenu d'un projet
router.put('/:id/content', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (typeof content !== 'string') {
            return res.status(400).json({ error: 'Content must be a string' });
        }
        // Vérifier si le projet existe
        const existingProject = await prisma.project.findUnique({
            where: { id }
        });
        if (!existingProject) {
            return res.status(404).json({ error: 'Project not found' });
        }
        // Utiliser une approche alternative pour mettre à jour le contenu
        // en utilisant une requête SQL brute via Prisma
        await prisma.$executeRaw `
      UPDATE "Project" 
      SET "content" = ${content} 
      WHERE "id" = ${id}
    `;
        res.json({
            message: 'Project content updated successfully',
            project: {
                id: id,
                content: content
            }
        });
    }
    catch (error) {
        console.error('Error updating project content:', error);
        res.status(500).json({ error: 'Failed to update project content' });
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map