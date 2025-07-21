import React, { createContext, useContext, useState, ReactNode } from 'react';

type PreviewType = 'about' | 'services' | 'projects' | 'testimonials';

interface PreviewData {
  about?: any;
  services?: any;
  projects?: any;
  testimonials?: any;
}

interface PreviewContextType {
  isPreviewMode: boolean;
  previewType: PreviewType | null;
  previewData: PreviewData;
  setPreviewMode: (isPreview: boolean) => void;
  setPreviewType: (type: PreviewType | null) => void;
  setPreviewData: (type: PreviewType, data: any) => void;
  clearPreview: () => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewType, setPreviewType] = useState<PreviewType | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData>({});

  const setPreviewMode = (isPreview: boolean) => {
    setIsPreviewMode(isPreview);
    if (!isPreview) {
      clearPreview();
    }
  };

  const updatePreviewData = (type: PreviewType, data: any) => {
    setPreviewData((prevData) => ({
      ...prevData,
      [type]: data,
    }));
  };

  const clearPreview = () => {
    setPreviewType(null);
    setPreviewData({});
  };

  return (
    <PreviewContext.Provider
      value={{
        isPreviewMode,
        previewType,
        previewData,
        setPreviewMode,
        setPreviewType,
        setPreviewData: updatePreviewData,
        clearPreview,
      }}
    >
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = (): PreviewContextType => {
  const context = useContext(PreviewContext);
  if (context === undefined) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};