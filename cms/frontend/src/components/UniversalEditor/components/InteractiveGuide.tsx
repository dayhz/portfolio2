import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import '../styles/animations.css';

export interface GuideStep {
  target: string;
  title: string;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  spotlightRadius?: number;
  action?: () => void;
}

export interface InteractiveGuideProps {
  steps: GuideStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  showSkip?: boolean;
  showProgress?: boolean;
}

export const InteractiveGuide: React.FC<InteractiveGuideProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  showSkip = true,
  showProgress = true
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 0, height: 0 });
  const [spotlightPosition, setSpotlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      updateStepTarget();
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('resize', updatePositions);
      window.addEventListener('scroll', updatePositions);
    }

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions);
    };
  }, [isOpen, targetElement]);

  const updateStepTarget = () => {
    if (!isOpen || currentStep >= steps.length) return;
    
    const step = steps[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      setTargetElement(element);
      updatePositions(element);
      
      if (step.action) {
        step.action();
      }
    } else {
      console.warn(`Target element not found: ${step.target}`);
      handleNext();
    }
  };

  const updatePositions = (element?: Element) => {
    const target = element || targetElement;
    if (!target || !tooltipRef.current) return;

    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
    
    const step = steps[currentStep];
    const position = step.position || 'bottom';
    const spotlightPadding = 10;
    const spotlightRadius = step.spotlightRadius || 0;

    // Update spotlight position
    setSpotlightPosition({
      top: targetRect.top + scrollTop - spotlightPadding,
      left: targetRect.left + scrollLeft - spotlightPadding,
      width: targetRect.width + (spotlightPadding * 2),
      height: targetRect.height + (spotlightPadding * 2)
    });

    // Update overlay dimensions
    setOverlayDimensions({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight
    });

    // Calculate tooltip position
    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top + scrollTop - tooltipRect.height - 20;
        left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = targetRect.bottom + scrollTop + 20;
        left = targetRect.left + scrollLeft + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left + scrollLeft - tooltipRect.width - 20;
        break;
      case 'right':
        top = targetRect.top + scrollTop + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + scrollLeft + 20;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 20) left = 20;
    if (left + tooltipRect.width > viewportWidth - 20) {
      left = viewportWidth - tooltipRect.width - 20;
    }

    if (top < 20) top = 20;
    if (top + tooltipRect.height > viewportHeight + scrollTop - 20) {
      top = viewportHeight + scrollTop - tooltipRect.height - 20;
    }

    setTooltipPosition({ top, left });

    // Scroll to make target visible if needed
    const targetTop = targetRect.top;
    const targetBottom = targetRect.bottom;
    
    if (targetTop < 0) {
      window.scrollBy(0, targetTop - 100);
    } else if (targetBottom > window.innerHeight) {
      window.scrollBy(0, targetBottom - window.innerHeight + 100);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return createPortal(
    <CSSTransition
      in={isOpen}
      timeout={300}
      classNames="animate-fade-in"
      unmountOnExit
    >
      <div className="interactive-guide">
        {/* Overlay with spotlight */}
        <div
          ref={overlayRef}
          className="guide-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998,
            overflow: 'hidden'
          }}
        >
          {/* Spotlight */}
          <div
            className="guide-spotlight"
            style={{
              position: 'absolute',
              top: spotlightPosition.top,
              left: spotlightPosition.left,
              width: spotlightPosition.width,
              height: spotlightPosition.height,
              borderRadius: currentStepData.spotlightRadius ? `${currentStepData.spotlightRadius}px` : '4px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className="guide-tooltip animate-scale-in"
          style={{
            position: 'absolute',
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            zIndex: 9999,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            padding: '20px',
            width: '320px',
            maxWidth: '90vw',
            transition: 'all 0.3s ease'
          }}
        >
          <div className="guide-tooltip-header" style={{ marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{currentStepData.title}</h3>
          </div>
          
          <div className="guide-tooltip-content" style={{ marginBottom: '20px' }}>
            {currentStepData.content}
          </div>
          
          <div className="guide-tooltip-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {showProgress && (
              <div className="guide-progress" style={{ display: 'flex', alignItems: 'center' }}>
                {steps.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: index === currentStep ? '#3498db' : '#e0e0e0',
                      margin: '0 4px'
                    }}
                  />
                ))}
              </div>
            )}
            
            <div className="guide-actions" style={{ display: 'flex', gap: '10px' }}>
              {showSkip && !isLastStep && (
                <button
                  onClick={handleSkip}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '8px 12px'
                  }}
                >
                  Passer
                </button>
              )}
              
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    color: '#333',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '8px 16px'
                  }}
                >
                  Précédent
                </button>
              )}
              
              <button
                onClick={isLastStep ? handleComplete : handleNext}
                style={{
                  backgroundColor: '#3498db',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 16px'
                }}
              >
                {isLastStep ? 'Terminer' : 'Suivant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>,
    document.body
  );
};

export default InteractiveGuide;