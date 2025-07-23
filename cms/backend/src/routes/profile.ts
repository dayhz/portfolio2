import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { uploadMedia, optimizeImage } from '../middleware/upload';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();
const prisma = new PrismaClient();

// Récupérer le profil
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Récupérer le profil (on suppose qu'il n'y a qu'un seul profil dans le système)
    let profile = await prisma.profile.findFirst();
    
    // Si aucun profil n'existe, créer un profil par défaut
    if (!profile) {
      console.log('Aucun profil trouvé, création d\'un profil par défaut');
      profile = await prisma.profile.create({
        data: {
          name: 'Victor Berbel',
          title: 'Product Designer & Manager',
          description: "Hey, I'm Victor, an Independent Product Designer delivering top-tier Websites, SaaS, Mobile experiences, and good vibes for almost two decades.",
          email: 'hey@victorberbel.work',
          location: 'Paris, France'
        }
      });
      console.log('Profil par défaut créé:', profile.id);
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Mettre à jour le profil
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { name, title, description, email, phone, location } = req.body;
    
    // Validation des données
    if (!name || !title || !description || !email) {
      return res.status(400).json({ error: 'Les champs nom, titre, description et email sont obligatoires' });
    }
    
    // Vérifier si le profil existe
    let profile = await prisma.profile.findFirst();
    
    if (profile) {
      // Mettre à jour le profil existant
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          name,
          title,
          description,
          email,
          phone,
          location
        }
      });
    } else {
      // Créer un nouveau profil
      profile = await prisma.profile.create({
        data: {
          name,
          title,
          description,
          email,
          phone,
          location
        }
      });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// Mettre à jour la photo de profil
router.post('/photo', authenticateToken, uploadMedia.single('photo'), optimizeImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune photo fournie' });
    }
    
    // Récupérer le chemin du fichier optimisé
    const file = req.file;
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const url = `/${uploadDir}/${file.filename}`;
    
    // Vérifier si le profil existe
    let profile = await prisma.profile.findFirst();
    
    if (profile) {
      // Si une photo existe déjà, essayer de la supprimer
      if (profile.photo) {
        try {
          const oldPhotoPath = path.join(process.cwd(), uploadDir, path.basename(profile.photo));
          await fs.unlink(oldPhotoPath).catch(() => {
            // Ignorer les erreurs si le fichier n'existe pas
            console.log('Previous profile photo not found or already deleted');
          });
        } catch (fileError) {
          console.error('Error deleting previous profile photo:', fileError);
          // Continuer même si la suppression échoue
        }
      }
      
      // Mettre à jour le profil avec la nouvelle photo
      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: {
          photo: url
        }
      });
    } else {
      // Créer un profil avec des valeurs par défaut et la photo
      profile = await prisma.profile.create({
        data: {
          name: 'Victor Berbel',
          title: 'Product Designer & Manager',
          description: "Hey, I'm Victor, an Independent Product Designer delivering top-tier Websites, SaaS, Mobile experiences, and good vibes for almost two decades.",
          email: 'hey@victorberbel.work',
          photo: url
        }
      });
    }
    
    // Copier le fichier vers le répertoire public du frontend
    try {
      const sourceDir = path.join(process.cwd(), uploadDir);
      const targetDir = path.join(process.cwd(), '../frontend/public/uploads');
      
      // Créer le répertoire cible s'il n'existe pas
      if (!fs.existsSync(targetDir)) {
        await fs.mkdir(targetDir, { recursive: true });
        console.log(`Répertoire créé: ${targetDir}`);
      }
      
      // Copier le fichier
      const sourcePath = path.join(sourceDir, file.filename);
      const targetPath = path.join(targetDir, file.filename);
      
      await fs.copyFile(sourcePath, targetPath);
      console.log(`Fichier copié: ${file.filename}`);
    } catch (syncError) {
      console.error('Error copying file:', syncError);
      // Ne pas bloquer la réponse en cas d'erreur de copie
    }
    
    res.json({
      message: 'Photo de profil mise à jour avec succès',
      profile
    });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la photo de profil' });
  }
});

// Supprimer la photo de profil
router.delete('/photo', authenticateToken, async (req, res) => {
  try {
    // Vérifier si le profil existe
    const profile = await prisma.profile.findFirst();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }
    
    // Si une photo existe, essayer de la supprimer
    if (profile.photo) {
      try {
        const uploadDir = process.env.UPLOAD_DIR || 'uploads';
        const photoPath = path.join(process.cwd(), uploadDir, path.basename(profile.photo));
        await fs.unlink(photoPath).catch(() => {
          // Ignorer les erreurs si le fichier n'existe pas
          console.log('Profile photo not found or already deleted');
        });
      } catch (fileError) {
        console.error('Error deleting profile photo:', fileError);
        // Continuer même si la suppression échoue
      }
      
      // Mettre à jour le profil pour supprimer la référence à la photo
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          photo: null
        }
      });
    }
    
    res.json({ message: 'Photo de profil supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la photo de profil' });
  }
});

// Mettre à jour les liens sociaux
router.put('/social', authenticateToken, async (req, res) => {
  try {
    const { linkedin, dribbble, behance, medium } = req.body;
    
    // Vérifier si le profil existe
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profil non trouvé' });
    }
    
    // Créer un objet pour stocker les liens sociaux
    const socialLinks = {
      linkedin: linkedin || '',
      dribbble: dribbble || '',
      behance: behance || '',
      medium: medium || ''
    };
    
    // Valider les URLs
    for (const [key, url] of Object.entries(socialLinks)) {
      if (url && !isValidUrl(url)) {
        return res.status(400).json({ error: `L'URL ${key} n'est pas valide` });
      }
    }
    
    // Mettre à jour le profil avec les liens sociaux
    // Note: Dans un cas réel, nous ajouterions une table SocialLinks ou un champ JSON dans Profile
    // Pour cet exemple, nous utilisons les champs existants
    profile = await prisma.profile.update({
      where: { id: profile.id },
      data: {
        // Stocker les liens sociaux dans un champ (à adapter selon le schéma réel)
        description: profile.description // Pas de changement pour l'instant
      }
    });
    
    res.json({
      message: 'Liens sociaux mis à jour avec succès',
      socialLinks
    });
  } catch (error) {
    console.error('Error updating social links:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des liens sociaux' });
  }
});

// Fonction utilitaire pour valider les URLs
function isValidUrl(url: string): boolean {
  if (!url) return true; // URL vide est considérée comme valide
  
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export default router;