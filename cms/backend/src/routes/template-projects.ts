import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Schéma de validation pour les projets template Zesty
const templateProjectSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  heroImage: z.string().optional().default(''),
  challenge: z.string().optional().default(''),
  approach: z.string().optional().default(''),
  client: z.string().min(1, "Le nom du client est requis"),
  year: z.string().min(1, "L'année est requise"),
  duration: z.string().optional().default(''),
  type: z.string().optional().default(''),
  industry: z.string().optional().default(''),
  scope: z.array(z.string()).optional().default([]),
  image1: z.string().optional().default(''),
  textSection1: z.string().optional().default(''),
  image2: z.string().optional().default(''),
  image3: z.string().optional().default(''),
  image4: z.string().optional().default(''),
  video1: z.string().optional().default(''),
  video1Poster: z.string().optional().default(''),
  video2: z.string().optional().default(''),
  video2Poster: z.string().optional().default(''),
  testimonialQuote: z.string().optional().default(''),
  testimonialAuthor: z.string().optional().default(''),
  testimonialRole: z.string().optional().default(''),
  testimonialImage: z.string().optional().default(''),
  finalImage: z.string().optional().default(''),
  textSection2: z.string().optional().default(''),
  finalImage1: z.string().optional().default(''),
  finalImage2: z.string().optional().default(''),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
});

// Récupérer tous les projets template
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    
    // Construire les filtres
    const where: any = {};
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error('Error updating template project status:', error);
    res.status(500).json({ error: 'Failed to update template project status' });
  }
});

export default router;