import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import '../styles/animations.css';

// Types d'animations disponibles
export type AnimationType = 
  | 'fade' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right' 
  | 'scale' 
  | 'none';

// Props pour le composant AnimatedElement
export interface AnimatedElementProps {
  children: React.ReactNode;
  type?: AnimationType;
  duration?: number;
  delay?: number;
  easing?: string;
  className?: string;
  style?: React.CSSProperties;
  onEnter?: () => void;
  onExit?: () => void;
  disabled?: boolean;
}

// Composant pour animer un élément individuel
export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  type = 'fade',
  duration = 300,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  className = '',
  style = {},
  onEnter,
  onExit,
  disabled = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  // Si les animations sont désactivées, rendre directement le contenu
  if (disabled) {
    return <div className={className} style={style}>{children}</div>;
  }

  // Définir les styles d'animation
  const getAnimationStyle = () => {
    const baseStyle: React.CSSProperties = {
      transition: `all ${duration}ms ${easing} ${delay}ms`,
      ...style
    };

    if (!isVisible) {
      switch (type) {
        case 'fade':
          return { ...baseStyle, opacity: 0 };
        case 'slide-up':
          return { ...baseStyle, opacity: 0, transform: 'translateY(20px)' };
        case 'slide-down':
          return { ...baseStyle, opacity: 0, transform: 'translateY(-20px)' };
        case 'slide-left':
          return { ...baseStyle, opacity: 0, transform: 'translateX(20px)' };
        case 'slide-right':
          return { ...baseStyle, opacity: 0, transform: 'translateX(-20px)' };
        case 'scale':
          return { ...baseStyle, opacity: 0, transform: 'scale(0.95)' };
        default:
          return baseStyle;
      }
    }

    return baseStyle;
  };

  return (
    <div
      ref={elementRef}
      className={`animated-element ${className}`}
      style={getAnimationStyle()}
      onTransitionEnd={(e) => {
        if (e.target === elementRef.current) {
          if (isVisible && onEnter) onEnter();
          if (!isVisible && onExit) onExit();
        }
      }}
    >
      {children}
    </div>
  );
};

// Props pour le composant AnimatedTransition
export interface AnimatedTransitionProps {
  children: React.ReactNode;
  in: boolean;
  type?: AnimationType;
  duration?: number;
  unmountOnExit?: boolean;
  className?: string;
  onEnter?: () => void;
  onExit?: () => void;
  disabled?: boolean;
}

// Composant pour les transitions entre états
export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  in: inProp,
  type = 'fade',
  duration = 300,
  unmountOnExit = true,
  className = '',
  onEnter,
  onExit,
  disabled = false
}) => {
  // Si les animations sont désactivées, rendre conditionnellement le contenu
  if (disabled) {
    return inProp ? <div className={className}>{children}</div> : null;
  }

  // Mapper le type d'animation aux classes CSS
  const getClassNames = () => {
    switch (type) {
      case 'fade':
        return 'animate-fade';
      case 'slide-up':
        return 'animate-slide-up';
      case 'slide-down':
        return 'animate-slide-down';
      case 'slide-left':
        return 'animate-slide-left';
      case 'slide-right':
        return 'animate-slide-right';
      case 'scale':
        return 'animate-scale';
      default:
        return '';
    }
  };

  return (
    <CSSTransition
      in={inProp}
      timeout={duration}
      classNames={getClassNames()}
      unmountOnExit={unmountOnExit}
      onEntered={onEnter}
      onExited={onExit}
    >
      <div className={className}>
        {children}
      </div>
    </CSSTransition>
  );
};

// Props pour le composant AnimatedList
export interface AnimatedListProps {
  children: React.ReactNode[];
  type?: AnimationType;
  duration?: number;
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
}

// Composant pour animer une liste d'éléments
export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  type = 'fade',
  duration = 300,
  staggerDelay = 50,
  className = '',
  itemClassName = '',
  disabled = false
}) => {
  // Si les animations sont désactivées, rendre directement la liste
  if (disabled) {
    return (
      <div className={className}>
        {React.Children.map(children, (child, index) => (
          <div key={index} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <AnimatedElement
          key={index}
          type={type}
          duration={duration}
          delay={index * staggerDelay}
          className={itemClassName}
        >
          {child}
        </AnimatedElement>
      ))}
    </div>
  );
};

// Props pour le composant AnimatedGroup
export interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

// Composant pour les animations de groupe (ajout/suppression d'éléments)
export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
  children,
  className = '',
  disabled = false
}) => {
  // Si les animations sont désactivées, rendre directement le contenu
  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <TransitionGroup className={className}>
      {React.Children.map(children, (child, index) => (
        <CSSTransition
          key={index}
          timeout={300}
          classNames="animate-fade"
        >
          {child}
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
};

// Hook pour détecter si les animations devraient être désactivées
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Vérifier la préférence de l'utilisateur pour les animations réduites
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Écouter les changements de préférence
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback pour les anciens navigateurs
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
};

// Composant pour les animations de chargement
export interface LoadingAnimationProps {
  type?: 'spinner' | 'pulse' | 'dots' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  type = 'spinner',
  size = 'medium',
  color = '#3498db',
  className = '',
  style = {}
}) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Déterminer la taille en pixels
  const getSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 24;
      case 'large': return 36;
      default: return 24;
    }
  };

  const sizeInPx = getSize();

  // Si les animations sont réduites, afficher un indicateur statique
  if (prefersReducedMotion) {
    return (
      <div
        className={`loading-indicator-static ${className}`}
        style={{
          width: sizeInPx,
          height: sizeInPx,
          backgroundColor: color,
          borderRadius: '50%',
          opacity: 0.7,
          ...style
        }}
      />
    );
  }

  // Rendre différents types d'animations de chargement
  switch (type) {
    case 'spinner':
      return (
        <div
          className={`loading-spinner ${className}`}
          style={{
            width: sizeInPx,
            height: sizeInPx,
            border: `3px solid rgba(0, 0, 0, 0.1)`,
            borderTopColor: color,
            borderRadius: '50%',
            animation: 'rotate 1s linear infinite',
            ...style
          }}
        />
      );
    
    case 'pulse':
      return (
        <div
          className={`loading-pulse ${className}`}
          style={{
            width: sizeInPx,
            height: sizeInPx,
            backgroundColor: color,
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite',
            ...style
          }}
        />
      );
    
    case 'dots':
      return (
        <div
          className={`loading-dots ${className}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            ...style
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: sizeInPx / 3,
                height: sizeInPx / 3,
                backgroundColor: color,
                borderRadius: '50%',
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      );
    
    case 'skeleton':
      return (
        <div
          className={`loading-skeleton ${className}`}
          style={{
            width: '100%',
            height: sizeInPx,
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            animation: 'shimmer 1.5s infinite',
            backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            ...style
          }}
        />
      );
    
    default:
      return null;
  }
};

export default {
  AnimatedElement,
  AnimatedTransition,
  AnimatedList,
  AnimatedGroup,
  LoadingAnimation,
  useReducedMotion
};