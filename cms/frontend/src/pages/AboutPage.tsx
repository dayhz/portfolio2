import { useState } from 'react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import {
  BiographyEditor,
  StatisticsEditor,
  AwardsEditor,
  PhotoGalleryEditor,
  SocialLinksEditor,
  AboutPreview
} from '@/components/about';

// Types
interface Photo {
  id: string;
  url: string;
  alt: string;
}

// Mock data - In a real application, this would come from an API
const initialBiography = `I started my professional career at 18 and lost count of how many designs I've created for clients or just for fun.

Being a designer for 17+ years has given me extensive experience working on all sorts of projects, from big corporations to small startups, collaborating with clients, design teams, and development squads.

For the last 7 years, I've been a full-time independent product designer, working with clients from all around the globe. I've also given tons of mentoring sessions to design students.

I love video games, movies, pizza and pasta.`;

const initialStatistics = [
  { id: 'stat-1', label: 'Années d\'expérience', value: '17+' },
  { id: 'stat-2', label: 'Âge', value: '35' },
  { id: 'stat-3', label: 'Sessions de mentorat', value: '400+' },
  { id: 'stat-4', label: 'Burgers dévorés', value: '80+' },
  { id: 'stat-5', label: 'Pays visités', value: '4' }
];

const initialAwards = [
  { id: 'award-1', name: 'Awwwards', description: 'Honors — Jun 4th', link: 'https://www.awwwards.com/sites/victor-berbel-portfolio-2025' },
  { id: 'award-2', name: 'CSS Website Awards', description: 'Website of the day — Jun 1st', link: 'https://www.cssdesignawards.com/sites/victor-berbel-portfolio-2025/47530/' },
  { id: 'award-3', name: 'Vice Website Awards', description: 'Website of the day — Jun 23rd', link: 'https://www.website-award.com/sotd/victor-berbel-portfolio-2025' },
  { id: 'award-4', name: '68Design', description: 'Featured in the gallery — May 25th', link: 'https://www.68design.net/cool/?p=3' }
];

const initialPhotos: Photo[] = [
  // In a real application, these would be loaded from an API
];

const initialSocialLinks = [
  { id: 'link-1', platform: 'LinkedIn', url: 'https://www.linkedin.com/in/victorberbel/', icon: 'linkedin' },
  { id: 'link-2', platform: 'Twitter', url: 'https://twitter.com/victorberbel', icon: 'twitter' },
  { id: 'link-3', platform: 'Instagram', url: 'https://www.instagram.com/victorberbel/', icon: 'instagram' },
  { id: 'link-4', platform: 'Dribbble', url: 'https://dribbble.com/victorberbel', icon: 'dribbble' }
];

export default function AboutPage() {
  const [biography, setBiography] = useState(initialBiography);
  const [statistics, setStatistics] = useState(initialStatistics);
  const [awards, setAwards] = useState(initialAwards);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [socialLinks, setSocialLinks] = useState(initialSocialLinks);
  const notificationSystem = useNotificationSystem();

  // These functions would make API calls in a real application
  const saveBiography = async (newBiography: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setBiography(newBiography);
      notificationSystem.success('Biographie mise à jour', 'Votre biographie a été enregistrée avec succès.');
      return Promise.resolve();
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder la biographie.');
      return Promise.reject(error);
    }
  };

  const saveStatistics = async (newStatistics: typeof statistics) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setStatistics(newStatistics);
      notificationSystem.success('Statistiques mises à jour', 'Vos statistiques ont été enregistrées avec succès.');
      return Promise.resolve();
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder les statistiques.');
      return Promise.reject(error);
    }
  };

  const saveAwards = async (newAwards: typeof awards) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setAwards(newAwards);
      notificationSystem.success('Récompenses mises à jour', 'Vos récompenses ont été enregistrées avec succès.');
      return Promise.resolve();
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder les récompenses.');
      return Promise.reject(error);
    }
  };

  const savePhotos = async (newPhotos: typeof photos) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setPhotos(newPhotos);
      notificationSystem.success('Photos mises à jour', 'Vos photos ont été enregistrées avec succès.');
      return Promise.resolve();
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder les photos.');
      return Promise.reject(error);
    }
  };

  const saveSocialLinks = async (newLinks: typeof socialLinks) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSocialLinks(newLinks);
      notificationSystem.success('Liens sociaux mis à jour', 'Vos liens sociaux ont été enregistrés avec succès.');
      return Promise.resolve();
    } catch (error) {
      notificationSystem.error('Erreur', 'Impossible de sauvegarder les liens sociaux.');
      return Promise.reject(error);
    }
  };

  const uploadPhoto = async (file: File) => {
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a temporary URL for the uploaded file
    const url = URL.createObjectURL(file);
    
    // In a real application, this would return the URL from the server
    return { url };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">À Propos</h1>
          <p className="text-gray-600 mt-2">
            Gérez votre biographie, statistiques et récompenses
          </p>
        </div>
      </div>

      {/* Biography */}
      <BiographyEditor initialBiography={biography} onSave={saveBiography} />

      {/* Statistics */}
      <StatisticsEditor initialStatistics={statistics} onSave={saveStatistics} />

      {/* Awards */}
      <AwardsEditor initialAwards={awards} onSave={saveAwards} />

      {/* Personal Photos */}
      <PhotoGalleryEditor initialPhotos={photos} onSave={savePhotos} onUpload={uploadPhoto} />

      {/* Social Links */}
      <SocialLinksEditor initialLinks={socialLinks} onSave={saveSocialLinks} />

      {/* Preview */}
      <AboutPreview 
        biography={biography}
        statistics={statistics}
        awards={awards}
        photos={photos}
        socialLinks={socialLinks}
      />
    </div>
  );
}