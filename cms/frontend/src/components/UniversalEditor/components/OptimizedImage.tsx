/**
 * Composant d'image optimisé avec lazy loading, placeholder et optimisation
 */

import React, { useState, useEffect, useRef } from 'react';
import { mediaOptimizationService } from '../services/MediaOptimizationService';
import { cacheService, CacheEntryType } from '../services/CacheService';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  placeholderColor?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  quality?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  blurhash?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  onLoad,
  onError,
  placeholderColor = '#f3f4f6',
  style = {},
  priority = false,
  quality = 85,
  objectFit = 'cover',
  blurhash
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [isVisible, setIsVisible] = useState(false);

  // Calculer le ratio d'aspect pour le placeholder
  const aspectRatio = width && height ? (height / width) * 100 : 56.25; // 16:9 par défaut

  // Utiliser IntersectionObserver pour le lazy loading
  useEffect(() => {
    if (priority) {
      // Charger immédiatement si prioritaire
      setShouldLoad(true);
      return;
    }

    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        setShouldLoad(true);
        observerRef.current?.disconnect();
      }
    }, {
      rootMargin: '200px', // Charger l'image quand elle est à 200px de la viewport
      threshold: 0.01
    });

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Optimiser l'image quand elle doit être chargée
  useEffect(() => {
    if (!shouldLoad) return;

    // Vérifier si l'URL est déjà dans le cache
    const cacheKey = `optimized:${src}-${width || 'auto'}-${height || 'auto'}-${quality}`;
    const cachedUrl = cacheService.get<string>(cacheKey);

    if (cachedUrl) {
      setOptimizedSrc(cachedUrl);
      return;
    }

    // Si c'est une URL distante, précharger l'image
    if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) {
      mediaOptimizationService.preloadImage(src)
        .then(optimizedUrl => {
          setOptimizedSrc(optimizedUrl);
          
          // Mettre en cache
          cacheService.set(
            cacheKey,
            optimizedUrl,
            1024, // Taille estimée
            CacheEntryType.IMAGE,
            { originalSrc: src }
          );
        })
        .catch(error => {
          console.error('Erreur lors du préchargement de l\'image:', error);
          setOptimizedSrc(src); // Utiliser l'URL originale en cas d'erreur
          setIsError(true);
        });
    } else {
      // Utiliser l'URL originale si ce n'est pas une URL distante
      setOptimizedSrc(src);
    }
  }, [shouldLoad, src, width, height, quality]);

  // Gestionnaires d'événements
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsError(true);
    if (onError) onError();
  };

  // Nettoyer les ressources lors du démontage
  useEffect(() => {
    return () => {
      // Libérer les URL d'objets si nécessaire
      if (optimizedSrc && (optimizedSrc.startsWith('blob:') || optimizedSrc !== src)) {
        // Ne pas révoquer directement, car l'URL peut être utilisée ailleurs
        // Le CacheService s'occupera du nettoyage
      }
    };
  }, [optimizedSrc, src]);

  return (
    <div
      ref={containerRef}
      className={`optimized-image-container ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: placeholderColor,
        paddingBottom: `${aspectRatio}%`,
        ...style
      }}
      data-loaded={isLoaded}
      data-error={isError}
    >
      {/* Blurhash ou placeholder coloré */}
      {!isLoaded && blurhash && (
        <div
          className="blurhash-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${blurhash})`,
            backgroundSize: 'cover',
            filter: 'blur(20px)',
            transform: 'scale(1.2)'
          }}
        />
      )}

      {/* Image optimisée */}
      {optimizedSrc && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}

      {/* Indicateur de chargement */}
      {shouldLoad && !isLoaded && !isError && (
        <div
          className="loading-indicator"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <div
            className="spinner"
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(0, 0, 0, 0.1)',
              borderTop: '3px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Indicateur d'erreur */}
      {isError && (
        <div
          className="error-indicator"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            color: '#6b7280',
            fontSize: '14px',
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖼️</div>
            <div>Impossible de charger l'image</div>
            <button
              onClick={() => {
                setIsError(false);
                setIsLoaded(false);
                setOptimizedSrc(null);
                setShouldLoad(true);
              }}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#e5e7eb',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}