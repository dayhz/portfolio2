import React, { useState, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import './zesty-template-styles.optimized.css';

// TypeScript interfaces for project data
interface ZestyProjectData {
  title: string;
  heroImage: string;
  challenge: string;
  approach: string;
  client: string;
  year: string;
  duration: string;
  type: string;
  industry: string;
  scope: string[];
  image1: string;
  textSection1: string;
  image2: string;
  image3: string;
  image4: string;
  video1: string;
  video1Poster: string;
  video2: string;
  video2Poster: string;
  video3: string;
  video3Poster: string;
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  testimonialImage: string;
  finalImage: string;
  textSection2: string;
  finalImage1: string;
  finalImage2: string;
}

interface ZestyTemplateRendererProps {
  projectData: ZestyProjectData;
  isPreview?: boolean;
}

// Default content fallbacks matching original Zesty template
const defaultContent = {
  title: 'Talk with strangers until the chat resets',
  client: 'Zesty',
  year: '2025',
  duration: '9 weeks',
  type: 'Mobile',
  industry: 'Messaging',
  scope: ['Concept', 'UI/UX', 'Digital Design', 'Icon Design', 'Motion Prototype'],
  challenge: 'The internet is overwhelming and everything it\'s dictated by appearance and who you are. I wanted to bring back the feeling of early 2000s chat rooms, anonymous and fun, but with a twist. No user names, no likes, no photos and the chats reset every 10 minutes to keep things fresh and engaging.',
  approach: 'I started this project by mapping out a simple sitemap, then jumped straight into UI and micro-interactions, since this is a concept project I didn\'t do much research besides what I liked and what I wanted for this project. It\'s always refreshing to work on something on my own and make all the design decisions along the way and I loved how the lemon mascot, Zesty, turned out.',
  textSection1: 'For Zesty, I chose to use a dark UI simply because I thought it looked cool, with no deeper meaning behind it. Since this was a concept project, I had the freedom to do whatever I wanted and the screens were designed with a focus on simplicity and ease of use, keeping the interface clean and the experience fast-paced, with plenty of space for text and emojis.',
  heroImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/686d8163cffedff40b473869_header-zesty-v2.png',
  image1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139737de2349a3da35fc70_case-zesty02.avif',
  image2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813978dd56d1a8ae684d995_case-zesty03.avif',
  image3: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b59317324c9d5a41cbbb9_case-zesty04.png',
  image4: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/682b5923845e7ec8eb928654_case-zesty05.png',
  video1: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-app-motion.mp4',
  video1Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  video2: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-colors.mp4',
  video2Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  video3: 'https://vbportfolio.nyc3.cdn.digitaloceanspaces.com/zesty-topbar.mp4',
  video3Poster: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/681394b22fdce281373b780b_video-loading.gif',
  textSection2: 'For this project, I also created some fun, playful stickers for Instagram Stories and WhatsApp, adding a bit of personality to the app. In terms of micro-interactions, I focused on making the experience feel smooth and dynamic, with small animations that respond to user actions, keeping things fun without being overwhelming.',
  testimonialQuote: 'Zesty is a little passion project of mine and I would love to built it for real someday. Back in the early 2000\'s it was a lot of fun to talk random things with strangers and that\'s the idea behind this project.',
  testimonialAuthor: 'Lawson Sydney',
  testimonialRole: 'Independent Product Designer',
  testimonialImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6824e55a01623e0153c6d876_img-victor.png',
  finalImage: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139823634589c669ae445c_case-zesty-screens.avif',
  finalImage1: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/6813992c3669562e4c3a141a_case-zesty-components.avif',
  finalImage2: 'https://cdn.prod.website-files.com/67dac46f3007872e8a7b128f/68139961925821195762c826_case-zesty-stickers.avif'
};

// Optimized helper component for images with lazy loading and intersection observer
const ImageWithFallback: React.FC<{
  src: string;
  fallbackSrc: string;
  alt: string;
  className: string;
  loading?: 'eager' | 'lazy';
  'data-wf-template-image-variant'?: string;
  priority?: boolean; // For above-the-fold images
}> = memo(({ src, fallbackSrc, alt, className, loading = 'lazy', priority = false, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;
  const imgRef = React.useRef<HTMLImageElement>(null);

  const handleError = useCallback(() => {
    console.warn(`Image failed to load: ${imgSrc}`);
    
    if (retryCount < maxRetries && imgSrc !== fallbackSrc) {
      // Try fallback image
      setHasError(true);
      setImgSrc(fallbackSrc);
      setRetryCount(prev => prev + 1);
      setIsLoading(true);
    } else {
      // All attempts failed, show error state
      setIsLoading(false);
      setHasError(true);
    }
  }, [imgSrc, fallbackSrc, retryCount, maxRetries]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (priority || isInView) return; // Skip if already in view or priority

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.1 
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [priority, isInView]);

  // Show placeholder while waiting for intersection or loading
  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={`${className} image-placeholder`}
        style={{
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: '#999',
          fontSize: '14px',
          borderRadius: '16px'
        }}
        {...props}
      >
        <div>📷</div>
      </div>
    );
  }

  // Show loading placeholder while image is loading
  if (isLoading && !hasError) {
    return (
      <div 
        ref={imgRef}
        className={`${className} image-loading-placeholder`}
        style={{
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: '#666',
          fontSize: '14px'
        }}
      >
        <div>Loading image...</div>
        <img
          src={imgSrc}
          alt={alt}
          className={className}
          loading={loading}
          onError={handleError}
          onLoad={handleLoad}
          style={{ display: 'none' }}
          {...props}
        />
      </div>
    );
  }

  // Show error state if all loading attempts failed
  if (hasError && retryCount >= maxRetries) {
    return (
      <div 
        className={`${className} image-error-placeholder`}
        style={{
          backgroundColor: '#f8f8f8',
          border: '2px dashed #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          color: '#999',
          fontSize: '14px',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div>⚠️ Image failed to load</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          {src !== fallbackSrc ? 'Both original and fallback images failed' : 'Image unavailable'}
        </div>
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      onLoad={handleLoad}
      style={{ display: isLoading ? 'none' : 'block' }}
      {...props}
    />
  );
});

// Optimized helper component for videos with lazy loading
const VideoWithFallback: React.FC<{
  src: string;
  fallbackSrc: string;
  posterSrc: string;
  fallbackPosterSrc: string;
  className: string;
}> = memo(({ src, fallbackSrc, posterSrc, fallbackPosterSrc, className }) => {

  const [videoSrc, setVideoSrc] = useState(src || fallbackSrc);
  const [posterImgSrc, setPosterImgSrc] = useState(posterSrc || fallbackPosterSrc);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [hasPosterError, setHasPosterError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const [videoRetryCount, setVideoRetryCount] = useState(0);
  const [posterRetryCount, setPosterRetryCount] = useState(0);
  const maxRetries = 2;
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleVideoError = useCallback((e: any) => {
    console.error(`Video failed to load: ${videoSrc}`, e);
    
    if (videoRetryCount < maxRetries && videoSrc !== fallbackSrc && fallbackSrc) {
      // Try fallback video
      setHasVideoError(true);
      setVideoSrc(fallbackSrc);
      setVideoRetryCount(prev => prev + 1);
    } else {
      // All attempts failed
      setHasVideoError(true);
    }
  }, [videoSrc, fallbackSrc, videoRetryCount, maxRetries]);

  const handlePosterError = useCallback(() => {
    console.warn(`Video poster failed to load: ${posterImgSrc}`);
    
    if (posterRetryCount < maxRetries && posterImgSrc !== fallbackPosterSrc) {
      // Try fallback poster
      setHasPosterError(true);
      setPosterImgSrc(fallbackPosterSrc);
      setPosterRetryCount(prev => prev + 1);
    } else {
      // All attempts failed
      setHasPosterError(true);
    }
  }, [posterImgSrc, fallbackPosterSrc, posterRetryCount, maxRetries]);

  const handleVideoLoadedData = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  const handleVideoLoadedMetadata = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

  const handleVideoLoadStart = useCallback(() => {
    // Pas besoin de gérer le loading state
  }, []);

  // Enhanced autoplay functionality with intersection observer
  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || hasVideoError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && video.paused && isVideoLoaded) {
            // Try to play video when it comes into view
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.log('Video autoplay failed:', error);
                // Fallback: try to play on user interaction
                const handleUserInteraction = () => {
                  video.play().catch((err) => console.log('Video play on interaction failed:', err));
                  document.removeEventListener('click', handleUserInteraction);
                  document.removeEventListener('touchstart', handleUserInteraction);
                };
                document.addEventListener('click', handleUserInteraction, { once: true });
                document.addEventListener('touchstart', handleUserInteraction, { once: true });
              });
            }
          } else if (!entry.isIntersecting && !video.paused) {
            // Pause video when it goes out of view to save bandwidth
            video.pause();
          }
        });
      },
      { threshold: 0.5 } // Trigger when 50% of video is visible
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [videoSrc, isVideoLoaded, hasVideoError]);



  // Pas de placeholder de chargement - afficher directement la vidéo

  // Show error state if video failed to load
  if (hasVideoError && videoRetryCount >= maxRetries) {
    return (
      <div 
        className="video-error-placeholder"
        style={{
          backgroundColor: '#f8f8f8',
          border: '2px dashed #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          color: '#999',
          fontSize: '14px',
          flexDirection: 'column',
          gap: '8px',
          borderRadius: '16px'
        }}
      >
        <div>🎥 Video failed to load</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          {src !== fallbackSrc ? 'Both original and fallback videos failed' : 'Video unavailable'}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Poster image with error handling */}
      {!isVideoPlaying && (
        <>
          {hasPosterError && posterRetryCount >= maxRetries ? (
            <div 
              className="comp-img poster-error-placeholder"
              data-wf-template-image-variant="radius-16px"
              style={{
                backgroundColor: '#f8f8f8',
                border: '2px dashed #ddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                color: '#999',
                fontSize: '14px',
                borderRadius: '16px'
              }}
            >
              🖼️ Poster image unavailable
            </div>
          ) : (
            <img
              src={posterImgSrc}
              alt=""
              className="comp-img"
              data-wf-template-image-variant="radius-16px"
              loading="eager"
              onError={handlePosterError}
            />
          )}
        </>
      )}
      
      {/* Video element */}
      <div className="video-wrp">
        <video 
          ref={videoRef}
          className={className} 
          height="auto" 
          playsInline 
          width="100%"
          muted
          loop
          autoPlay
          onError={handleVideoError}
          onLoadedData={handleVideoLoadedData}
          onLoadedMetadata={handleVideoLoadedMetadata}
          onCanPlay={handleVideoCanPlay}
          onLoadStart={handleVideoLoadStart}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          style={{
            display: hasVideoError ? 'none' : 'block'
          }}
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </>
  );
});

