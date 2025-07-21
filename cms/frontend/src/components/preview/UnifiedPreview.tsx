import React, { useState, useEffect, useRef } from 'react';
import { usePreview } from '@/contexts/PreviewContext';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import AboutPreview from '@/components/about/AboutPreview';
import { ServicesPreview } from '@/components/services/ServicesPreview';
import { ProjectPreview } from '@/components/ProjectPreview';
import TestimonialsPreview from '@/components/testimonials/TestimonialsPreview';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { htmlExportService } from '@/services/HtmlExportService';

const UnifiedPreview: React.FC = () => {
  const { isPreviewMode, previewType, previewData, setPreviewMode } = usePreview();
  const [isCopied, setIsCopied] = useState(false);
  const notificationSystem = useNotificationSystem();
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  if (!isPreviewMode || !previewType) {
    return null;
  }

  const handleClose = () => {
    setPreviewMode(false);
  };

  const handleCopyHTML = async () => {
    if (!previewRef.current || !previewType) return;
    
    try {
      // Obtenir le contenu HTML du composant de prévisualisation
      const previewContent = previewRef.current.innerHTML;
      
      // Générer le HTML complet avec le service d'export
      const fullHtml = await htmlExportService.exportHtml(previewType, previewContent, {
        includeStyles: true,
        minify: false,
        includeScripts: false
      });
      
      // Copier le HTML dans le presse-papier
      const success = await htmlExportService.copyToClipboard(fullHtml);
      
      if (success) {
        setIsCopied(true);
        notificationSystem.success('Copié !', 'Le code HTML a été copié dans le presse-papier.');
      } else {
        notificationSystem.error('Erreur', 'Impossible de copier le code HTML.');
      }
    } catch (error) {
      console.error('Error generating HTML:', error);
      notificationSystem.error('Erreur', 'Une erreur est survenue lors de la génération du HTML.');
    }
  };

  const handleOpenInNewTab = async () => {
    if (!previewRef.current || !previewType) return;
    
    try {
      // Obtenir le contenu HTML du composant de prévisualisation
      const previewContent = previewRef.current.innerHTML;
      
      // Générer le HTML complet avec le service d'export
      const fullHtml = await htmlExportService.exportHtml(previewType, previewContent, {
        includeStyles: true,
        minify: false,
        includeScripts: false
      });
      
      // Ouvrir le HTML dans un nouvel onglet
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(fullHtml);
        newWindow.document.close();
        notificationSystem.success('Prévisualisation', 'La prévisualisation a été ouverte dans un nouvel onglet.');
      } else {
        notificationSystem.error('Erreur', 'Impossible d\'ouvrir un nouvel onglet. Vérifiez les paramètres de votre navigateur.');
      }
    } catch (error) {
      console.error('Error generating HTML for new tab:', error);
      notificationSystem.error('Erreur', 'Une erreur est survenue lors de la génération du HTML.');
    }
  };

  const renderPreview = () => {
    switch (previewType) {
      case 'about':
        return <AboutPreview {...previewData.about} />;
      case 'services':
        return <ServicesPreview {...previewData.services} />;
      case 'projects':
        return <ProjectPreview projectData={previewData.projects} content={previewData.projects?.content || ''} />;
      case 'testimonials':
        return <TestimonialsPreview data={previewData.testimonials} />;
      default:
        return <div>Type de prévisualisation non pris en charge</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">
            Prévisualisation - {previewType.charAt(0).toUpperCase() + previewType.slice(1)}
          </h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopyHTML}>
              {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {isCopied ? 'Copié' : 'Copier HTML'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleOpenInNewTab}>
              <ExternalLink className="h-4 w-4 mr-1" />
              Ouvrir
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div ref={previewRef} className="bg-gray-100 rounded-lg p-4 min-h-full">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedPreview;