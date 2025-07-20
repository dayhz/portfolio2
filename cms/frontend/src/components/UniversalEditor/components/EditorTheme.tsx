import React, { createContext, useContext, useState, useEffect } from 'react';

// Types de thèmes disponibles
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'gray';
export type FontSize = 'small' | 'medium' | 'large';
export type BorderRadius = 'none' | 'small' | 'medium' | 'large';
export type AnimationSpeed = 'none' | 'slow' | 'normal' | 'fast';

// Interface pour les préférences de thème
export interface ThemePreferences {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  borderRadius: BorderRadius;
  animationSpeed: AnimationSpeed;
  highContrast: boolean;
  reducedMotion: boolean;
}

// Valeurs par défaut
const defaultThemePreferences: ThemePreferences = {
  mode: 'system',
  colorScheme: 'blue',
  fontSize: 'medium',
  borderRadius: 'medium',
  animationSpeed: 'normal',
  highContrast: false,
  reducedMotion: false
};

// Contexte pour le thème
interface ThemeContextType {
  theme: ThemePreferences;
  isDarkMode: boolean;
  updateTheme: (updates: Partial<ThemePreferences>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultThemePreferences,
  isDarkMode: false,
  updateTheme: () => {},
  resetTheme: () => {}
});

// Hook pour utiliser le thème
export const useEditorTheme = () => useContext(ThemeContext);