// Data validation helper
const validateProjectData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Project data is missing or invalid');
    return { isValid: false, errors };
  }

  // Check for required string fields
  const requiredStringFields: (keyof ZestyProjectData)[] = [
    'title', 'client', 'year', 'duration', 'type', 'industry'
  ];
  
  requiredStringFields.forEach(field => {
    if (!data[field] || typeof data[field] !== 'string') {
      console.warn(`Missing or invalid ${field} in project data, using default`);
    }
  });

  // Check scope array
  if (data.scope && !Array.isArray(data.scope)) {
    console.warn('Scope should be an array, using default');
  }

  return { isValid: true, errors };
};

// Memoized navigation component for better performance
const NavigationSection = memo(({ 
  isMobileMenuOpen, 
  toggleMobileMenu, 
  handleMobileLinkClick 
}: {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  handleMobileLinkClick: () => void;
}) => (
  <nav className="navbar" data-wf-navbar-variant="base" id="navbar">
    <div className="u-container is-large">
      <div className="navbar_wrap">
        <a aria-label="Lawson Sydney Brand" className="vb_logo w-inline-block" href="index.html">
          <div className="w-embed">
            <svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M31.205 20.0112C31.6522 19.6128 32 19.065 32 18.4176V2.08393C32 0.341007 29.9131 -0.654958 28.5715 0.490393L17.3416 9.7528C16.5466 10.4002 15.4534 10.4002 14.6584 9.7528L3.42855 0.490393C2.03725 -0.654958 0 0.341007 0 2.08393V18.4176C0 19.0152 0.248448 19.6128 0.745344 20.0112L14.6087 31.5145C15.4037 32.1618 16.4969 32.1618 17.2919 31.5145L31.205 20.0112Z" fill="currentColor" />
            </svg>
          </div>
        </a>
        <div className="navbar_links_wrp">
          <a className="navbar_link_item" href="services.html">Services</a>
          <a className="navbar_link_item" href="work.html">Work</a>
          <a className="navbar_link_item" href="about.html">About</a>
          <a className="navbar_link_item" href="contact.html">Contact</a>
        </div>
        <div className="toggle-menu" onClick={toggleMobileMenu}>
          <div className="toggle-menu-dot"></div>
          <div className="menu_mobile_wrp">
            <div className={`navbar_link_item is-dark ${!isMobileMenuOpen ? 'menu-open' : ''}`}>
              Menu
            </div>
            <div className={`navbar_link_item is-dark ${isMobileMenuOpen ? 'menu-close' : ''}`}>
              Close
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className={`mobile-menu ${isMobileMenuOpen ? 'is-open' : ''}`}>
      <div className="menu_items">
        <div className="navbar_links_wrp is-mobile">
          <div className="link-text-box">
            <a 
              className="u-text-style-h1 u-text-white" 
              href="services.html"
              onClick={handleMobileLinkClick}
            >
              Services
            </a>
          </div>
          <div className="link-text-box">
            <a 
              className="u-text-style-h1 u-text-white" 
              href="work.html"
              onClick={handleMobileLinkClick}
            >
              Work
            </a>
          </div>
          <div className="link-text-box">
            <a 
              className="u-text-style-h1 u-text-white" 
              href="about.html"
              onClick={handleMobileLinkClick}
            >
              About
            </a>
          </div>
          <div className="link-text-box">
            <a 
              className="u-text-style-h1 u-text-white" 
              href="contact.html"
              onClick={handleMobileLinkClick}
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
    <div className="menu_mobile" onClick={toggleMobileMenu}>
      <div className={`menu_mobile-line _01 ${isMobileMenuOpen ? 'is-open' : ''}`}></div>
      <div className={`menu_mobile-line _02 ${isMobileMenuOpen ? 'is-open' : ''}`}></div>
    </div>
  </nav>
));

