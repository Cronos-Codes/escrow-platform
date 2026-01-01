/**
 * useGlobeInteractions Hook
 * 
 * Extracted interaction logic for globe cursor rotation and scroll handling.
 * This hook can be reused across different globe implementations.
 */

import { useRef, useEffect, useState } from 'react';

export interface UseGlobeInteractionsOptions {
  /**
   * Globe ref from react-globe.gl
   */
  globeRef: React.RefObject<any>;
  
  /**
   * Whether interactions are enabled
   */
  enabled?: boolean;
  
  /**
   * Mode: 'hero' or 'widget'
   */
  mode?: 'hero' | 'widget';
  
  /**
   * Device capabilities
   */
  device?: {
    isLowEnd: boolean;
    isMobile: boolean;
    supportsTouch: boolean;
  };
  
  /**
   * Enable cursor rotation
   */
  enableCursorRotation?: boolean;
  
  /**
   * Enable auto rotation
   */
  enableAutoRotation?: boolean;
  
  /**
   * Callback when globe is ready
   */
  onGlobeReady?: () => void;
}

export interface UseGlobeInteractionsReturn {
  /**
   * Current mouse position (normalized -1 to 1)
   */
  mousePosition: { x: number; y: number };
  
  /**
   * Whether cursor rotation is active
   */
  isCursorActive: boolean;
  
  /**
   * Current rotation state
   */
  rotation: { lat: number; lng: number };
}

/**
 * Hook for managing globe interactions (cursor rotation, auto-rotation)
 */
export function useGlobeInteractions({
  globeRef,
  enabled = true,
  mode = 'hero',
  device = { isLowEnd: false, isMobile: false, supportsTouch: false },
  enableCursorRotation = true,
  enableAutoRotation = true,
  onGlobeReady,
}: UseGlobeInteractionsOptions): UseGlobeInteractionsReturn {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCursorActive, setIsCursorActive] = useState(false);
  const [rotation, setRotation] = useState({ lat: 0, lng: 0 });
  
  const cursorRotationRef = useRef({ lat: 0, lng: 0, isActive: false });
  const autoRotationLngRef = useRef(0);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    // Only enable interactions when conditions are met
    if (!enabled || !globeRef.current || mode !== 'hero' || device.supportsTouch) {
      cursorRotationRef.current = { lat: 0, lng: 0, isActive: false };
      setIsCursorActive(false);
      return;
    }

    let animationFrameId: number;
    let targetRotation = { lat: 0, lng: 0 };
    let mouseIdleTimeout: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Normalize mouse position to -1 to 1 range
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      
      setMousePosition({ x, y });
      setIsCursorActive(true);
      cursorRotationRef.current.isActive = true;
      
      // Clear idle timeout
      if (mouseIdleTimeout) clearTimeout(mouseIdleTimeout);
      
      // Reset to center after 2 seconds of no movement
      mouseIdleTimeout = setTimeout(() => {
        cursorRotationRef.current.isActive = false;
        setIsCursorActive(false);
        targetRotation = { lat: 0, lng: 0 };
      }, 2000);
      
      // Rotation intensity based on device capability
      const intensity = device.isLowEnd ? 10 : device.isMobile ? 15 : 20;
      targetRotation = {
        lat: y * intensity,
        lng: x * intensity,
      };
      
      cursorRotationRef.current = { ...targetRotation, isActive: true };
    };

    // Smooth rotation update loop
    const updateRotation = () => {
      if (globeRef.current && typeof globeRef.current.pointOfView === 'function' && mode === 'hero') {
        try {
          const currentPOV = globeRef.current.pointOfView() || { lat: 0, lng: 0, altitude: 2.5 };
          const lerpSpeed = device.isLowEnd ? 0.02 : device.isMobile ? 0.03 : 0.05;
          
          let newLat = currentPOV.lat;
          let newLng = currentPOV.lng;
          
          // Apply cursor rotation if mouse is active
          if (cursorRotationRef.current.isActive && enableCursorRotation) {
            newLat = currentPOV.lat + (targetRotation.lat - currentPOV.lat) * lerpSpeed;
            newLng = currentPOV.lng + (targetRotation.lng - currentPOV.lng) * lerpSpeed;
          } else if (enableAutoRotation) {
            // Apply auto-rotation when mouse is idle
            autoRotationLngRef.current += device.isLowEnd ? 0.0005 : device.isMobile ? 0.001 : 0.002;
            newLat = currentPOV.lat + (0 - currentPOV.lat) * lerpSpeed;
            newLng = autoRotationLngRef.current;
          }
          
          const newPOV = {
            lat: newLat,
            lng: newLng,
            altitude: currentPOV.altitude || 2.5,
          };
          
          setRotation({ lat: newLat, lng: newLng });
          globeRef.current.pointOfView(newPOV, 0);
        } catch (error) {
          console.warn('[useGlobeInteractions] Error updating rotation:', error);
        }
      }
      animationFrameId = requestAnimationFrame(updateRotation);
    };

    // Use passive event listener to not block scroll
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    if (isLoadedRef.current) {
      updateRotation();
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mouseIdleTimeout) {
        clearTimeout(mouseIdleTimeout);
      }
    };
  }, [
    enabled,
    globeRef,
    mode,
    device.isLowEnd,
    device.isMobile,
    device.supportsTouch,
    enableCursorRotation,
    enableAutoRotation,
  ]);

  // Mark as loaded when globe is ready
  useEffect(() => {
    if (globeRef.current && !isLoadedRef.current) {
      isLoadedRef.current = true;
      if (onGlobeReady) {
        onGlobeReady();
      }
    }
  }, [globeRef, onGlobeReady]);

  return {
    mousePosition,
    isCursorActive,
    rotation,
  };
}

