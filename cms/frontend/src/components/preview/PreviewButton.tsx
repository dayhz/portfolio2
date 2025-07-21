import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { usePreviewMode } from '@/hooks/usePreviewMode';

type PreviewType = 'about' | 'services' | 'projects' | 'testimonials';

interface PreviewButtonProps {
  type: PreviewType;
  data: any;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ type, data, variant = 'outline' }) => {
  const { showPreview } = usePreviewMode(type);

  return (
    <Button variant={variant} onClick={() => showPreview(data)}>
      <Eye className="h-4 w-4 mr-2" />
      Prévisualiser
    </Button>
  );
};

export default PreviewButton;