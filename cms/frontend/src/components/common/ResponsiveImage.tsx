import React from 'react';
import { LazyImage } from './LazyImage';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  className?: string;
  lazy?: boolean;
  thumbnail?: string;
  variants?: Array<{
    url: string;
    width: number;
    height?: number;
  }>;
  onLoad?: () => void;
  onError?: () => void;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  srcSet,
  sizes = '(max-width: 320px) 320px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1920px',
  className = '',
  lazy = true,
  thumbnail,
  variants,
  onLoad,
  onError
}) => {
  // Generate srcSet from variants if not provided
  const generatedSrcSet = srcSet || (variants ? 
    variants.map(variant => `${variant.url} ${variant.width}w`).join(', ') : 
    undefined
  );

  // Use thumbnail as placeholder if available
  const placeholder = thumbnail || undefined;

  if (lazy) {
    return (
      <LazyImage
        src={src}
        alt={alt}
        srcSet={generatedSrcSet}
        sizes={sizes}
        className={className}
        placeholder={placeholder}
        onLoad={onLoad}
        onError={onError}
      />
    );
  }

  return (
    <img
      src={src}
      srcSet={generatedSrcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={onError}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};

// Picture element for more control over responsive images
interface ResponsivePictureProps {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
  sources?: Array<{
    srcSet: string;
    media?: string;
    type?: string;
  }>;
  onLoad?: () => void;
  onError?: () => void;
}

export const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  src,
  alt,
  className = '',
  lazy = true,
  sources = [],
  onLoad,
  onError
}) => {
  return (
    <picture className={className}>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <ResponsiveImage
        src={src}
        alt={alt}
        lazy={lazy}
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  );
};