// Safe component wrapper with error boundary and performance optimizations
const SafeZestyTemplateRenderer: React.FC<ZestyTemplateRendererProps> = memo(({ 
  projectData,
  isPreview = true
}) => {
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Validate project data on mount and when it changes
  const validationResult = useMemo(() => {
    return validateProjectData(projectData);
  }, [projectData]);

  // Helper function to get content with fallback and validation
  const getContent = useCallback((key: keyof ZestyProjectData): string => {
    try {
      const projectValue = projectData?.[key];
      const defaultValue = defaultContent[key as keyof typeof defaultContent];
      
      // Handle scope array separately
      if (key === 'scope') {
        return Array.isArray(projectValue) && projectValue.length > 0 
          ? projectValue.join('\n') 
          : isPreview && Array.isArray(defaultValue) 
            ? defaultValue.join('\n') 
            : '';
      }
      
      // Validate and sanitize string content
      let content = '';
      if (typeof projectValue === 'string' && projectValue.trim()) {
        content = projectValue.trim();
      } else if (isPreview && typeof defaultValue === 'string') {
        // Only use default values in preview mode, not in final render
        content = defaultValue;
      }
      
      // Basic XSS protection - strip potentially dangerous content
      content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      content = content.replace(/javascript:/gi, '');
      
      return content;
    } catch (error) {
      console.error(`Error getting content for ${key}:`, error);
      // Only return default values in preview mode
      if (isPreview) {
        const defaultValue = defaultContent[key as keyof typeof defaultContent];
        return typeof defaultValue === 'string' ? defaultValue : '';
      }
      return '';
    }
  }, [projectData, isPreview]);

  // Helper function to render scope array with error handling
  const renderScope = useCallback(() => {
    try {
      const projectScope = projectData?.scope && Array.isArray(projectData.scope) && projectData.scope.length > 0 
        ? projectData.scope 
        : null;
      
      // If no project scope and not in preview mode, return empty
      if (!projectScope && !isPreview) {
        return null;
      }
      
      // Use project scope if available, otherwise use default only in preview mode
      const scope = projectScope || (isPreview ? defaultContent.scope : []);
      
      if (!Array.isArray(scope) || scope.length === 0) {
        return null;
      }
      
      return scope.map((item, index) => (
        <React.Fragment key={index}>
          {typeof item === 'string' ? item : String(item)}
          {index < scope.length - 1 && <br />}
        </React.Fragment>
      ));
    } catch (error) {
      console.error('Error rendering scope:', error);
      return defaultContent.scope.map((item, index) => (
        <React.Fragment key={index}>
          {item}
          {index < defaultContent.scope.length - 1 && <br />}
        </React.Fragment>
      ));
    }
  }, [projectData]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    
    // Prevent body scroll when menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Close mobile menu on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Cleanup on unmount
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking on links
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  // Show validation errors in development
  if (!validationResult.isValid && process.env.NODE_ENV === 'development') {
    console.warn('ZestyTemplateRenderer validation errors:', validationResult.errors);
  }

  return (
    <div className="page_code_wrap u-theme-dark">
      <div className="page_wrap" id="top">
        {/* Navigation Section */}
        <NavigationSection 
          isMobileMenuOpen={isMobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
          handleMobileLinkClick={handleMobileLinkClick}
        />


        {/* Main Content */}
        <main className="main_wrap">
          <div>
            {/* Section Spacing */}
            <div className="g_section_space w-variant-e359d2da-de19-6775-b122-3e06f925f39e" data-wf-global-section-space-section-space="160-124" />
            
            {/* Hero Section */}
            <section className="section" id="hero">
              <div className="u-container _1920px">
                <div className="temp-comp-hero">
                  <div className="temp-header">
                    <div className="temp-preheader">
                      <a className="breadcrumb-link" href="work.html">Work</a>
                      <div className="breadcrumb-link">/</div>
                      <div className="temp-preheader-link">{getContent('client')}</div>
                    </div>
                    <h1 className="temp-h1 u-color-dark">{getContent('title')}</h1>
                  </div>
                  <div className="temp-img">
                    <div className="img-wrp">
                      <ImageWithFallback
                        src={getContent('heroImage')}
                        fallbackSrc={defaultContent.heroImage}
                        alt=""
                        className="comp-img"
                        data-wf-template-image-variant="radius-16px"
                        loading="eager"
                        priority={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3" data-wf-global-section-space-section-space="120-72" />
            
            {/* About Section */}
            <section className="section">
              <div className="u-container">
                <div className="temp-about_container">
                  <div className="temp-about_content">
                    <div className="temp-rich u-color-dark w-richtext">
                      <h2>Challenge</h2>
                      <p>{getContent('challenge')}</p>
                    </div>
                    <div className="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf-global-section-space-section-space="even" />
                    <div className="temp-rich u-color-dark w-richtext">
                      <h2>Approach</h2>
                      <p>{getContent('approach')}</p>
                    </div>
                  </div>
                  <div className="temp-about_infos">
                    <div className="temp-about_info" id="w-node-_2339023a-fccd-048b-ddee-4d92c92ccfe9-bf4e9f8c">
                      <div className="temp-about_info-title">Client</div>
                      <div>{getContent('client')}</div>
                    </div>
                    <div className="temp-about_infos-group" id="w-node-_646b9ad1-5696-14f5-6674-ec14bf4e9fa1-bf4e9f8c">
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Year</div>
                        <div>{getContent('year')}</div>
                      </div>
                    </div>
                    <div className="temp-about_infos-group" id="w-node-_2a3d79b5-06e1-02be-fce0-106ad79c9fac-bf4e9f8c">
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Duration</div>
                        <div>{getContent('duration')}</div>
                      </div>
                    </div>
                    <div className="temp-about_infos-group" id="w-node-c0e28193-ebcf-903a-419c-a99d5f3e4602-bf4e9f8c">
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Type</div>
                        <div>{getContent('type')}</div>
                      </div>
                    </div>
                    <div className="temp-about_infos-group" id="w-node-d6698934-caaf-a318-fcaa-815151326cc9-bf4e9f8c">
                      <div className="temp-about_info">
                        <div className="temp-about_info-title">Industry</div>
                        <div>{getContent('industry')}</div>
                      </div>
                    </div>
                    <div className="temp-about_info" id="w-node-_646b9ad1-5696-14f5-6674-ec14bf4e9fb6-bf4e9f8c">
                      <div className="temp-about_info-title">Scope</div>
                      <div>{renderScope()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3" data-wf-global-section-space-section-space="120-72" />
            
            {/* First Image Section */}
            <div className="section" data-wf-template-section-image-variant="16-9">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      <ImageWithFallback
                        src={getContent('image1')}
                        fallbackSrc={defaultContent.image1}
                        alt=""
                        className="comp-img"
                        data-wf-template-image-variant="radius-16px"
                        loading="lazy"
                        priority={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3" data-wf-global-section-space-section-space="120-72" />
            
            {/* Text Section */}
            <section className="section">
              <div className="u-container">
                <div className="temp-comp-text">
                  <div>{getContent('textSection1')}</div>
                </div>
              </div>
            </section>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3" data-wf-global-section-space-section-space="120-72" />
            
            {/* Second Image Section */}
            <div className="section" data-wf-template-section-image-variant="16-9">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      <ImageWithFallback
                        src={getContent('image2')}
                        fallbackSrc={defaultContent.image2}
                        alt=""
                        className="comp-img"
                        data-wf-template-image-variant="radius-16px"
                        loading="lazy"
                        priority={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf-global-section-space-section-space="even" />
            
            {/* Image Grid Section */}
            <section className="section">
              <div className="u-container">
                <div className="temp-comp-img_grid">
                  <div className="img_grid-container">
                    <div className="temp-img none-ratio">
                      <div className="img-wrp">
                        <ImageWithFallback
                          src={getContent('image3')}
                          fallbackSrc={defaultContent.image3}
                          alt=""
                          className="comp-img"
                          data-wf-template-image-variant="radius-16px"
                          loading="lazy"
                          priority={false}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="img_grid-container">
                    <div className="temp-img none-ratio">
                      <div className="img-wrp">
                        <ImageWithFallback
                          src={getContent('image4')}
                          fallbackSrc={defaultContent.image4}
                          alt=""
                          className="comp-img"
                          data-wf-template-image-variant="radius-16px"
                          loading="lazy"
                          priority={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf-global-section-space-section-space="even" />
            
            {/* First Video Section */}
            <div className="section" data-wf-template-section-image-variant="16-9">
              <div className="u-container">
                {projectData?.video1 && projectData.video1.trim() !== '' && (
                  <div className="temp-img_container">
                    <div className="temp-img">
                      <div className="img-wrp">
                        <VideoWithFallback
                          src={projectData?.video1 || ''}
                          fallbackSrc=""
                          posterSrc={projectData?.video1Poster || ''}
                          fallbackPosterSrc=""
                          className="video"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf-global-section-space-section-space="even" />
            
            {/* Second Video Section */}
            {projectData?.video2 && projectData.video2.trim() !== '' && (
              <div className="section" data-wf-template-section-image-variant="16-9">
                <div className="u-container">
                  <div className="temp-img_container">
                    <div className="temp-img">
                      <div className="img-wrp">
                        <VideoWithFallback
                          src={projectData?.video2 || ''}
                          fallbackSrc=""
                          posterSrc={projectData?.video2Poster || ''}
                          fallbackPosterSrc=""
                          className="video"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section Spacing */}
            <div className="g_section_space w-variant-79f7fa3e-4b02-eadb-022d-938b45476c54" data-wf-global-section-space-section-space="200-128" />
            
            {/* Testimonial Section */}
            <section className="section">
              <div className="u-container">
                <div className="temp-comp-testimony">
                  <h4 className="testimony">
                    "{getContent('testimonialQuote')}"
                  </h4>
                  <div className="testimony-profile">
                    <div className="testimony-profile-img" id="w-node-_54703184-fe47-7bf7-e9f8-3e5d5b39d05d-5b39d057">
                      <ImageWithFallback
                        src={getContent('testimonialImage')}
                        fallbackSrc={defaultContent.testimonialImage}
                        alt=""
                        className="testimonial-img-item"
                        loading="lazy"
                        priority={false}
                      />
                    </div>
                    <div className="testimony-profile-name" id="w-node-_54703184-fe47-7bf7-e9f8-3e5d5b39d05f-5b39d057">
                      <div>
                        {getContent('testimonialAuthor')}
                      </div>
                    </div>
                    <div className="testimony-profile-role" id="w-node-_54703184-fe47-7bf7-e9f8-3e5d5b39d062-5b39d057">
                      <div>
                        {getContent('testimonialRole')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-79f7fa3e-4b02-eadb-022d-938b45476c54" data-wf-global-section-space-section-space="200-128" />
            
            {/* Final Large Image Section */}
            <section className="section">
              <div className="u-container-120rem" data-w-id="3e8b8be1-a6c8-334d-7475-ad66fe53643e">
                <ImageWithFallback
                  src={getContent('finalImage')}
                  fallbackSrc={defaultContent.finalImage}
                  alt=""
                  className="comp-img w-variant-41ef062a-e589-586c-260e-b854cb05aa63"
                  data-wf-template-image-variant="radius-0px"
                  loading="lazy"
                  priority={false}
                />
              </div>
            </section>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-79f7fa3e-4b02-eadb-022d-938b45476c54" data-wf-global-section-space-section-space="200-128" />
            
            {/* Second Text Section */}
            <section className="section">
              <div className="u-container">
                <div className="temp-comp-text">
                  <div>{getContent('textSection2')}</div>
                </div>
              </div>
            </section>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-8cc18b30-4618-8767-0111-f6abfe45aaa3" data-wf-global-section-space-section-space="120-72" />
            


            {/* Section Spacing */}
            <div className="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf-global-section-space-section-space="even" />
            
            {/* Final Image 1 Section */}
            <div className="section" data-wf-template-section-image-variant="16-9">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      <ImageWithFallback
                        src={getContent('finalImage1')}
                        fallbackSrc={defaultContent.finalImage1}
                        alt=""
                        className="comp-img"
                        data-wf-template-image-variant="radius-16px"
                        loading="lazy"
                        priority={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-41fc0c0a-cac3-53c9-9802-6a916e3fb342" data-wf-global-section-space-section-space="even" />
            
            {/* Final Image 2 Section */}
            <div className="section" data-wf-template-section-image-variant="16-9">
              <div className="u-container">
                <div className="temp-img_container">
                  <div className="temp-img">
                    <div className="img-wrp">
                      <ImageWithFallback
                        src={getContent('finalImage2')}
                        fallbackSrc={defaultContent.finalImage2}
                        alt=""
                        className="comp-img"
                        data-wf-template-image-variant="radius-16px"
                        loading="lazy"
                        priority={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Spacing */}
            <div className="g_section_space w-variant-79f7fa3e-4b02-eadb-022d-938b45476c54" data-wf-global-section-space-section-space="200-128" />
          </div>
        </main>
      </div>
    </div>
  );
});

// Export the component wrapped with error boundary
export const ZestyTemplateRenderer: React.FC<ZestyTemplateRendererProps> = (props) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for debugging
    console.error('ZestyTemplateRenderer Error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo);
    }
  };

  const fallbackComponent = (
    <div className="zesty-template-error-fallback" style={{
      padding: '2rem',
      margin: '1rem',
      border: '1px solid #e74c3c',
      borderRadius: '8px',
      backgroundColor: '#fdf2f2',
      color: '#721c24',
      textAlign: 'center',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
        Zesty Template Error
      </h2>
      <p style={{ marginBottom: '1rem', maxWidth: '600px' }}>
        The Zesty template encountered an error while rendering. This could be due to 
        invalid project data, missing resources, or a component failure. The template 
        will fall back to safe defaults when possible.
      </p>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: '#f8f8f8', 
        borderRadius: '4px',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        Please check the browser console for detailed error information.
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackComponent} onError={handleError}>
      <SafeZestyTemplateRenderer {...props} />
    </ErrorBoundary>
  );
};