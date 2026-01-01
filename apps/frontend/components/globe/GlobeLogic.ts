/**
 * GlobeLogic.ts
 * 
 * Interaction logic for cursor-responsive globe rotation and scroll handling
 */

import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GlobeLogicOptions {
  /**
   * Enable cursor-responsive rotation
   */
  enableCursorRotation?: boolean;
  
  /**
   * Enable auto-rotation
   */
  enableAutoRotation?: boolean;
  
  /**
   * Auto-rotation speed (radians per second)
   */
  autoRotationSpeed?: number;
  
  /**
   * Cursor rotation sensitivity
   */
  cursorSensitivity?: number;
  
  /**
   * Smoothing factor for rotation (0-1, higher = smoother)
   */
  rotationSmoothing?: number;
  
  /**
   * Callback when scroll progress changes
   */
  onScrollProgress?: (progress: number) => void;
  
  /**
   * Callback for widget transition
   */
  onWidgetTransition?: (isWidget: boolean) => void;
}

export interface GlobeLogicReturn {
  /**
   * Ref to the globe group
   */
  globeRef: React.RefObject<THREE.Group>;
  
  /**
   * Current rotation state
   */
  rotation: { x: number; y: number };
  
  /**
   * Scroll progress (0-1)
   */
  scrollProgress: number;
  
  /**
   * Whether globe is in widget mode
   */
  isWidget: boolean;
}

/**
 * Hook for globe interaction logic
 */
export function useGlobeLogic(options: GlobeLogicOptions = {}): GlobeLogicReturn {
  const {
    enableCursorRotation = true,
    enableAutoRotation = true,
    autoRotationSpeed = 0.2,
    cursorSensitivity = 0.5,
    rotationSmoothing = 0.05,
    onScrollProgress,
    onWidgetTransition,
  } = options;

  const globeRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const targetRotation = useRef({ x: 0, y: 0 });
  const currentRotation = useRef({ x: 0, y: 0 });
  const mousePosition = useRef({ x: 0, y: 0 });
  const isMouseActive = useRef(false);
  const mouseIdleTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const scrollProgress = useRef(0);
  const isWidget = useRef(false);

  // Handle mouse movement
  useEffect(() => {
    if (!enableCursorRotation) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;
      
      mousePosition.current = { x, y };
      isMouseActive.current = true;
      
      // Update target rotation based on cursor position
      targetRotation.current = {
        x: y * cursorSensitivity,
        y: x * cursorSensitivity,
      };
      
      // Clear idle timeout
      if (mouseIdleTimeout.current) {
        clearTimeout(mouseIdleTimeout.current);
      }
      
      // Reset to center after 2 seconds of inactivity
      mouseIdleTimeout.current = setTimeout(() => {
        isMouseActive.current = false;
        targetRotation.current = { x: 0, y: 0 };
      }, 2000);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseIdleTimeout.current) {
        clearTimeout(mouseIdleTimeout.current);
      }
    };
  }, [enableCursorRotation, cursorSensitivity]);

  // Smooth rotation update
  useFrame((state, delta) => {
    if (!globeRef.current) return;

    // Smooth interpolation
    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * rotationSmoothing;
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * rotationSmoothing;

    // Apply auto-rotation when mouse is idle
    if (enableAutoRotation && !isMouseActive.current) {
      currentRotation.current.y += autoRotationSpeed * delta;
    }

    // Apply rotation to globe
    globeRef.current.rotation.x = currentRotation.current.x;
    globeRef.current.rotation.y = currentRotation.current.y;
  });

  // Scroll trigger setup
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      
      const progress = Math.min(1, Math.max(0, scrollY / (maxScroll || 1)));
      scrollProgress.current = progress;
      
      // Determine widget state (scroll > 60%)
      const wasWidget = isWidget.current;
      isWidget.current = progress > 0.6;
      
      if (wasWidget !== isWidget.current && onWidgetTransition) {
        onWidgetTransition(isWidget.current);
      }
      
      if (onScrollProgress) {
        onScrollProgress(progress);
      }
    };

    // Use GSAP ScrollTrigger for smooth scroll tracking
    const scrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        scrollProgress.current = self.progress;
        const wasWidget = isWidget.current;
        isWidget.current = self.progress > 0.6;
        
        if (wasWidget !== isWidget.current && onWidgetTransition) {
          onWidgetTransition(isWidget.current);
        }
        
        if (onScrollProgress) {
          onScrollProgress(self.progress);
        }
      },
    });

    // Fallback to native scroll listener
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    return () => {
      scrollTrigger.kill();
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, [onScrollProgress, onWidgetTransition]);

  return {
    globeRef,
    rotation: currentRotation.current,
    scrollProgress: scrollProgress.current,
    isWidget: isWidget.current,
  };
}

