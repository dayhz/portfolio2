import { usePreview } from '@/contexts/PreviewContext';
// import { useNotificationSystem } from '@/hooks/useNotificationSystem';

type PreviewType = 'about' | 'services' | 'projects' | 'testimonials';

export const usePreviewMode = (type: PreviewType) => {
  const { setPreviewMode, setPreviewType, setPreviewData } = usePreview();
//   const notificationSystem = useNotificationSystem();

  const showPreview = (data: any) => {
    setPreviewType(type);
    setPreviewData(type, data);
    setPreviewMode(true);
    notificationSystem.info('Prévisualisation', `Mode prévisualisation activé pour ${type}`);
  };

  return { showPreview };
};