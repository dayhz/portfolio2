const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/**
 * API publique pour récupérer les projets publiés
 * Accessible depuis le site principal
 */

// Fonction pour lire les projets depuis le localStorage simulé
function getPublishedProjects() {
  try {
    // Pour l'instant, on simule en lisant depuis un fichier
    // En production, cela viendrait de la base de données
    const projectsFile = path.join(__dirname, '../data/projects.json');
    
    if (!fs.existsSync(projectsFile)) {
      return [];
    }
    
    const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
    return projects.filter(project => project.status === 'published');
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

// GET /api/public/projects - Récupère tous les projets publiés
router.get('/projects', (req, res) => {
  try {
    const projects = getPublishedProjects();
    
    res.json({
      success: true,
      data: projects.map(project => ({
        id: project.id,
        title: project.title,
        client: project.client,
        year: project.year,
        type: project.type,
        industry: project.industry,
        heroImage: project.heroImage,
        challenge: project.challenge,
        scope: project.scope,
        updatedAt: project.updatedAt
      })),
      meta: {
        total: projects.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/public/projects/:id - Récupère un projet spécifique
router.get('/projects/:id', (req, res) => {
  try {
    const projects = getPublishedProjects();
    const project = projects.find(p => p.id === req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or not published'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;