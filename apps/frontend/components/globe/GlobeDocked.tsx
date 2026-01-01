/**
 * GlobeDocked Component
 * 
 * Future implementation for a floating, docked globe widget that appears
 * at the bottom-right of the page after scroll completion.
 * 
 * This component will be used in Phase 3 of the scroll-driven integration.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlobeCore from './GlobeCore';
import { CityData } from '../../types/city';
import styles from './styles.module.css';

export interface GlobeDockedProps {
  /**
   * Whether the docked globe is visible
   */
  visible?: boolean;
  
  /**
   * Position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  /**
   * Size: 'small' | 'medium' | 'large'
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Opacity when docked
   */
  opacity?: number;
  
  /**
   * Callback when city is clicked
   */
  onCityClick?: (city: CityData) => void;
  
  /**
   * Callback when globe is clicked (expand to full screen)
   */
  onExpand?: () => void;
  
  /**
   * Custom className
   */
  className?: string;
}

const sizeMap = {
  small: { width: '200px', height: '200px' },
  medium: { width: '300px', height: '300px' },
  large: { width: '400px', height: '400px' },
};

const positionMap = {
  'bottom-right': { bottom: '20px', right: '20px' },
  'bottom-left': { bottom: '20px', left: '20px' },
  'top-right': { top: '20px', right: '20px' },
  'top-left': { top: '20px', left: '20px' },
};

/**
 * GlobeDocked - Floating Docked Globe Widget
 * 
 * A compact, floating globe widget that appears after scroll completion.
 * Can be clicked to expand to full-screen view.
 */
const GlobeDocked: React.FC<GlobeDockedProps> = ({
  visible = true,
  position = 'bottom-right',
  size = 'medium',
  opacity = 0.8,
  onCityClick,
  onExpand,
  className = '',
}) => {
  const sizeStyles = sizeMap[size];
  const positionStyles = positionMap[position];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`${styles.globeDocked} ${className}`}
          style={{
            position: 'fixed',
            ...positionStyles,
            ...sizeStyles,
            zIndex: 1000,
            cursor: onExpand ? 'pointer' : 'default',
          }}
          onClick={onExpand}
          whileHover={onExpand ? { scale: 1.05, opacity: 1 } : {}}
        >
          {/* Globe Container */}
          <div className="w-full h-full relative">
            <GlobeCore
              mode="widget"
              onCityClick={onCityClick}
              enableCursorRotation={false}
              enableAutoRotation={true}
              enableScrollEffects={false}
            />
            
            {/* Expand Button Overlay */}
            {onExpand && (
              <div className={styles.globeDockedExpandOverlay}>
                <div className={styles.globeDockedExpandButton}>
                  Click to Expand
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobeDocked;