// Fournisseur de thème
export interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: Partial<ThemePreferences>;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = {},
  storageKey = 'universal-editor-theme'
}) => {
  // Charger les préférences depuis le localStorage
  const loadSavedTheme = (): ThemePreferences => {
    try {
      const savedTheme = localStorage.getItem(storageKey);
      if (savedTheme) {
        return { ...defaultThemePreferences, ...JSON.parse(savedTheme) };
      }
    } catch (error) {
      console.error('Error loading theme preferences:', error);
    }
    return { ...defaultThemePreferences, ...initialTheme };
  };

  const [theme, setTheme] = useState<ThemePreferences>(loadSavedTheme);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Détecter le mode sombre du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateIsDarkMode = () => {
      const systemIsDark = mediaQuery.matches;
      setIsDarkMode(theme.mode === 'dark' || (theme.mode === 'system' && systemIsDark));
    };
    
    updateIsDarkMode();
    
    const handleChange = () => {
      updateIsDarkMode();
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
  }, [theme.mode]);

  // Détecter les préférences d'accessibilité
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: more)');
    
    const updateAccessibilityPreferences = () => {
      setTheme(prev => ({
        ...prev,
        reducedMotion: reducedMotionQuery.matches || prev.reducedMotion,
        highContrast: highContrastQuery.matches || prev.highContrast
      }));
    };
    
    updateAccessibilityPreferences();
    
    const handleReducedMotionChange = () => {
      updateAccessibilityPreferences();
    };
    
    const handleHighContrastChange = () => {
      updateAccessibilityPreferences();
    };
    
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    }
    
    if (highContrastQuery.addEventListener) {
      highContrastQuery.addEventListener('change', handleHighContrastChange);
    }
    
    return () => {
      if (reducedMotionQuery.removeEventListener) {
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      }
      
      if (highContrastQuery.removeEventListener) {
        highContrastQuery.removeEventListener('change', handleHighContrastChange);
      }
    };
  }, []);

  // Sauvegarder les préférences dans le localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(theme));
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  }, [theme, storageKey]);

  // Appliquer les variables CSS
  useEffect(() => {
    const root = document.documentElement;
    
    // Mode clair/sombre
    if (isDarkMode) {
      root.classList.add('dark-mode');
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
      root.classList.remove('dark-mode');
    }
    
    // Schéma de couleurs
    root.setAttribute('data-color-scheme', theme.colorScheme);
    
    // Taille de police
    root.setAttribute('data-font-size', theme.fontSize);
    
    // Rayon des bordures
    root.setAttribute('data-border-radius', theme.borderRadius);
    
    // Vitesse d'animation
    root.setAttribute('data-animation-speed', theme.animationSpeed);
    
    // Contraste élevé
    if (theme.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Animations réduites
    if (theme.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Définir les variables CSS
    const setColorVariable = (name: string, lightValue: string, darkValue: string) => {
      root.style.setProperty(`--${name}`, isDarkMode ? darkValue : lightValue);
    };
    
    // Couleurs de base
    switch (theme.colorScheme) {
      case 'blue':
        setColorVariable('primary-color', '#3498db', '#61afef');
        setColorVariable('primary-color-light', '#ebf5fd', '#2c3e50');
        setColorVariable('primary-color-dark', '#2980b9', '#2171a7');
        break;
      case 'green':
        setColorVariable('primary-color', '#2ecc71', '#98c379');
        setColorVariable('primary-color-light', '#eafaf1', '#2c3e50');
        setColorVariable('primary-color-dark', '#27ae60', '#2a9055');
        break;
      case 'purple':
        setColorVariable('primary-color', '#9b59b6', '#c678dd');
        setColorVariable('primary-color-light', '#f5eef8', '#2c3e50');
        setColorVariable('primary-color-dark', '#8e44ad', '#7d3c98');
        break;
      case 'orange':
        setColorVariable('primary-color', '#e67e22', '#e5c07b');
        setColorVariable('primary-color-light', '#fdf2e9', '#2c3e50');
        setColorVariable('primary-color-dark', '#d35400', '#b94700');
        break;
      case 'gray':
        setColorVariable('primary-color', '#7f8c8d', '#abb2bf');
        setColorVariable('primary-color-light', '#f2f2f2', '#2c3e50');
        setColorVariable('primary-color-dark', '#5f6a6a', '#4d5656');
        break;
    }
    
    // Couleurs de texte et de fond
    setColorVariable('text-color', '#333333', '#ececec');
    setColorVariable('text-color-light', '#666666', '#b0b0b0');
    setColorVariable('background-color', '#ffffff', '#282c34');
    setColorVariable('background-color-light', '#f5f5f5', '#21252b');
    setColorVariable('border-color', '#e0e0e0', '#3e4451');
    
    // Couleurs d'état
    setColorVariable('success-color', '#2ecc71', '#98c379');
    setColorVariable('warning-color', '#f39c12', '#e5c07b');
    setColorVariable('error-color', '#e74c3c', '#e06c75');
    setColorVariable('info-color', '#3498db', '#61afef');
    
    // Taille de police
    switch (theme.fontSize) {
      case 'small':
        root.style.setProperty('--font-size-base', '14px');
        root.style.setProperty('--font-size-small', '12px');
        root.style.setProperty('--font-size-large', '16px');
        root.style.setProperty('--font-size-xlarge', '18px');
        break;
      case 'medium':
        root.style.setProperty('--font-size-base', '16px');
        root.style.setProperty('--font-size-small', '14px');
        root.style.setProperty('--font-size-large', '18px');
        root.style.setProperty('--font-size-xlarge', '20px');
        break;
      case 'large':
        root.style.setProperty('--font-size-base', '18px');
        root.style.setProperty('--font-size-small', '16px');
        root.style.setProperty('--font-size-large', '20px');
        root.style.setProperty('--font-size-xlarge', '24px');
        break;
    }
    
    // Rayon des bordures
    switch (theme.borderRadius) {
      case 'none':
        root.style.setProperty('--border-radius-small', '0');
        root.style.setProperty('--border-radius-medium', '0');
        root.style.setProperty('--border-radius-large', '0');
        break;
      case 'small':
        root.style.setProperty('--border-radius-small', '2px');
        root.style.setProperty('--border-radius-medium', '4px');
        root.style.setProperty('--border-radius-large', '6px');
        break;
      case 'medium':
        root.style.setProperty('--border-radius-small', '4px');
        root.style.setProperty('--border-radius-medium', '6px');
        root.style.setProperty('--border-radius-large', '8px');
        break;
      case 'large':
        root.style.setProperty('--border-radius-small', '6px');
        root.style.setProperty('--border-radius-medium', '8px');
        root.style.setProperty('--border-radius-large', '12px');
        break;
    }
    
    // Vitesse d'animation
    switch (theme.animationSpeed) {
      case 'none':
        root.style.setProperty('--animation-speed-fast', '0.01ms');
        root.style.setProperty('--animation-speed-normal', '0.01ms');
        root.style.setProperty('--animation-speed-slow', '0.01ms');
        break;
      case 'slow':
        root.style.setProperty('--animation-speed-fast', '300ms');
        root.style.setProperty('--animation-speed-normal', '500ms');
        root.style.setProperty('--animation-speed-slow', '700ms');
        break;
      case 'normal':
        root.style.setProperty('--animation-speed-fast', '150ms');
        root.style.setProperty('--animation-speed-normal', '250ms');
        root.style.setProperty('--animation-speed-slow', '350ms');
        break;
      case 'fast':
        root.style.setProperty('--animation-speed-fast', '100ms');
        root.style.setProperty('--animation-speed-normal', '150ms');
        root.style.setProperty('--animation-speed-slow', '200ms');
        break;
    }
    
    // Contraste élevé
    if (theme.highContrast) {
      setColorVariable('text-color', '#000000', '#ffffff');
      setColorVariable('text-color-light', '#333333', '#e0e0e0');
      root.style.setProperty('--focus-ring-color', '#ff6b00');
      root.style.setProperty('--focus-ring-width', '3px');
    } else {
      root.style.setProperty('--focus-ring-color', isDarkMode ? '#61afef' : '#3498db');
      root.style.setProperty('--focus-ring-width', '2px');
    }
    
  }, [theme, isDarkMode]);

  // Mettre à jour le thème
  const updateTheme = (updates: Partial<ThemePreferences>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  // Réinitialiser le thème
  const resetTheme = () => {
    setTheme(defaultThemePreferences);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Composant pour le sélecteur de thème
export interface ThemeSelectorProps {
  className?: string;
  style?: React.CSSProperties;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className = '',
  style = {}
}) => {
  const { theme, updateTheme } = useEditorTheme();

  return (
    <div className={`theme-selector ${className}`} style={style}>
      <div className="theme-section">
        <h3>Mode</h3>
        <div className="theme-options">
          <button
            className={`theme-option ${theme.mode === 'light' ? 'active' : ''}`}
            onClick={() => updateTheme({ mode: 'light' })}
          >
            Clair
          </button>
          <button
            className={`theme-option ${theme.mode === 'dark' ? 'active' : ''}`}
            onClick={() => updateTheme({ mode: 'dark' })}
          >
            Sombre
          </button>
          <button
            className={`theme-option ${theme.mode === 'system' ? 'active' : ''}`}
            onClick={() => updateTheme({ mode: 'system' })}
          >
            Système
          </button>
        </div>
      </div>

      <div className="theme-section">
        <h3>Couleur</h3>
        <div className="theme-options">
          <button
            className={`theme-option color-option blue ${theme.colorScheme === 'blue' ? 'active' : ''}`}
            onClick={() => updateTheme({ colorScheme: 'blue' })}
          />
          <button
            className={`theme-option color-option green ${theme.colorScheme === 'green' ? 'active' : ''}`}
            onClick={() => updateTheme({ colorScheme: 'green' })}
          />
          <button
            className={`theme-option color-option purple ${theme.colorScheme === 'purple' ? 'active' : ''}`}
            onClick={() => updateTheme({ colorScheme: 'purple' })}
          />
          <button
            className={`theme-option color-option orange ${theme.colorScheme === 'orange' ? 'active' : ''}`}
            onClick={() => updateTheme({ colorScheme: 'orange' })}
          />
          <button
            className={`theme-option color-option gray ${theme.colorScheme === 'gray' ? 'active' : ''}`}
            onClick={() => updateTheme({ colorScheme: 'gray' })}
          />
        </div>
      </div>

      <div className="theme-section">
        <h3>Taille de police</h3>
        <div className="theme-options">
          <button
            className={`theme-option ${theme.fontSize === 'small' ? 'active' : ''}`}
            onClick={() => updateTheme({ fontSize: 'small' })}
          >
            Petite
          </button>
          <button
            className={`theme-option ${theme.fontSize === 'medium' ? 'active' : ''}`}
            onClick={() => updateTheme({ fontSize: 'medium' })}
          >
            Moyenne
          </button>
          <button
            className={`theme-option ${theme.fontSize === 'large' ? 'active' : ''}`}
            onClick={() => updateTheme({ fontSize: 'large' })}
          >
            Grande
          </button>
        </div>
      </div>

      <div className="theme-section">
        <h3>Accessibilité</h3>
        <div className="theme-options">
          <label className="theme-checkbox">
            <input
              type="checkbox"
              checked={theme.highContrast}
              onChange={(e) => updateTheme({ highContrast: e.target.checked })}
            />
            Contraste élevé
          </label>
          <label className="theme-checkbox">
            <input
              type="checkbox"
              checked={theme.reducedMotion}
              onChange={(e) => updateTheme({ reducedMotion: e.target.checked })}
            />
            Réduire les animations
          </label>
        </div>
      </div>
    </div>
  );
};

export default {
  ThemeProvider,
  ThemeSelector,
  useEditorTheme
};