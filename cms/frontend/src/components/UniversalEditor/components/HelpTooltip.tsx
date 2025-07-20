import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CSSTransition } from 'react-transition-group';
import '../styles/animations.css';

export interface HelpTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: number;
  showArrow?: boolean;
  interactive?: boolean;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 300,
  maxWidth = 250,
  showArrow = true,
  interactive = false,
  className = '',
  onOpen,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollTop - tooltipRect.height - 10;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + 10;
        left = triggerRect.left + scrollLeft + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollLeft - tooltipRect.width - 10;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollLeft + 10;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }

    if (top < 10) top = 10;
    if (top + tooltipRect.height > viewportHeight + scrollTop - 10) {
      top = viewportHeight + scrollTop - tooltipRect.height - 10;
    }

    setTooltipPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
      if (onOpen) onOpen();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!interactive) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 100);
    }
  };

  const handleTooltipMouseEnter = () => {
    if (interactive && timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleTooltipMouseLeave = () => {
    if (interactive) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 100);
    }
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible]);

  const getArrowStyle = () => {
    if (!showArrow) return {};

    switch (position) {
      case 'top':
        return {
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)'
        };
      case 'bottom':
        return {
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%) rotate(45deg)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.1)'
        };
      case 'left':
        return {
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          borderRight: '1px solid rgba(0, 0, 0, 0.1)'
        };
      case 'right':
        return {
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%) rotate(45deg)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          borderLeft: '1px solid rgba(0, 0, 0, 0.1)'
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <CSSTransition
          in={isVisible}
          timeout={200}
          classNames="tooltip"
          unmountOnExit
        >
          <div
            ref={tooltipRef}
            className={`help-tooltip ${className}`}
            style={{
              position: 'absolute',
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              zIndex: 9999,
              maxWidth: `${maxWidth}px`,
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#333',
              pointerEvents: interactive ? 'auto' : 'none'
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            {content}
            {showArrow && (
              <div
                style={{
                  position: 'absolute',
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'white',
                  ...getArrowStyle()
                }}
              />
            )}
          </div>
        </CSSTransition>,
        document.body
      )}
    </>
  );
};

export default HelpTooltip;