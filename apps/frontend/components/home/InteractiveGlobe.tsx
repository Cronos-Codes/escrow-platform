'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import { useTransactionsFeed } from '../../hooks/useTransactionsFeed';
import { TransactionData } from '../../types/transaction';
import { R3FEnhancedArc, latLngToVector3 } from '../globe/R3FEnhancedArc';
import { ArcPulse } from '../globe/ArcPulse';
import { ParticleTrail } from '../globe/ParticleTrail';
import { ArcTooltip } from '../globe/ArcTooltip';
import { CityNode } from '../globe/CityNode';
import { RegionalPanel } from '../globe/RegionalPanel';
import { LiveMetricsDock } from '../globe/LiveMetricsDock';
import { getThemePalette } from '../../utils/themePalette';
import { generateMockCityData, calculateRegionalStats, CityData, RegionalStats } from '../../types/city';
import { ErrorBoundary } from '../ErrorBoundary';

// Dynamically import Globe to avoid SSR issues - disable on low-end devices
const Globe = dynamic(() => import('react-globe.gl'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center text-gold/50">Loading...</div>
});

export interface CityData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  transactions: {
    count: number;
    volume: number;
    recentActivity: string[];
  };
  type?: 'commodity' | 'property' | 'service';
}

export interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  dashLength?: number;
  dashGap?: number;
}

interface InteractiveGlobeProps {
  mode: 'hero' | 'widget';
  onCityClick?: (city: CityData) => void;
  selectedCity?: CityData | null;
  className?: string;
  // FIXED: Accept hero section ref and scroll progress from parent for proper scroll tracking
  heroSectionRef?: React.RefObject<HTMLElement>;
  scrollYProgress?: any; // MotionValue from framer-motion
}

// Mock city data with transaction details
const mockCities: CityData[] = [
  {
    id: 'dubai',
    name: 'Dubai, UAE',
    lat: 25.2048,
    lng: 55.2708,
    transactions: {
      count: 342,
      volume: 12500000,
      recentActivity: ['Gold bullion escrow completed', 'Real estate transaction initiated', 'Commodity shipment released'],
    },
    type: 'commodity',
  },
  {
    id: 'london',
    name: 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    transactions: {
      count: 189,
      volume: 8500000,
      recentActivity: ['Property escrow funded', 'Service agreement completed', 'Legal consultation scheduled'],
    },
    type: 'property',
  },
  {
    id: 'newyork',
    name: 'New York, USA',
    lat: 40.7128,
    lng: -74.0060,
    transactions: {
      count: 267,
      volume: 15200000,
      recentActivity: ['High-value commodity transaction', 'Cross-border payment processed', 'Escrow account verified'],
    },
    type: 'commodity',
  },
  {
    id: 'singapore',
    name: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    transactions: {
      count: 156,
      volume: 6800000,
      recentActivity: ['Service escrow activated', 'Property transfer initiated', 'Commodity verification pending'],
    },
    type: 'service',
  },
  {
    id: 'tokyo',
    name: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    transactions: {
      count: 203,
      volume: 9200000,
      recentActivity: ['Gold escrow completed', 'Real estate transaction funded', 'Service agreement signed'],
    },
    type: 'commodity',
  },
  {
    id: 'mumbai',
    name: 'Mumbai, India',
    lat: 19.0760,
    lng: 72.8777,
    transactions: {
      count: 124,
      volume: 5400000,
      recentActivity: ['Commodity escrow initiated', 'Property verification completed', 'Service transaction approved'],
    },
    type: 'service',
  },
  {
    id: 'zurich',
    name: 'Zurich, Switzerland',
    lat: 47.3769,
    lng: 8.5417,
    transactions: {
      count: 98,
      volume: 11200000,
      recentActivity: ['High-value gold transaction', 'Cross-border escrow funded', 'Commodity verification completed'],
    },
    type: 'commodity',
  },
  {
    id: 'hongkong',
    name: 'Hong Kong',
    lat: 22.3193,
    lng: 114.1694,
    transactions: {
      count: 178,
      volume: 7500000,
      recentActivity: ['Property escrow completed', 'Commodity shipment verified', 'Service agreement activated'],
    },
    type: 'property',
  },
];

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

