/**
 * Hook pour utiliser le service d'export de contenu
 */

import { useState, useCallback } from 'react';
import { ContentExportService, ExportOptions, ValidationResult } from '../services/ContentExportService';

interface UseContentExportOptions {
  defaultTemplate?: string;
  onExport?: (exportedContent: string) => void;
  onValidationError?: (validationResult: ValidationResult) => void;
}

export function useContentExport({
  defaultTemplate = 'poesial',
  onExport,
  onValidationError
}: UseContentExportOptions = {}) {
  const [exportedContent, setExportedContent] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplate);
  const [isExporting, setIsExporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  
  // Exporter le contenu
  const exportContent = useCallback((content: string, options: ExportOptions = {}) => {
    setIsExporting(true);
    
    try {
      // Valider le contenu
      const validation = ContentExportService.validateContent(content);
      setValidationResult(validation);
      
      // Si la validation échoue et qu'un handler est fourni, l'appeler
      if (!validation.isValid && onValidationError) {
        onValidationError(validation);
      }
      
      // Exporter le contenu même s'il y a des avertissements
      const exported = ContentExportService.exportToSiteFormat(content, {
        ...options,
        validateContent: false // Déjà validé
      });
      
      setExportedContent(exported);
      
      // Appeler le callback si fourni
      if (onExport) {
        onExport(exported);
      }
      
      return exported;
    } catch (error) {
      console.error('Erreur lors de l\'export du contenu:', error);
      return null;
    } finally {
      setIsExporting(false);
    }
  }, [onExport, onValidationError]);
  
  // Intégrer le contenu dans un template
  const integrateWithTemplate = useCallback((content: string, templateName: string = selectedTemplate, metadata: Record<string, any> = {}) => {
    try {
      const integrated = ContentExportService.integrateWithTemplate(content, templateName, metadata);
      return integrated;
    } catch (error) {
      console.error('Erreur lors de l\'intégration du contenu dans le template:', error);
      return null;
    }
  }, [selectedTemplate]);
  
  // Exporter au format JSON
  const exportToJson = useCallback((content: string, metadata: Record<string, any> = {}) => {
    try {
      return ContentExportService.exportToJson(content, metadata);
    } catch (error) {
      console.error('Erreur lors de l\'export au format JSON:', error);
      return null;
    }
  }, []);
  
  // Changer le template sélectionné
  const changeTemplate = useCallback((templateName: string) => {
    setSelectedTemplate(templateName);
  }, []);
  
  // Fonction pour définir directement le contenu exporté (pour le débogage)
  const setExportedContentDirectly = useCallback((content: string) => {
    setExportedContent(content);
  }, []);
  
  return {
    exportContent,
    integrateWithTemplate,
    exportToJson,
    changeTemplate,
    selectedTemplate,
    exportedContent,
    setExportedContent: setExportedContentDirectly,
    isExporting,
    validationResult
  };
}