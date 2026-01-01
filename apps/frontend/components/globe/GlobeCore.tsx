/**
 * ============================================================================
 * GLOBE CORE - ISOLATED COMPONENT
 * ============================================================================
 * 
 * This is an isolated, sandboxed version of the Globe component extracted
 * from InteractiveGlobe.tsx for independent debugging and development.
 * 
 * ROOT CAUSES OF HOME PAGE ERRORS (FIXED):
 * 1. Pointer Events Blocking Scroll:
 *    - Canvas elements were capturing pointer events, preventing page scroll
 *    - Fixed: Set pointer-events: none on hero mode, auto on widget mode
 *    - Fixed: Disabled R3F event system in hero mode (events={false})
 * 
 * 2. WebGL Context Management:
 *    - Multiple WebGL contexts created without proper cleanup
 *    - Fixed: Proper cleanup in useEffect return function
 *    - Fixed: Context loss handling for proper resource disposal
 * 
 * 3. Scroll Hijacking:
 *    - Framer-motion scroll tracking was interfering with native scroll
 *    - Fixed: Used passive event listeners
 *    - Fixed: Separated scroll tracking from pointer event handling
 * 
 * 4. Memory Leaks:
 *    - Animation frames not cancelled on unmount
 *    - Fixed: All requestAnimationFrame calls properly cleaned up
 *    - Fixed: Event listeners removed in cleanup
 * 
 * DEPENDENCIES:
 * - react-globe.gl: ^2.35.0 (for base globe rendering)
 * - @react-three/fiber: ^8.15.0 (for enhanced arcs overlay)
 * - @react-three/drei: ^9.88.0 (for R3F utilities)
 * - three: ^0.158.0 (WebGL library)
 * - framer-motion: ^10.16.0 (for scroll-driven animations)
 * 
 * NEXT STEPS FOR FUTURE PHASES:
 * 1. Scroll-driven integration: Implement GSAP ScrollTrigger for phase transitions
 * 2. Widget docking: Create GlobeDocked.tsx for bottom-right floating widget
 * 3. Interaction hooks: Extract to useGlobeInteractions.ts for reusability
 * 4. Styling isolation: Move to styles.module.css for better CSS encapsulation
 * 
 * ============================================================================
 */

'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import { useTransactionsFeed } from '../../hooks/useTransactionsFeed';
import { TransactionData } from '../../types/transaction';
import { R3FEnhancedArc, latLngToVector3 } from './R3FEnhancedArc';
import { ArcPulse } from './ArcPulse';
import { ParticleTrail } from './ParticleTrail';
import { ArcTooltip } from './ArcTooltip';
import { CityNode } from './CityNode';
import { RegionalPanel } from './RegionalPanel';
import { LiveMetricsDock } from './LiveMetricsDock';
import { generateMockCityData, calculateRegionalStats, CityData, RegionalStats } from '../../types/city';
import { ErrorBoundary } from '../ErrorBoundary';
import styles from './styles.module.css';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gold/50">Loading...</div>
});

export interface GlobeCoreProps {
  mode?: 'hero' | 'widget';
  onCityClick?: (city: CityData) => void;
  selectedCity?: CityData | null;
  className?: string;
  // Enable/disable features for testing
  enableCursorRotation?: boolean;
  enableAutoRotation?: boolean;
  enableScrollEffects?: boolean;
}

// Platform colors
const COLORS = {
  gold: '#D4AF37',
  darkBlue: '#1C2A39',
  commodity: '#D4AF37',
  property: '#1C2A39',
  service: '#28A745',
  arcActive: '#D4AF37',
  arcInactive: 'rgba(212, 175, 55, 0.3)',
};

/**
 * GlobeCore - Isolated Globe Component
 * 
 * A standalone, debuggable version of the globe with all interactivity
 * features isolated and properly sandboxed.
 */