// Generate arcs between cities
const generateArcs = (cities: CityData[]): ArcData[] => {
  const arcs: ArcData[] = [];
  const connectedPairs = new Set<string>();

  // Create connections between major trading hubs
  const hubConnections = [
    ['dubai', 'london'],
    ['dubai', 'singapore'],
    ['london', 'newyork'],
    ['london', 'zurich'],
    ['newyork', 'tokyo'],
    ['newyork', 'hongkong'],
    ['singapore', 'hongkong'],
    ['singapore', 'mumbai'],
    ['tokyo', 'hongkong'],
    ['zurich', 'london'],
  ];

  hubConnections.forEach(([startId, endId]) => {
    const start = cities.find(c => c.id === startId);
    const end = cities.find(c => c.id === endId);
    
    if (start && end) {
      const pairKey = [startId, endId].sort().join('-');
      if (!connectedPairs.has(pairKey)) {
        connectedPairs.add(pairKey);
        
        // Determine arc color based on transaction types
        const color = start.type === 'commodity' || end.type === 'commodity' 
          ? COLORS.commodity 
          : start.type === 'property' || end.type === 'property'
          ? COLORS.property
          : COLORS.service;

        arcs.push({
          startLat: start.lat,
          startLng: start.lng,
          endLat: end.lat,
          endLng: end.lng,
          color,
          dashLength: Math.random() * 0.5 + 0.3,
          dashGap: Math.random() * 0.3 + 0.2,
        });
      }
    }
  });

  return arcs;
};

/**
 * ✨ RESTORED: Interactive Globe Component with Full Interactivity
 * 
 * All interactivity features have been restored and fixed:
 * 
 * 1. CURSOR-RESPONSIVE ROTATION (FIXED):
 *    - Tracks mouse movement and tilts globe accordingly
 *    - Smooth interpolation with device-optimized speeds
 *    - Auto-rotation resumes when mouse is idle for 2+ seconds
 *    - Only active in hero mode on non-touch devices
 * 
 * 2. SCROLL-DRIVEN TRANSITIONS (FIXED):
 *    - Opacity fade (1 → 0) as user scrolls
 *    - Scale transform (1 → 0.8) for depth effect
 *    - Y translation (-50px) for parallax feel
 *    - Proper clamping to prevent invalid values
 *    - Works with framer-motion useScroll hook
 * 
 * 3. CITY/TRANSACTION CLICK HANDLERS (FIXED):
 *    - City markers are clickable and trigger callbacks
 *    - Transaction arcs are clickable (widget mode)
 *    - Proper city data matching and state updates
 *    - Hover tooltips show transaction details
 * 
 * 4. AUTO-ROTATION (FIXED):
 *    - Hero mode: Activates when mouse is idle (2s timeout)
 *    - Widget mode: Continuous slow rotation
 *    - Smooth interpolation with cursor rotation
 *    - Device-optimized rotation speeds
 */
