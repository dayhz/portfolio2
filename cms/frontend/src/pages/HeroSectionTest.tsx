import React, { useState } from 'react';
import { HeroSectionEditor } from '../components/services/HeroSectionEditor';
import { HeroSectionData } from '../../shared/types/services';
import { toast } from 'sonner';

export default function HeroSectionTest() {
  const [heroData, setHeroData] = useState<HeroSectionData>({
    title: 'Services de Design & Développement',
    description: '<p>Je crée des expériences digitales <strong>exceptionnelles</strong> qui allient design et fonctionnalité.</p>',
    highlightText: '17+ années d\'expérience'
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: HeroSectionData) => {
    setIsSaving(true);
    // Simuler une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHeroData(data);
    setIsSaving(false);
    toast.success('Section Hero sauvegardée avec succès !');
  };

  const handlePreview = (data: HeroSectionData) => {
    console.log('Preview data:', data);
    toast.info('Aperçu généré (voir console)');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test HeroSectionEditor
          </h1>
          <p className="text-gray-600">
            Page de test pour le composant HeroSectionEditor
          </p>
        </div>

        <HeroSectionEditor
          data={heroData}
          onChange={setHeroData}
          onSave={handleSave}
          onPreview={handlePreview}
          isSaving={isSaving}
          errors={[]}
        />

        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Données actuelles :</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(heroData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}