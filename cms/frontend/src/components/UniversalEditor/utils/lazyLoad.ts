/**
 * Utilitaires pour le lazy loading des composants
 */

import React, { lazy, Suspense } from 'react';

// Type pour les composants lazy loadés
export type LazyComponent<T = any> = React.LazyExoticComponent<React.ComponentType<T>>;

/**
 * Crée un composant lazy loadé avec Suspense et fallback
 * @param importFn Fonction d'import dynamique
 * @param fallback Composant de fallback à afficher pendant le chargement
 * @returns Composant lazy loadé avec Suspense
 */
export function createLazyComponent<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback: React.ReactNode = null
): React.FC<T> {
  const LazyComponent = lazy(importFn);
  
  return (props: T) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Précharge un composant lazy loadé
 * @param importFn Fonction d'import dynamique
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  importFn().catch(err => console.error('Erreur de préchargement:', err));
}

/**
 * Crée un composant lazy loadé avec un fallback personnalisé
 * @param path Chemin du composant à importer
 * @param name Nom du composant pour le fallback
 * @returns Composant lazy loadé avec Suspense
 */
export function lazyWithFallback<T = any>(
  path: string,
  name: string
): React.FC<T> {
  const importFn = () => import(/* webpackChunkName: "[request]" */ `../${path}`);
  
  const fallback = (
    <div className="lazy-loading-fallback">
      <div className="loading-indicator"></div>
      <div className="loading-text">Chargement {name}...</div>
      <style jsx>{`
        .lazy-loading-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          min-height: 100px;
          background-color: #f9fafb;
          border-radius: 0.5rem;
          border: 1px dashed #e5e7eb;
        }
        
        .loading-indicator {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.5rem;
        }
        
        .loading-text {
          font-size: 0.875rem;
          color: #6b7280;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
  
  return createLazyComponent(importFn, fallback);
}