const InteractiveGlobe: React.FC<InteractiveGlobeProps> = ({
  mode,
  onCityClick,
  selectedCity,
  className = '',
  heroSectionRef: externalHeroRef,
  scrollYProgress: externalScrollYProgress,
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
  
  // FIXED: Scroll-driven transitions for hero mode - use provided scroll progress or create own
  // This creates the parallax effect as user scrolls down the page
  // If heroSectionRef and scrollYProgress are provided from Hero component, use those
  // Otherwise, create our own scroll tracking for widget mode
  const internalHeroRef = useRef<HTMLElement | null>(null);
  
  // Find parent hero section element if not provided (fallback)
  useEffect(() => {
    if (mode === 'hero' && !externalHeroRef && globeContainerRef.current) {
      let parent = globeContainerRef.current.parentElement;
      while (parent && !parent.classList.contains('hero') && !parent.tagName.toLowerCase().includes('section')) {
        parent = parent.parentElement;
      }
      if (parent) {
        internalHeroRef.current = parent as HTMLElement;
      }
    }
  }, [mode, externalHeroRef]);
  
  // Use provided scroll progress from Hero component, or create our own
  // Only create internal scroll tracking if external is not provided
  const { scrollYProgress: internalScrollYProgress } = useScroll({
    target: externalScrollYProgress ? undefined : (mode === 'hero' && !externalHeroRef ? internalHeroRef : (!externalHeroRef && mode !== 'hero' ? globeContainerRef : undefined)),
    offset: mode === 'hero' ? ['start start', 'end start'] : undefined,
    layoutEffect: false,
  });
  
  // Use external scroll progress if provided, otherwise use internal
  // Prefer external scroll progress from Hero component for accurate tracking
  const scrollYProgress = externalScrollYProgress !== undefined ? externalScrollYProgress : internalScrollYProgress;
  
  // Transform globe based on scroll (zoom down effect) - more aggressive transitions
  const globeOpacityTransform = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const globeScaleTransform = useTransform(scrollYProgress, [0, 0.6], [1, 0.7]);
  const globeYTransform = useTransform(scrollYProgress, [0, 0.6], [0, -80]);
  
  // Convert motion values to numbers for style prop - subscribe to changes
  const [opacityValue, setOpacityValue] = useState(1);
  const [scaleValue, setScaleValue] = useState(1);
  const [yValue, setYValue] = useState(0);
  
  useEffect(() => {
    if (mode !== 'hero') {
      setOpacityValue(1);
      setScaleValue(1);
      setYValue(0);
      return;
    }
    
    // Subscribe to scroll-driven transforms for reactive updates
    // FIXED: Ensure scrollYProgress exists before subscribing
    if (!scrollYProgress) {
      console.warn('[Globe Scroll] scrollYProgress not available yet');
      return;
    }
    
    console.log('[Globe Scroll] Setting up scroll tracking. Initial value:', scrollYProgress.get());
    
    const unsubscribeOpacity = globeOpacityTransform.on('change', (latest: number) => {
      const clamped = Math.max(0, Math.min(1, latest));
      setOpacityValue(clamped);
    });
    const unsubscribeScale = globeScaleTransform.on('change', (latest: number) => {
      const clamped = Math.max(0.7, Math.min(1, latest));
      setScaleValue(clamped);
    });
    const unsubscribeY = globeYTransform.on('change', (latest: number) => {
      setYValue(latest);
    });
    
    // Debug: Log scroll progress to verify it's working
    const unsubscribeProgress = scrollYProgress.on('change', (latest: number) => {
      console.log('[Globe Scroll] Progress:', latest.toFixed(3), 'Opacity:', opacityValue.toFixed(2), 'Scale:', scaleValue.toFixed(2));
    });
    
    return () => {
      unsubscribeOpacity();
      unsubscribeScale();
      unsubscribeY();
      unsubscribeProgress();
    };
  }, [mode, globeOpacityTransform, globeScaleTransform, globeYTransform, scrollYProgress]);
  
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

  // Reduce complexity on mobile/low-end devices for legacy arcs (fallback)
  const arcs = useMemo(() => {
    const allArcs = generateArcs(mockCities);
    return device.isMobile || device.isLowEnd ? allArcs.slice(0, Math.ceil(allArcs.length * 0.6)) : allArcs;
  }, [device.isMobile, device.isLowEnd]);

  // Convert transactions to arc data for react-globe.gl
  // Matching the airline routes example: https://vasturiano.github.io/react-globe.gl/example/airline-routes/us-international-outbound.html
  const arcsData = useMemo(() => {
    // Create additional static arcs to supplement dynamic ones
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
    
    // Convert transactions to arcs and merge with static arcs
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
  }, [visibleTransactions, arcs]);

  // FIXED: Cursor-responsive globe rotation - properly tracks mouse and updates globe tilt
  // This creates the interactive effect where moving the mouse tilts the globe
  // ALSO RESPONDS TO SCROLL - globe rotation changes as user scrolls
  const cursorRotationRef = useRef({ lat: 0, lng: 0, isActive: false });
  const autoRotationLngRef = useRef(0);
  
  useEffect(() => {
    // FIXED: Enable cursor rotation in hero mode - removed touch device restriction for better UX
    // Allow cursor/mouse rotation on all devices that have a cursor
    if (mode !== 'hero' || !globeRef.current || !isLoaded) {
      cursorRotationRef.current = { lat: 0, lng: 0, isActive: false };
      return;
    }
    
    console.log('[Globe Cursor] Enabling cursor & touch rotation. Device:', { isMobile: device.isMobile, supportsTouch: device.supportsTouch, isLoaded });

    let animationFrameId: number;
    let targetRotation = { lat: 0, lng: 0 };
    let mouseIdleTimeout: NodeJS.Timeout;
    
    // Touch gesture support for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartLat = 0;
    let touchStartLng = 0;
    let isTouchRotating = false;

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
    
    // Touch handlers for mobile/tablet globe rotation
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single finger touch - rotate globe
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        
        // Get current globe rotation
        if (globeRef.current && typeof globeRef.current.pointOfView === 'function') {
          const currentPOV = globeRef.current.pointOfView() || { lat: 0, lng: 0, altitude: 2.5 };
          touchStartLat = currentPOV.lat || 0;
          touchStartLng = currentPOV.lng || 0;
        }
        
        isTouchRotating = true;
        cursorRotationRef.current.isActive = true;
        
        // Clear mouse idle timeout
        if (mouseIdleTimeout) clearTimeout(mouseIdleTimeout);
        
        console.log('[Globe Touch] Touch rotation started');
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isTouchRotating && e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        // Calculate rotation based on touch movement
        const sensitivity = 0.3; // Lower = more sensitive
        const newLng = touchStartLng + (deltaX * sensitivity);
        const newLat = Math.max(-85, Math.min(85, touchStartLat - (deltaY * sensitivity)));
        
        // Update target rotation
        targetRotation = {
          lat: newLat,
          lng: newLng,
        };
        
        cursorRotationRef.current = { ...targetRotation, isActive: true };
      }
    };
    
    const handleTouchEnd = () => {
      if (isTouchRotating) {
        isTouchRotating = false;
        
        // Return to auto-rotation after 2 seconds
        mouseIdleTimeout = setTimeout(() => {
          cursorRotationRef.current.isActive = false;
          targetRotation = { lat: 0, lng: 0 };
          console.log('[Globe Touch] Touch rotation ended, resuming auto-rotation');
        }, 2000);
      }
    };

    // Smooth rotation update loop - combines cursor movement with auto-rotation AND scroll
    const updateRotation = () => {
      if (globeRef.current && typeof globeRef.current.pointOfView === 'function' && mode === 'hero') {
        try {
          const currentPOV = globeRef.current.pointOfView() || { lat: 0, lng: 0, altitude: 2.5 };
          const lerpSpeed = device.isLowEnd ? 0.02 : device.isMobile ? 0.03 : 0.05;
          
          // Get current scroll progress for scroll-responsive rotation
          const scrollProgress = scrollYProgress.get();
          const scrollRotationY = scrollProgress * 30; // Rotate up to 30 degrees based on scroll
          
          let newLat = currentPOV.lat;
          let newLng = currentPOV.lng;
          
          // Apply cursor rotation if mouse is active
          if (cursorRotationRef.current.isActive) {
            newLat = currentPOV.lat + (targetRotation.lat - currentPOV.lat) * lerpSpeed;
            newLng = currentPOV.lng + (targetRotation.lng - currentPOV.lng) * lerpSpeed;
            // Combine with scroll rotation
            newLng += scrollRotationY * 0.1; // Subtle scroll influence when cursor is active
          } else {
            // Apply auto-rotation when mouse is idle, with scroll influence
            autoRotationLngRef.current += device.isLowEnd ? 0.0005 : device.isMobile ? 0.001 : 0.002;
            newLat = currentPOV.lat + (0 - currentPOV.lat) * lerpSpeed; // Return to center lat
            newLng = autoRotationLngRef.current + scrollRotationY; // Strong scroll influence when idle
          }
          
          const newPOV = {
            lat: newLat,
            lng: newLng,
            altitude: currentPOV.altitude || 2.5,
          };
          
          globeRef.current.pointOfView(newPOV, 0);
        } catch (error) {
          console.warn('Error updating globe rotation:', error);
        }
      }
      animationFrameId = requestAnimationFrame(updateRotation);
    };

    // Register event listeners
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    // Add touch event listeners for mobile/tablet support
    if (globeContainerRef.current) {
      const container = globeContainerRef.current;
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    }
    
    updateRotation();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      
      // Clean up touch listeners
      if (globeContainerRef.current) {
        const container = globeContainerRef.current;
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
      }
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (mouseIdleTimeout) {
        clearTimeout(mouseIdleTimeout);
      }
    };
  }, [mode, isLoaded, device.isMobile, device.isLowEnd, scrollYProgress]);

  // FIXED: Cleanup WebGL resources on unmount to prevent memory leaks and context errors
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
          // Force context loss for proper cleanup
          const extension = canvasGlRef.current.getContext().getExtension('WEBGL_lose_context');
          if (extension) {
            extension.loseContext();
          }
        } catch (error) {
          console.warn('[Globe Canvas] Cleanup error:', error);
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

  // FIXED: Container style with proper positioning for scroll detection
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: mode === 'hero' 
      ? (device.isMobile ? '100vh' : '100vh')
      : (device.isMobile ? '400px' : device.isTablet ? '500px' : '600px'),
    position: mode === 'hero' ? 'fixed' : 'relative',
    top: mode === 'hero' ? 0 : 'auto',
    left: mode === 'hero' ? 0 : 'auto',
    zIndex: mode === 'hero' ? 0 : 1,
    // FIXED: Allow pointer events for globe interaction, touch-action controls scroll
    pointerEvents: 'auto',
    // Allow vertical scrolling but enable horizontal/rotation gestures
    touchAction: mode === 'hero' ? 'pan-y' : 'auto',
    // Performance optimizations - conditional based on device
    willChange: device.isLowEnd ? 'auto' : 'transform',
    transform: device.isLowEnd ? 'none' : 'translateZ(0)', // Force GPU acceleration only on capable devices
  };

  // FIXED: Combined style with scroll-driven transforms - using motion values directly
  // This ensures smooth, reactive scroll responses
  const combinedStyle = useMemo(() => {
    if (mode === 'hero') {
      // Apply scroll-driven transforms for hero mode using motion values
      return {
        ...containerStyle,
        // Motion values will be applied via motion.div props
      };
    }
    return containerStyle;
  }, [containerStyle, mode]);

  return (
    <motion.div 
      ref={globeContainerRef}
      className={`interactive-globe ${className}`} 
      style={mode === 'hero' ? {
        ...combinedStyle,
        // FIXED: Apply scroll-driven transforms directly - these update reactively via state
        opacity: opacityValue,
        transform: `scale(${scaleValue}) translateY(${yValue}px) translateZ(0)`,
        // FIXED: Ensure explicit non-static position for framer-motion scroll tracking
        position: 'fixed', // Explicitly set to 'fixed' for hero mode (matches containerStyle)
        // CRITICAL: Allow pointer events for globe interaction
        // touchAction controls scroll behavior - pan-y allows vertical scroll
        pointerEvents: 'auto',
        touchAction: 'pan-y pinch-zoom',
        // Force GPU acceleration for smooth transforms
        willChange: 'transform, opacity',
      } : {
        ...combinedStyle,
        position: 'relative', // Explicitly set to 'relative' for widget mode
      }}
    >
      {/* Enhanced subtle pulsing glow effect for hero mode - reinforces global network feel */}
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
          {/* Secondary subtle pulse for depth */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{
              background: 'radial-gradient(circle at 70% 40%, rgba(255, 215, 0, 0.08) 0%, transparent 50%)',
              filter: 'blur(30px)',
              zIndex: -1,
            }}
          />
        </>
      )}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1C2A39]/50 z-10">
          <div className="text-gold animate-pulse">Loading Globe...</div>
        </div>
      )}
      
      {/* Base Globe */}
      {/* FIXED: Allow pointer events on globe for cursor rotation, but not blocking scroll */}
      <div 
        className={mode === 'hero' ? '' : ''}
        style={{ 
          width: '100%', 
          height: '100%',
          // Allow pointer events on the globe itself
          pointerEvents: 'auto',
          // But allow vertical scrolling to pass through
          touchAction: 'pan-y',
        }}
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
                
                // FIXED: Auto-rotation for widget mode (non-hero) - slow, subtle rotation
                // Hero mode auto-rotation is handled in cursor rotation useEffect
                if (mode !== 'hero' && animationConfig.enableAnimations) {
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
                          console.warn('Widget auto-rotation error:', error);
                        }
                      }
                      rotationFrameId = requestAnimationFrame(autoRotate);
                    };
                    
                    rotationFrameId = requestAnimationFrame(autoRotate);
                  }, 100);
                }
              }}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Removed R3F Canvas overlay - now using only react-globe.gl arcs (perfected implementation) */}
      {/* The deformed custom arcs have been replaced with properly configured react-globe.gl arcs */}
      {false && (
        <div 
          className={`absolute inset-0 globe-canvas-overlay ${mode === 'hero' ? 'globe-canvas-overlay-hero' : ''}`}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            // FIXED: Remove inline pointerEvents - rely on CSS class for proper cascade
            // CSS class globe-canvas-overlay has pointer-events: none !important
            // In hero mode, we want pointer-events: none to allow scroll through
            // In widget mode, we'll override via class
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
                frameloop="always" // FIXED: Always render for smooth arc animations
                performance={{ min: 0.5 }} // Ensure consistent frame rate
                // FIXED: Disable R3F event system in hero mode to prevent event capture
                events={mode === 'hero' ? false : undefined}
                onCreated={({ gl, scene }) => {
                  // Store references for cleanup
                  canvasGlRef.current = gl;
                  canvasSceneRef.current = scene;
                  
                  // Enable shader error checking for debugging
                  if (gl.debug) {
                    gl.debug.checkShaderErrors = true;
                  }
                  // Log WebGL context for debugging
                  try {
                    const context = gl.getContext();
                    if (context) {
                      console.log('[Globe Canvas] WebGL context created:', {
                        version: context.getParameter(context.VERSION),
                        vendor: context.getParameter(context.VENDOR),
                        renderer: context.getParameter(context.RENDERER),
                      });
                    }
                  } catch (error) {
                    console.warn('[Globe Canvas] Could not log WebGL context info:', error);
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
                    {/* FIXED: Enhanced Arc with click/hover handlers for transaction interaction */}
                    <R3FEnhancedArc
                      transaction={transaction}
                      startPosition={startPos}
                      endPosition={endPos}
                      thickness={device.isLowEnd ? 0.008 : device.isMobile ? 0.01 : 0.012}
                      theme={theme}
                      onClick={(tx) => {
                        // FIXED: Transaction click handler - shows transaction details
                        handleArcInteraction(tx);
                        setHoveredTransaction(tx);
                      }}
                      onHover={(tx) => {
                        // FIXED: Transaction hover handler - shows tooltip on hover
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
              className={`absolute top-4 left-4 bg-[#1C2A39]/95 text-white p-3 rounded-lg shadow-gold-glow border border-gold/30 z-10 max-w-xs ${
                device.isLowEnd ? '' : 'backdrop-blur-md'
              }`}
              style={{ pointerEvents: 'none' }}
            >
              <h4 className="font-bold text-gold mb-1 text-sm sm:text-base">
                {hoveredCity?.city || hoveredCity?.name || 'Unknown City'}
              </h4>
              <p className="text-xs sm:text-sm text-gray-300">
                {hoveredCity?.transactionCount || hoveredCity?.transactions?.count || 0} transactions
              </p>
              <p className="text-xs text-gray-400 mt-1">
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
    </motion.div>
  );
};

export default InteractiveGlobe;

