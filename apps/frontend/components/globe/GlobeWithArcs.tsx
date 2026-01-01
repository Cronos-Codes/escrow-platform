/**
 * GlobeWithArcs.tsx
 * 
 * Based on react-globe.gl random arcs example
 * https://vasturiano.github.io/react-globe.gl/example/random-arcs/
 * 
 * Features:
 * - Animated arcs between cities with traveling pulses
 * - City markers with pulsing animation
 * - Cursor-responsive rotation
 * - Scroll compatibility
 * - Custom styling and colors
 */

'use client';

import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';
import { cities, arcConnections, getCityById } from './GlobeData';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gold/50">
      <div className="animate-pulse">Loading Globe...</div>
    </div>
  ),
});

export interface GlobeWithArcsProps {
  /**
   * Mode: 'hero' or 'widget'
   */
  mode?: 'hero' | 'widget';
  
  /**
   * Enable cursor rotation
   */
  enableCursorRotation?: boolean;
  
  /**
   * Enable auto-rotation
   */
  enableAutoRotation?: boolean;
  
  /**
   * Callback when city is clicked
   */
  onCityClick?: (cityId: string) => void;
  
  /**
   * Custom className
   */
  className?: string;
}

// Platform colors
const COLORS = {
  gold: '#D4AF37',
  darkBlue: '#1C2A39',
  arcColors: [
    '#D4AF37', // Gold
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ],
};

/**
 * GlobeWithArcs - Main Component
 * 
 * Based on react-globe.gl random arcs example with custom cities and styling
 */
