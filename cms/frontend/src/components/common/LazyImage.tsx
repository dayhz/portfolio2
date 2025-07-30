import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  srcSet?: string;
  sizes?: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  srcSet,
  sizes,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`lazy-image-container ${className}`} style={{ position: 'relative' }}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="lazy-image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(5px)',
            transition: 'opacity 0.3s ease'
          }}
        />
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        srcSet={isInView && srcSet ? srcSet : undefined}
        sizes={sizes}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className="lazy-image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        loading="lazy"
      />
      
      {/* Error state */}
      {hasError && (
        <div
          className="lazy-image-error"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            color: '#999',
            fontSize: '14px'
          }}
        >
          Failed to load image
        </div>
      )}
    </div>
  );
};

// Hook for lazy loading multiple images
export const useLazyImages = (imageRefs: React.RefObject<HTMLElement>[], threshold = 0.1) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    const observers = imageRefs.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setLoadedImages(prev => new Set(prev).add(index));
            observer.disconnect();
          }
        },
        { threshold }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return observer;
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [imageRefs, threshold]);

  return loadedImages;
};