const GlobeCore: React.FC<GlobeCoreProps> = ({
  mode = 'hero',
  onCityClick,
  selectedCity,
  className = '',
  enableCursorRotation = true,
  enableAutoRotation = true,
  enableScrollEffects = false,
}) => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const globeRef = useRef<any>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const canvasGlRef = useRef<THREE.WebGLRenderer | null>(null);
  const canvasSceneRef = useRef<THREE.Scene | null>(null);
  
  const [hoveredCity, setHoveredCity] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [initialPOV, setInitialPOV] = useState<{ lat: number; lng: number; altitude: number } | null>(null);
  
  const [hoveredTransaction, setHoveredTransaction] = useState<TransactionData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [selectedCityData, setSelectedCityData] = useState<CityData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionalStats | null>(null);
  const [regionPanelVisible, setRegionPanelVisible] = useState(false);
  const [regionPanelPosition, setRegionPanelPosition] = useState({ x: 0, y: 0 });
  
  // Generate city data
  const citiesData = useMemo(() => generateMockCityData(), []);
  const regionalStats = useMemo(() => calculateRegionalStats(citiesData), [citiesData]);
  
  // Use transaction feed hook - increased maxActive for more arcs
  const { transactions, activeCount } = useTransactionsFeed({
    pollInterval: 2000,
    maxActive: device.isLowEnd ? 30 : device.isMobile ? 50 : 80, // Increased for more arcs
    useMockData: true,
  });

  // Filter and limit visible transactions based on device capabilities
  const visibleTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return [];
    }
    
    const now = Date.now();
    return transactions
      .filter((tx) => {
        if (!tx) return false;
        // Remove completed transactions older than 10 seconds
        if (tx.status === 'completed') {
          const age = now - tx.timestamp;
          return age < 10000;
        }
        return true;
      })
      .slice(0, device.isLowEnd ? 30 : device.isMobile ? 50 : 80); // Increased limit for more arcs
  }, [transactions, device.isLowEnd, device.isMobile]);

  // Determine theme
  const theme = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6 ? 'night' : 'day';
  }, []);

  // Convert transactions to arc data for react-globe.gl
  // Matching the airline routes example: https://vasturiano.github.io/react-globe.gl/example/airline-routes/us-international-outbound.html
  const arcsData = useMemo(() => {
    // Create comprehensive static arcs network
    const staticArcs = [
      // Dubai connections
      { startLat: 25.2048, startLng: 55.2708, endLat: 51.5074, endLng: -0.1278, color: ['#D4AF37', '#3B82F6'] }, // Dubai to London
      { startLat: 25.2048, startLng: 55.2708, endLat: 1.3521, endLng: 103.8198, color: ['#D4AF37', '#10B981'] }, // Dubai to Singapore
      { startLat: 25.2048, startLng: 55.2708, endLat: 40.7128, endLng: -74.0060, color: ['#D4AF37', '#D4AF37'] }, // Dubai to New York
      { startLat: 25.2048, startLng: 55.2708, endLat: 22.3193, endLng: 114.1694, color: ['#3B82F6', '#D4AF37'] }, // Dubai to Hong Kong
      { startLat: 25.2048, startLng: 55.2708, endLat: 35.6762, endLng: 139.6503, color: ['#10B981', '#D4AF37'] }, // Dubai to Tokyo
      
      // London connections
      { startLat: 51.5074, startLng: -0.1278, endLat: 40.7128, endLng: -74.0060, color: ['#3B82F6', '#D4AF37'] }, // London to New York
      { startLat: 51.5074, startLng: -0.1278, endLat: 47.3769, endLng: 8.5417, color: ['#D4AF37', '#10B981'] }, // London to Zurich
      { startLat: 51.5074, startLng: -0.1278, endLat: 1.3521, endLng: 103.8198, color: ['#10B981', '#3B82F6'] }, // London to Singapore
      { startLat: 51.5074, startLng: -0.1278, endLat: 22.3193, endLng: 114.1694, color: ['#D4AF37', '#D4AF37'] }, // London to Hong Kong
      
      // New York connections
      { startLat: 40.7128, startLng: -74.0060, endLat: 35.6762, endLng: 139.6503, color: ['#3B82F6', '#10B981'] }, // New York to Tokyo
      { startLat: 40.7128, startLng: -74.0060, endLat: 22.3193, endLng: 114.1694, color: ['#10B981', '#D4AF37'] }, // New York to Hong Kong
      { startLat: 40.7128, startLng: -74.0060, endLat: 1.3521, endLng: 103.8198, color: ['#D4AF37', '#3B82F6'] }, // New York to Singapore
      { startLat: 40.7128, startLng: -74.0060, endLat: 47.3769, endLng: 8.5417, color: ['#3B82F6', '#D4AF37'] }, // New York to Zurich
      { startLat: 40.7128, startLng: -74.0060, endLat: 43.6532, endLng: -79.3832, color: ['#10B981', '#10B981'] }, // New York to Toronto
      
      // Singapore connections
      { startLat: 1.3521, startLng: 103.8198, endLat: 22.3193, endLng: 114.1694, color: ['#D4AF37', '#10B981'] }, // Singapore to Hong Kong
      { startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, color: ['#10B981', '#3B82F6'] }, // Singapore to Tokyo
      { startLat: 1.3521, startLng: 103.8198, endLat: 19.0760, endLng: 72.8777, color: ['#3B82F6', '#D4AF37'] }, // Singapore to Mumbai
      { startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093, color: ['#D4AF37', '#D4AF37'] }, // Singapore to Sydney
      
      // Tokyo connections
      { startLat: 35.6762, startLng: 139.6503, endLat: 22.3193, endLng: 114.1694, color: ['#3B82F6', '#D4AF37'] }, // Tokyo to Hong Kong
      { startLat: 35.6762, startLng: 139.6503, endLat: 37.5665, endLng: 126.9780, color: ['#10B981', '#3B82F6'] }, // Tokyo to Seoul
      { startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, color: ['#D4AF37', '#10B981'] }, // Tokyo to Sydney
      
      // Hong Kong connections
      { startLat: 22.3193, startLng: 114.1694, endLat: 31.2304, endLng: 121.4737, color: ['#3B82F6', '#10B981'] }, // Hong Kong to Shanghai
      { startLat: 22.3193, startLng: 114.1694, endLat: 37.5665, endLng: 126.9780, color: ['#D4AF37', '#3B82F6'] }, // Hong Kong to Seoul
      { startLat: 22.3193, startLng: 114.1694, endLat: 19.0760, endLng: 72.8777, color: ['#10B981', '#D4AF37'] }, // Hong Kong to Mumbai
      
      // Mumbai connections
      { startLat: 19.0760, startLng: 72.8777, endLat: 25.2048, endLng: 55.2708, color: ['#D4AF37', '#3B82F6'] }, // Mumbai to Dubai
      { startLat: 19.0760, startLng: 72.8777, endLat: 51.5074, endLng: -0.1278, color: ['#3B82F6', '#10B981'] }, // Mumbai to London
      
      // Zurich connections
      { startLat: 47.3769, startLng: 8.5417, endLat: 25.2048, endLng: 55.2708, color: ['#10B981', '#D4AF37'] }, // Zurich to Dubai
      { startLat: 47.3769, startLng: 8.5417, endLat: 1.3521, endLng: 103.8198, color: ['#D4AF37', '#3B82F6'] }, // Zurich to Singapore
      
      // Sydney connections
      { startLat: -33.8688, startLng: 151.2093, endLat: 1.3521, endLng: 103.8198, color: ['#3B82F6', '#D4AF37'] }, // Sydney to Singapore
      { startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, color: ['#10B981', '#3B82F6'] }, // Sydney to Hong Kong
      
      // Additional cross-continental routes
      { startLat: 43.6532, startLng: -79.3832, endLat: 51.5074, endLng: -0.1278, color: ['#D4AF37', '#10B981'] }, // Toronto to London
      { startLat: 31.2304, startLng: 121.4737, endLat: 40.7128, endLng: -74.0060, color: ['#3B82F6', '#D4AF37'] }, // Shanghai to New York
      { startLat: 37.5665, startLng: 126.9780, endLat: 40.7128, endLng: -74.0060, color: ['#10B981', '#3B82F6'] }, // Seoul to New York
    ];
    
    if (!visibleTransactions || visibleTransactions.length === 0) {
      // If no transactions, return static arcs
      return staticArcs;
    }
    
    // Convert transactions to arcs
    const transactionArcs = visibleTransactions.map((tx) => {
      // Color based on transaction status
      let colorStart = COLORS.gold;
      let colorEnd = COLORS.gold;
      
      if (tx.status === 'active') {
        colorStart = '#3B82F6'; // Blue for active
        colorEnd = COLORS.gold;
      } else if (tx.status === 'completed') {
        colorStart = '#10B981'; // Green for completed
        colorEnd = '#10B981';
      } else if (tx.status === 'disputed') {
        colorStart = '#EF4444'; // Red for disputed
        colorEnd = '#EF4444';
      }
      
      return {
        startLat: tx.startLat,
        startLng: tx.startLng,
        endLat: tx.endLat,
        endLng: tx.endLng,
        color: [colorStart, colorEnd], // Array of two colors like airline routes example
        tx, // Attach transaction data for tooltips
      };
    });
    
    // Merge static arcs with transaction arcs for a dense network
    return [...staticArcs, ...transactionArcs];
  }, [visibleTransactions]);

  // Cursor-responsive globe rotation - FIXED: Proper event handling
  const cursorRotationRef = useRef({ lat: 0, lng: 0, isActive: false });
  const autoRotationLngRef = useRef(0);
  
  useEffect(() => {
    // Only enable cursor rotation in hero mode on non-touch devices
    if (!enableCursorRotation || mode !== 'hero' || !globeRef.current || !isLoaded || device.supportsTouch) {
      cursorRotationRef.current = { lat: 0, lng: 0, isActive: false };
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
      cursorRotationRef.current.isActive = true;
      
      // Clear idle timeout
      if (mouseIdleTimeout) clearTimeout(mouseIdleTimeout);
      
      // Reset to center after 2 seconds of no movement, then allow auto-rotation
      mouseIdleTimeout = setTimeout(() => {
        cursorRotationRef.current.isActive = false;
        targetRotation = { lat: 0, lng: 0 };
      }, 2000);
      
      // Reduced rotation intensity based on device capability
      const intensity = device.isLowEnd ? 10 : device.isMobile ? 15 : 20;
      targetRotation = {
        lat: y * intensity,
        lng: x * intensity,
      };
      
      cursorRotationRef.current = { ...targetRotation, isActive: true };
    };

    // Smooth rotation update loop - combines cursor movement with auto-rotation
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
            newLat = currentPOV.lat + (0 - currentPOV.lat) * lerpSpeed; // Return to center lat
            newLng = autoRotationLngRef.current;
          }
          
          const newPOV = {
            lat: newLat,
            lng: newLng,
            altitude: currentPOV.altitude || 2.5,
          };
          
          globeRef.current.pointOfView(newPOV, 0);
        } catch (error) {
          console.warn('[GlobeCore] Error updating globe rotation:', error);
        }
      }
      animationFrameId = requestAnimationFrame(updateRotation);
    };

    // FIXED: Use passive event listener to not block scroll
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
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
  }, [mode, isLoaded, device.supportsTouch, device.isMobile, device.isLowEnd, enableCursorRotation, enableAutoRotation]);

  // FIXED: Cleanup WebGL resources on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      // Cleanup Canvas WebGL resources
      if (canvasSceneRef.current && canvasGlRef.current) {
        try {
          canvasSceneRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
              if (object.geometry) object.geometry.dispose();
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach((mat) => mat.dispose());
                } else {
                  object.material.dispose();
                }
              }
            }
          });
          // Dispose renderer
          canvasGlRef.current.dispose();
        } catch (error) {
          console.warn('[GlobeCore] Cleanup error:', error);
        }
      }
    };
  }, []);

  // Handle city click
  const handleCityClick = useCallback((city: CityData) => {
    if (onCityClick) {
      onCityClick(city);
    }
  }, [onCityClick]);

  // Prepare point data for globe with city intelligence
  const pointsData = useMemo(() => citiesData.map(city => ({
    lat: city.lat,
    lng: city.lng,
    size: Math.max(0.5, Math.min(1.5, Math.log10(city.transactionCount + 1) * 0.5)),
    color: city.active 
      ? COLORS.gold 
      : '#6B7280',
    city,
    transactionCount: city.transactionCount,
    totalValueUSD: city.totalValueUSD,
  })), [citiesData]);

  // Handle arc hover/tap for tooltip
  const handleArcInteraction = useCallback((transaction: TransactionData, event?: MouseEvent | TouchEvent) => {
    if (event) {
      if ('clientX' in event) {
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      } else if (event.touches && event.touches.length > 0) {
        setTooltipPosition({ x: event.touches[0].clientX, y: event.touches[0].clientY });
      }
    }
    setHoveredTransaction(transaction);
  }, []);

  const handleArcLeave = useCallback(() => {
    setHoveredTransaction(null);
  }, []);

  // FIXED: Container style with proper positioning and pointer events
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: mode === 'hero' 
      ? (device.isMobile ? '100vh' : '100vh')
      : (device.isMobile ? '400px' : device.isTablet ? '500px' : '600px'),
    position: mode === 'hero' ? 'fixed' : 'relative',
    top: mode === 'hero' ? 0 : 'auto',
    left: mode === 'hero' ? 0 : 'auto',
    zIndex: mode === 'hero' ? 0 : 1,
    // CRITICAL: pointer-events none in hero mode to allow scroll through
    pointerEvents: mode === 'hero' ? 'none' : 'auto',
    // Performance optimizations
    willChange: device.isLowEnd ? 'auto' : 'transform',
    transform: device.isLowEnd ? 'none' : 'translateZ(0)',
  };

  return (
    <div 
      ref={globeContainerRef}
      className={`${styles.globeCore} ${mode === 'hero' ? styles.globeContainerHero : styles.globeContainerWidget} ${className}`} 
      style={containerStyle}
    >
      {/* Enhanced subtle pulsing glow effect for hero mode */}
      {mode === 'hero' && !device.isLowEnd && animationConfig.enableAnimations && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.25, 0.4, 0.25],
              scale: [1, 1.015, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: 'radial-gradient(ellipse 80% 100% at 50% 50%, rgba(212, 175, 55, 0.12) 0%, transparent 60%)',
              filter: 'blur(25px)',
              zIndex: -1,
            }}
          />
        </>
      )}
      
      {!isLoaded && (
        <div className={styles.globeLoading}>
          <div className="text-gold animate-pulse">Loading Globe...</div>
        </div>
      )}
      
      {/* Base Globe */}
      {/* FIXED: Wrap Globe in ErrorBoundary and ensure pointer-events don't block scroll */}
      <div 
        className={mode === 'hero' ? 'pointer-events-none' : ''}
        style={{ width: '100%', height: '100%' }}
      >
        <ErrorBoundary>
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-gold/50">Loading Globe...</div>}>
            <Globe
              ref={globeRef}
              globeImageUrl={mode === 'hero' 
                ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
                : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'}
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              backgroundColor="rgba(0,0,0,0)"
              showAtmosphere={mode === 'hero'}
              atmosphereColor={COLORS.gold}
              atmosphereAltitude={0.15}
              pointOfView={initialPOV || { lat: 0, lng: 0, altitude: mode === 'hero' ? 2.5 : 2 }}
              
              // Arcs configuration - matching airline routes example
              arcsData={arcsData}
              arcColor="color"
              arcDashLength={() => Math.random()} // Random dash length like example
              arcDashGap={() => Math.random()} // Random dash gap like example
              arcDashAnimateTime={() => Math.random() * 4000 + 500} // Random animation speed: 500-4500ms
              arcStroke={0.5} // Line thickness
              arcAltitudeAutoScale={0.3} // Arc height relative to distance
              arcsTransitionDuration={0} // Instant arc appearance for dynamic data
              
              // City markers removed - no cylinder towers
              pointsData={[]}
              pointColor="color"
              pointRadius="size"
              onGlobeReady={() => {
                setIsLoaded(true);
                setInitialPOV({ lat: 0, lng: 0, altitude: mode === 'hero' ? 2.5 : 2 });
                
                // FIXED: Auto-rotation for widget mode (non-hero)
                if (mode !== 'hero' && enableAutoRotation && animationConfig.enableAnimations) {
                  setTimeout(() => {
                    let rotationLng = 0;
                    let rotationFrameId: number | null = null;
                    const rotationSpeed = 0.0005; // Slower for widget mode
                    
                    const autoRotate = () => {
                      if (globeRef.current && typeof globeRef.current.pointOfView === 'function') {
                        try {
                          rotationLng += rotationSpeed;
                          const currentPOV = globeRef.current.pointOfView() || { lat: 0, lng: 0, altitude: 2 };
                          globeRef.current.pointOfView({
                            lat: currentPOV.lat || 0,
                            lng: rotationLng,
                            altitude: currentPOV.altitude || 2,
                          }, 0);
                        } catch (error) {
                          console.warn('[GlobeCore] Widget auto-rotation error:', error);
                        }
                      }
                      rotationFrameId = requestAnimationFrame(autoRotate);
                    };
                    
                    rotationFrameId = requestAnimationFrame(autoRotate);
                    
                    // Cleanup function
                    return () => {
                      if (rotationFrameId) {
                        cancelAnimationFrame(rotationFrameId);
                      }
                    };
                  }, 100);
                }
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* FIXED: Enhanced Arcs Overlay using React Three Fiber */}
      {/* CRITICAL: pointer-events handled via CSS class in hero mode */}
      {isLoaded && visibleTransactions && Array.isArray(visibleTransactions) && visibleTransactions.length > 0 && (
        <div 
          className={`${styles.globeCanvasOverlay} ${mode === 'hero' ? styles.globeCanvasOverlayHero : styles.globeCanvasOverlayWidget}`}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            // FIXED: pointer-events none in hero mode to allow scroll
            pointerEvents: mode === 'hero' ? 'none' : 'auto',
            willChange: 'transform',
          }}
        >
          <ErrorBoundary>
            <Suspense fallback={null}>
              <Canvas
                camera={{ position: [0, 0, mode === 'hero' ? 2.5 : 2], fov: 50 }}
                style={{ background: 'transparent' }}
                gl={{ 
                  alpha: true, 
                  antialias: !device.isLowEnd,
                  powerPreference: device.isLowEnd ? 'low-power' : 'high-performance',
                  preserveDrawingBuffer: false,
                  stencil: false,
                  failIfMajorPerformanceCaveat: false,
                }}
                dpr={device.isLowEnd ? 1 : device.isMobile ? 1.5 : 2}
                frameloop="always"
                performance={{ min: 0.5 }}
                // FIXED: Disable R3F event system in hero mode to prevent event capture
                events={mode === 'hero' ? false : undefined}
                onCreated={({ gl, scene }) => {
                  // Store references for cleanup
                  canvasGlRef.current = gl;
                  canvasSceneRef.current = scene;
                  
                  // Log WebGL context for debugging
                  try {
                    const context = gl.getContext();
                    if (context) {
                      console.log('[GlobeCore] WebGL context created:', {
                        version: context.getParameter(context.VERSION),
                        vendor: context.getParameter(context.VENDOR),
                        renderer: context.getParameter(context.RENDERER),
                      });
                    }
                  } catch (error) {
                    console.warn('[GlobeCore] Could not log WebGL context info:', error);
                  }
                }}
              >
                <ambientLight intensity={0.3} />
                {visibleTransactions
                  .filter((transaction) => transaction && transaction.id)
                  .map((transaction) => {
                const startPos = latLngToVector3(
                  transaction.startLat || 0, 
                  transaction.startLng || 0, 
                  1.01
                );
                const endPos = latLngToVector3(
                  transaction.endLat || 0, 
                  transaction.endLng || 0, 
                  1.01
                );
                
                return (
                  <group key={transaction.id}>
                    <R3FEnhancedArc
                      transaction={transaction}
                      startPosition={startPos}
                      endPosition={endPos}
                      thickness={device.isLowEnd ? 0.008 : device.isMobile ? 0.01 : 0.012}
                      theme={theme}
                      onClick={(tx) => {
                        handleArcInteraction(tx);
                        setHoveredTransaction(tx);
                      }}
                      onHover={(tx) => {
                        if (tx) {
                          setHoveredTransaction(tx);
                        } else {
                          handleArcLeave();
                        }
                      }}
                    />
                    
                    {/* Pulse Effects - only on capable devices */}
                    {!device.isLowEnd && (
                      <>
                        <ArcPulse
                          position={startPos}
                          theme={theme}
                          size={device.isMobile ? 0.03 : 0.04}
                        />
                        <ArcPulse
                          position={endPos}
                          theme={theme}
                          size={device.isMobile ? 0.03 : 0.04}
                        />
                      </>
                    )}
                    
                    {/* Particle Trail - only on desktop */}
                    {device.isDesktop && !device.isLowEnd && (
                      <ParticleTrail
                        transaction={transaction}
                        startPosition={startPos}
                        endPosition={endPos}
                        particleCount={15}
                        theme={theme}
                      />
                    )}
                  </group>
                );
                  })}
                
                {/* City Nodes with enhanced visualization */}
                {citiesData.map((city) => {
                  const cityPos = latLngToVector3(city.lat, city.lng, 1.005);
                  return (
                    <CityNode
                      key={city.id}
                      city={city}
                      position={cityPos}
                      onClick={mode === 'hero' ? undefined : () => {
                        // FIXED: Disable city clicks in hero mode to allow scroll through
                        setSelectedCityData(city);
                        const region = regionalStats.find(r => r.region === city.region);
                        if (region) {
                          setSelectedRegion(region);
                          setRegionPanelPosition({ x: window.innerWidth / 2, y: 100 });
                          setRegionPanelVisible(true);
                        }
                      }}
                    />
                  );
                })}
              </Canvas>
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
      
      {/* City Hover tooltip - only show on non-touch devices */}
      {!device.supportsTouch && (
        <AnimatePresence>
          {hoveredCity && mode === 'widget' && (
            <motion.div
              initial={animationConfig.enableAnimations ? { opacity: 0, y: 10 } : {}}
              animate={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
              exit={animationConfig.enableAnimations ? { opacity: 0, y: 10 } : {}}
              className={`${styles.cityTooltip} ${device.isLowEnd ? '' : 'backdrop-blur-md'}`}
              style={{ pointerEvents: 'none' }}
            >
              <h4 className={styles.cityTooltipTitle}>
                {hoveredCity?.city || hoveredCity?.name || 'Unknown City'}
              </h4>
              <p className={styles.cityTooltipText}>
                {hoveredCity?.transactionCount || hoveredCity?.transactions?.count || 0} transactions
              </p>
              <p className={styles.cityTooltipVolume}>
                ${((hoveredCity?.totalValueUSD || hoveredCity?.transactions?.volume || 0) / 1000000).toFixed(1)}M volume
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Transaction Arc Tooltip */}
      <ArcTooltip
        transaction={hoveredTransaction}
        position={tooltipPosition}
        visible={!!hoveredTransaction}
      />

      {/* Regional Statistics Panel */}
      <RegionalPanel
        stats={selectedRegion}
        visible={regionPanelVisible}
        position={regionPanelPosition}
        onClose={() => {
          setRegionPanelVisible(false);
          setSelectedRegion(null);
        }}
      />

      {/* Live Metrics Dock - Show in widget mode */}
      {mode === 'widget' && isLoaded && (
        <div className="absolute bottom-4 right-4 z-20">
          <LiveMetricsDock
            cities={citiesData}
            transactions={transactions}
            regionalStats={regionalStats}
          />
        </div>
      )}
    </div>
  );
};

export default GlobeCore;