const GlobeWithArcs: React.FC<GlobeWithArcsProps> = ({
  mode = 'hero',
  enableCursorRotation = true,
  enableAutoRotation = true,
  onCityClick,
  className = '',
}) => {
  const device = useDeviceOptimization();
  const globeRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  // Prepare arcs data for react-globe.gl
  // EXACT MATCH to random arcs example pattern
  const arcsData = useMemo(() => {
    // Use our custom arc connections but with the exact pattern from the example
    return arcConnections.map((arc, index) => {
      const startCity = getCityById(arc.startCityId);
      const endCity = getCityById(arc.endCityId);
      
      if (!startCity || !endCity) return null;
      
      // EXACT match to example: color array with two random colors from ['red', 'white', 'blue', 'green']
      const colorOptions = ['red', 'white', 'blue', 'green'];
      const startColor = arc.color || colorOptions[Math.round(Math.random() * 3)]; // EXACT: Math.round(Math.random() * 3)
      const endColor = arc.color || colorOptions[Math.round(Math.random() * 3)]; // EXACT: Math.round(Math.random() * 3)
      
      return {
        startLat: startCity.lat,
        startLng: startCity.lon,
        endLat: endCity.lat,
        endLng: endCity.lon,
        color: [startColor, endColor], // EXACT: array of two colors like example
      };
    }).filter(Boolean);
  }, []);

  // Prepare points data for cities
  const pointsData = useMemo(() => {
    return cities.map((city) => ({
      lat: city.lat,
      lng: city.lon,
      size: Math.max(0.3, Math.min(1.5, Math.log10((city.transactionCount || 1) + 1) * 0.3)),
      color: hoveredCity === city.id ? '#FFD700' : COLORS.gold,
      city: city,
    }));
  }, [hoveredCity]);

  // Cursor-responsive rotation with auto-rotation
  useEffect(() => {
    // Wait for globe to be loaded and ref to be ready
    if (!isLoaded) {
      return;
    }
    
    // Additional check: ensure globe ref is available and pointOfView exists
    if (!globeRef.current) {
      return;
    }

    let animationFrameId: number;
    let targetRotation = { lat: 0, lng: 0 };
    let mouseIdleTimeout: NodeJS.Timeout;
    let isMouseActive = false;
    let autoRotationLng = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableCursorRotation || device.supportsTouch) return;
      
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth) * 2 - 1;
      const y = (clientY / innerHeight) * 2 - 1;
      
      isMouseActive = true;
      
      if (mouseIdleTimeout) clearTimeout(mouseIdleTimeout);
      
      mouseIdleTimeout = setTimeout(() => {
        isMouseActive = false;
        targetRotation = { lat: 0, lng: 0 };
      }, 2000);
      
      const intensity = device.isLowEnd ? 10 : device.isMobile ? 15 : 20;
      targetRotation = {
        lat: y * intensity,
        lng: x * intensity,
      };
    };

    const updateRotation = () => {
      if (!globeRef.current) {
        animationFrameId = requestAnimationFrame(updateRotation);
        return;
      }

      // Check if pointOfView is available (might not be ready immediately)
      if (typeof globeRef.current.pointOfView !== 'function') {
        animationFrameId = requestAnimationFrame(updateRotation);
        return;
      }

      try {
        // Get current point of view
        const currentPOV = globeRef.current.pointOfView() || { lat: 0, lng: 0, altitude: mode === 'hero' ? 2.5 : 2 };
        const lerpSpeed = device.isLowEnd ? 0.02 : device.isMobile ? 0.03 : 0.05;
        
        let newLat = currentPOV.lat || 0;
        let newLng = currentPOV.lng || 0;
        
        if (isMouseActive && enableCursorRotation) {
          // Cursor-responsive rotation
          newLat = currentPOV.lat + (targetRotation.lat - currentPOV.lat) * lerpSpeed;
          newLng = currentPOV.lng + (targetRotation.lng - currentPOV.lng) * lerpSpeed;
        } else if (enableAutoRotation) {
          // Auto-rotation when mouse is idle
          autoRotationLng += device.isLowEnd ? 0.0005 : device.isMobile ? 0.001 : 0.002;
          newLat = currentPOV.lat + (0 - currentPOV.lat) * lerpSpeed; // Return to center
          newLng = autoRotationLng;
        }
        
        // Update point of view
        globeRef.current.pointOfView({
          lat: newLat,
          lng: newLng,
          altitude: currentPOV.altitude || (mode === 'hero' ? 2.5 : 2),
        }, 0);
      } catch (error) {
        // Silently handle errors - globe might not be fully initialized yet
        if (isLoaded) {
          console.warn('[GlobeWithArcs] Error updating rotation:', error);
        }
      }
      
      animationFrameId = requestAnimationFrame(updateRotation);
    };

    if (enableCursorRotation && !device.supportsTouch) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    
    updateRotation();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mouseIdleTimeout) {
        clearTimeout(mouseIdleTimeout);
      }
    };
  }, [enableCursorRotation, enableAutoRotation, isLoaded, device.supportsTouch, device.isLowEnd, device.isMobile, mode]);

  // Handle city click
  const handlePointClick = useCallback((point: any) => {
    if (mode === 'hero') return; // Disable clicks in hero mode to allow scroll
    
    const city = point.city || cities.find(c => c.lat === point.lat && c.lng === point.lng);
    if (city && onCityClick) {
      onCityClick(city.id);
    }
  }, [mode, onCityClick]);

  // Handle city hover
  const handlePointHover = useCallback((point: any, prevPoint: any) => {
    if (mode === 'hero' || device.supportsTouch) return;
    
    const city = point?.city || (point ? cities.find(c => c.lat === point.lat && c.lng === point.lng) : null);
    setHoveredCity(city ? city.id : null);
  }, [mode, device.supportsTouch]);

  return (
    <div 
      className={`globe-with-arcs ${className}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        pointerEvents: mode === 'hero' ? 'none' : 'auto',
      }}
    >
      <Globe
        ref={globeRef}
        // EXACT match to example: earth-night.jpg
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={mode === 'hero'}
        atmosphereColor={COLORS.gold}
        atmosphereAltitude={0.15}
        pointOfView={{ lat: 0, lng: 0, altitude: mode === 'hero' ? 2.5 : 2 }}
        
        // Arcs configuration - EXACT MATCH to random arcs example
        arcsData={arcsData}
        arcColor={'color'}  // EXACT: accessor string with quotes
        arcDashLength={() => Math.random()}  // EXACT: function returning random
        arcDashGap={() => Math.random()}    // EXACT: function returning random
        arcDashAnimateTime={() => Math.random() * 4000 + 500}  // EXACT: random * 4000 + 500
        
        // Points configuration (city markers) - our custom addition
        pointsData={pointsData}
        pointColor="color"
        pointRadius="size"
        pointResolution={2}
        pointLabel={(point: any) => {
          const city = point.city || cities.find(c => c.lat === point.lat && c.lng === point.lng);
          if (!city) return '';
          return `${city.name}\n${city.transactionCount || 0} transactions\n$${((city.totalValueUSD || 0) / 1000000).toFixed(1)}M`;
        }}
        onPointClick={handlePointClick}
        onPointHover={handlePointHover}
        
        // Globe ready callback
        onGlobeReady={() => {
          setIsLoaded(true);
          // Set initial point of view after a short delay to ensure globe is fully initialized
          setTimeout(() => {
            if (globeRef.current && typeof globeRef.current.pointOfView === 'function') {
              try {
                globeRef.current.pointOfView({ lat: 0, lng: 0, altitude: mode === 'hero' ? 2.5 : 2 }, 1000);
              } catch (error) {
                console.warn('[GlobeWithArcs] Error setting initial POV:', error);
              }
            }
          }, 100);
        }}
        
        // Performance optimizations
        rendererConfig={{
          antialias: !device.isLowEnd,
          alpha: true,
          powerPreference: device.isLowEnd ? 'low-power' : 'high-performance',
        }}
      />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1C2A39]/50 z-10">
          <div className="text-gold animate-pulse">Loading Globe...</div>
        </div>
      )}
    </div>
  );
};

export default GlobeWithArcs;

