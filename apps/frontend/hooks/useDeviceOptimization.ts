import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLowEnd: boolean;
  supportsTouch: boolean;
  reducedMotion: boolean;
  pixelDensity: number;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

/**
 * Advanced device detection and optimization hook
 * Provides comprehensive device information for responsive design and performance optimization
 */
export const useDeviceOptimization = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLowEnd: false,
    supportsTouch: false,
    reducedMotion: false,
    pixelDensity: 1,
    screenWidth: 0,
    screenHeight: 0,
    orientation: 'portrait',
  });

  useEffect(() => {
    const detectDevice = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent || '';
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Sophisticated mobile detection
      const isMobileDevice = width < 768 || /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTabletDevice = (width >= 768 && width < 1024) || /iPad/i.test(userAgent);
      const isDesktopDevice = width >= 1024;
      
      // Low-end device detection based on hardware capabilities
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const isLowEndDevice = (
        hardwareConcurrency <= 2 || 
        deviceMemory <= 2 ||
        width < 375 ||
        /Android.*[2-5]\.|iPhone.*OS [5-9]_/i.test(userAgent) ||
        /CPU.*OS [5-9]_/i.test(userAgent)
      );

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Determine orientation
      const orientation = width > height ? 'landscape' : 'portrait';

      setDeviceInfo({
        isMobile: isMobileDevice,
        isTablet: isTabletDevice,
        isDesktop: isDesktopDevice,
        isLowEnd: isLowEndDevice,
        supportsTouch: isTouchDevice,
        reducedMotion: prefersReducedMotion,
        pixelDensity: window.devicePixelRatio || 1,
        screenWidth: width,
        screenHeight: height,
        orientation,
      });
    };

    detectDevice();
    
    // Listen for resize and orientation changes
    window.addEventListener('resize', detectDevice, { passive: true });
    window.addEventListener('orientationchange', detectDevice, { passive: true });
    
    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => detectDevice();
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', detectDevice);
      window.removeEventListener('orientationchange', detectDevice);
      mediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return deviceInfo;
};

/**
 * Get responsive breakpoint configuration
 */
export const useResponsiveBreakpoints = () => {
  const device = useDeviceOptimization();
  
  return {
    isXs: device.screenWidth < 640,
    isSm: device.screenWidth >= 640 && device.screenWidth < 768,
    isMd: device.screenWidth >= 768 && device.screenWidth < 1024,
    isLg: device.screenWidth >= 1024 && device.screenWidth < 1280,
    isXl: device.screenWidth >= 1280 && device.screenWidth < 1536,
    is2xl: device.screenWidth >= 1536,
  };
};

/**
 * Get animation configuration based on device capabilities
 */
export const useAnimationConfig = () => {
  const device = useDeviceOptimization();
  
  return {
    // Spring animation configs based on device tier
    springConfig: device.isLowEnd 
      ? { stiffness: 200, damping: 50 }
      : device.isMobile 
        ? { stiffness: 280, damping: 45 }
        : { stiffness: 350, damping: 40 },
    
    // Animation durations
    duration: device.reducedMotion ? 0 : device.isLowEnd ? 0.2 : device.isMobile ? 0.3 : 0.5,
    
    // Enable/disable animations
    enableAnimations: !device.reducedMotion,
    
    // Transform configurations
    enableTransforms: !device.isLowEnd,
    enableBackdropBlur: !device.isLowEnd && device.isDesktop,
  };
};

/**
 * Get touch-friendly interaction configuration
 */
export const useTouchConfig = () => {
  const device = useDeviceOptimization();
  
  return {
    // Minimum touch target size (WCAG 2.1 AA: 44x44px)
    minTouchTarget: 44,
    
    // Drag threshold for touch devices
    dragThreshold: device.supportsTouch ? 50 : 100,
    
    // Enable hover states only on non-touch devices
    enableHover: !device.supportsTouch && device.isDesktop,
  };
};



