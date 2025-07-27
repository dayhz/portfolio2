import React, { useState } from 'react';
import { ZestyTemplateEditor } from '@/components/TemplateEditor/ZestyTemplateEditor';
import { ZestyTemplateRenderer } from '@/components/TemplateEditor/ZestyTemplateRenderer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const TemplateProjectPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [projectData, setProjectData] = useState({
    title: '',
    heroImage: '',
    challenge: '',
    approach: '',
    client: '',
    year: new Date().getFullYear().toString(),
    duration: '',
    type: '',
    industry: '',
    scope: [],
    image1: '',
    textSection1: '',
    image2: '',
    image3: '',
    image4: '',
    video1: '',
    video1Poster: '',
    video2: '',
    video2Poster: '',
    testimonialQuote: '',
    testimonialAuthor: '',
    testimonialRole: '',
    testimonialImage: '',
    finalImage: '',
    textSection2: '',
    finalImage1: '',
    finalImage2: ''
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Éditeur de Template</h1>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
              <TabsList>
                <TabsTrigger value="edit">Édition</TabsTrigger>
                <TabsTrigger value="preview">Aperçu</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="edit" className="mt-0">
            <div className="p-6">
              <ZestyTemplateEditor />
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="bg-white min-h-screen">
              <ZestyTemplateRenderer projectData={projectData} isPreview={true} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};