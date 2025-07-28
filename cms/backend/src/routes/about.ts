import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/about - Récupérer les données de la page About
router.get('/', async (req, res) => {
  try {
    // Pour l'instant, retourner des données mockées
    // Plus tard, on récupérera les vraies données de la base
    const aboutData = {
      biography: `Hey, Je suis Victor Berbel,
Je transforme vos idées en d'applications mobile, web en produits concrets, utiles et élégants, et ce, depuis plus de dix ans.

Being a designer for 17+ years has given me extensive experience working on all sorts of projects, from big corporations to small startups, collaborating with clients, design teams, and development squads.

For the last 7 years, I've been a full-time independent product designer, working with clients from all around the globe. I've also given tons of mentoring sessions to design students.

I love video games, movies, pizza and pasta.`,
      
      statistics: [
        { id: 'stat-1', label: 'Years of experience', value: '17+' },
        { id: 'stat-2', label: 'Years old', value: '35' },
        { id: 'stat-3', label: 'Mentoring sessions', value: '400+' },
        { id: 'stat-4', label: 'Burgers devoured', value: '80+' },
        { id: 'stat-5', label: 'Countries visited', value: '4' }
      ],
      
      awards: [
        { 
          id: 'award-1', 
          name: 'Awwwards', 
          description: 'Honors — Jun 4th', 
          link: 'https://www.awwwards.com/sites/victor-berbel-portfolio-2025' 
        },
        { 
          id: 'award-2', 
          name: 'CSS Website Awards', 
          description: 'Website of the day — Jun 1st', 
          link: 'https://www.cssdesignawards.com/sites/victor-berbel-portfolio-2025/47530/' 
        },
        { 
          id: 'award-3', 
          name: 'Vice Website Awards', 
          description: 'Website of the day — Jun 23rd', 
          link: 'https://www.website-award.com/sotd/victor-berbel-portfolio-2025' 
        },
        { 
          id: 'award-4', 
          name: '68Design', 
          description: 'Featured in the gallery — May 25th', 
          link: 'https://www.68design.net/cool/?p=3' 
        }
      ],
      
      socialLinks: [
        { id: 'link-1', platform: 'LinkedIn', url: 'https://www.linkedin.com/in/victorberbel/', icon: 'linkedin' },
        { id: 'link-2', platform: 'Twitter', url: 'https://twitter.com/victorberbel', icon: 'twitter' },
        { id: 'link-3', platform: 'Instagram', url: 'https://www.instagram.com/victorberbel/', icon: 'instagram' },
        { id: 'link-4', platform: 'Dribbble', url: 'https://dribbble.com/victorberbel', icon: 'dribbble' }
      ]
    };

    res.json(aboutData);
    
  } catch (error) {
    console.error('Error fetching about data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch about data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;