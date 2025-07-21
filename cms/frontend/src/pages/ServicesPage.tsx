import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceEditor from '@/components/services/ServiceEditor';
import ProcessStepsEditor from '@/components/services/ProcessStepsEditor';
import SkillsEditor from '@/components/services/SkillsEditor';
import VideoUploader from '@/components/services/VideoUploader';
import { Card } from '@/components/ui/card';

const ServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('services');
  
  // Données pour les services
  const [services, setServices] = useState([
    {
      id: '1',
      title: 'Développement Web',
      description: 'Création de sites web modernes et responsives avec les dernières technologies.',
      icon: 'Code',
      order: 1
    },
    {
      id: '2',
      title: 'Design UI/UX',
      description: 'Conception d\'interfaces utilisateur intuitives et expériences utilisateur optimales.',
      icon: 'Edit',
      order: 2
    },
    {
      id: '3',
      title: 'Consultation',
      description: 'Conseils stratégiques pour optimiser votre présence numérique et vos processus.',
      icon: 'Chat',
      order: 3
    }
  ]);
  
  // Données pour les étapes du processus
  const [processSteps, setProcessSteps] = useState([
    {
      id: '1',
      title: 'Découverte',
      description: 'Analyse de vos besoins et objectifs pour comprendre votre projet.',
      icon: 'Search',
      order: 1
    },
    {
      id: '2',
      title: 'Conception',
      description: 'Création de maquettes et prototypes pour visualiser le projet.',
      icon: 'Edit',
      order: 2
    },
    {
      id: '3',
      title: 'Développement',
      description: 'Programmation et intégration des fonctionnalités.',
      icon: 'Code',
      order: 3
    },
    {
      id: '4',
      title: 'Livraison',
      description: 'Tests finaux et mise en ligne de votre projet.',
      icon: 'Send',
      order: 4
    }
  ]);
  
  // Données pour les compétences
  const [skills, setSkills] = useState([
    { id: 'skill-1', name: 'React', category: 'frontend', level: 90 },
    { id: 'skill-2', name: 'TypeScript', category: 'frontend', level: 85 },
    { id: 'skill-3', name: 'Node.js', category: 'backend', level: 80 },
    { id: 'skill-4', name: 'Figma', category: 'design', level: 75 },
    { id: 'skill-5', name: 'Docker', category: 'devops', level: 70 }
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Gestion des Services</h1>
      <p className="text-gray-500 mb-6">
        Gérez les services, le processus de travail, les compétences et les vidéos de présentation qui seront affichés sur votre site.
      </p>
      
      <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="process">Processus</TabsTrigger>
          <TabsTrigger value="skills">Compétences</TabsTrigger>
          <TabsTrigger value="video">Vidéo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Services</h2>
            <p className="text-gray-500 mb-6">
              Gérez les 3 services principaux que vous proposez. Vous pourrez modifier leur titre, description et icône.
            </p>
            <ServiceEditor services={services} onUpdate={setServices} />
          </Card>
        </TabsContent>
        
        <TabsContent value="process">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Processus</h2>
            <p className="text-gray-500 mb-6">
              Décrivez votre processus de travail en 4 étapes. Chaque étape pourra avoir un titre, une description et une icône.
            </p>
            <ProcessStepsEditor steps={processSteps} onUpdate={setProcessSteps} />
          </Card>
        </TabsContent>
        
        <TabsContent value="skills">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Compétences</h2>
            <p className="text-gray-500 mb-6">
              Ajoutez et gérez vos compétences techniques avec leur niveau de maîtrise.
            </p>
            <SkillsEditor skills={skills} onUpdate={setSkills} />
          </Card>
        </TabsContent>
        
        <TabsContent value="video">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Vidéo</h2>
            <p className="text-gray-500 mb-6">
              Téléchargez une vidéo de présentation de vos services qui sera affichée sur votre site.
            </p>
            <VideoUploader />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServicesPage;