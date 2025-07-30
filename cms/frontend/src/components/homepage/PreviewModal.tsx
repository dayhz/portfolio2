import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { homepageAPI } from '../../api/homepage';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionData?: any;
  sectionType?: string;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export function PreviewModal({ isOpen, onClose, sectionData, sectionType }: PreviewModalProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Fetch all homepage content for full preview
  const { data: homepageData, isLoading: isLoadingData, refetch } = useQuery({
    queryKey: ['homepage', 'preview'],
    queryFn: () => homepageAPI.getAllContent(),
    enabled: isOpen,
  });

  // Generate preview URL when modal opens
  useEffect(() => {
    if (isOpen && homepageData) {
      generatePreviewUrl();
    }
  }, [isOpen, homepageData, sectionData]);

  const generatePreviewUrl = async () => {
    setIsLoading(true);
    try {
      // Merge current section data with existing homepage data
      const mergedData = { ...homepageData };
      if (sectionData && sectionType) {
        mergedData[sectionType] = sectionData;
      }

      // TODO: Generate actual preview URL with merged data
      // For now, simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPreviewUrl(`${window.location.origin}/preview?timestamp=${Date.now()}`);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceStyles = (device: DeviceType) => {
    switch (device) {
      case 'desktop':
        return 'w-full h-full';
      case 'tablet':
        return 'w-[768px] h-[1024px] mx-auto';
      case 'mobile':
        return 'w-[375px] h-[667px] mx-auto';
      default:
        return 'w-full h-full';
    }
  };

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const handleRefresh = () => {
    refetch();
    generatePreviewUrl();
  };

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Prévisualisation de la Homepage</DialogTitle>
              {sectionType && (
                <p className="text-sm text-gray-600 mt-1">
                  Aperçu avec les modifications de la section {sectionType}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Actualiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                disabled={!previewUrl}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir dans un nouvel onglet
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {/* Device Selection */}
          <div className="px-6 py-3 border-b bg-gray-50">
            <Tabs value={activeDevice} onValueChange={(value) => setActiveDevice(value as DeviceType)}>
              <TabsList className="grid w-fit grid-cols-3">
                <TabsTrigger value="desktop" className="flex items-center gap-2">
                  {getDeviceIcon('desktop')}
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="tablet" className="flex items-center gap-2">
                  {getDeviceIcon('tablet')}
                  Tablette
                </TabsTrigger>
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  {getDeviceIcon('mobile')}
                  Mobile
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-6 bg-gray-100 overflow-auto">
            {isLoadingData || isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Génération de l'aperçu...</p>
                </div>
              </div>
            ) : previewUrl ? (
              <div className={`${getDeviceStyles(activeDevice)} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg`}>
                <iframe
                  src={previewUrl}
                  className="w-full h-full"
                  title="Homepage Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Impossible de générer l'aperçu</p>
                  <Button onClick={handleRefresh} variant="outline">
                    Réessayer
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="px-6 py-3 border-t bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {activeDevice === 'desktop' && '1920x1080'}
                  {activeDevice === 'tablet' && '768x1024'}
                  {activeDevice === 'mobile' && '375x667'}
                </Badge>
                {sectionData && (
                  <Badge variant="secondary">
                    Modifications en cours incluses
                  </Badge>
                )}
              </div>
              <p className="text-gray-500">
                Cet aperçu reflète vos modifications actuelles
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}