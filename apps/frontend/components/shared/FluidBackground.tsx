import React, { useEffect, useRef, useState, useCallback } from 'react';

// Data highlight type matching BackgroundScene
type DataHighlight = { x: number; y: number; intensity: number };

interface FluidBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'auth';
  // Feature toggles (matching BackgroundScene)
  enablePatternOverlay?: boolean;
  enableDataHighlights?: boolean;
  dataHighlights?: DataHighlight[];
  enableAmbientGlow?: boolean;
  enableParallax?: boolean;
  enable3DObjectLayer?: boolean;
  videoSrc?: string;
  // Fluid-specific props
  colorful?: boolean;
  bloomEnabled?: boolean;
  sunraysEnabled?: boolean;
  backgroundColor?: string;
}

// WebGL support detection
const checkWebGLSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
};

// Parse hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : { r: 28, g: 42, b: 57 }; // Default #1C2A39
};

// Singleton script loader
let scriptLoadPromise: Promise<void> | null = null;
let scriptLoaded = false;

const loadFluidScript = (): Promise<void> => {
  if (scriptLoaded) {
    return Promise.resolve();
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="/fluid/script.js"]');
    if (existingScript) {
      scriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/fluid/script.js';
    script.async = true;
    script.id = 'fluid-simulation-script';

    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };

    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Failed to load fluid simulation script'));
    };

    document.body.appendChild(script);
  });

  return scriptLoadPromise;
};

const FluidBackground: React.FC<FluidBackgroundProps> = ({
  className = '',
  children,
  variant = 'default',
  enablePatternOverlay = true,
  enableDataHighlights = true,
  dataHighlights = [],
  enableAmbientGlow = true,
  enableParallax = true,
  enable3DObjectLayer = false,
  videoSrc,
  colorful = true,
  bloomEnabled = true,
  sunraysEnabled = true,
  backgroundColor = '#1C2A39',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Refs for direct DOM manipulation (performance optimization)
  const patternRef = useRef<HTMLDivElement>(null);
  const particleContainerRef = useRef<HTMLDivElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [fluidInitialized, setFluidInitialized] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);

  // Check WebGL support and reduced motion preference
  useEffect(() => {
    setMounted(true);
    setWebGLSupported(checkWebGLSupport());
    setPrefersReducedMotion(
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  // Optimized parallax scroll handler with requestAnimationFrame
  const updateParallax = useCallback(() => {
    if (!enableParallax || prefersReducedMotion) return;

    const now = performance.now();
    // Throttle to ~60fps
    if (now - lastScrollTime.current < 16) {
      rafRef.current = requestAnimationFrame(updateParallax);
      return;
    }

    lastScrollTime.current = now;
    const y = window.scrollY;

    // Direct DOM updates to avoid React re-renders
    if (patternRef.current) {
      const val = Math.min(y * 0.08, 200);
      patternRef.current.style.transform = `translate3d(0, ${val}px, 0)`;
    }

    if (particleContainerRef.current) {
      const val = Math.min(y * 0.04, 100);
      particleContainerRef.current.style.transform = `translate3d(0, ${val}px, 0)`;
    }

    if (highlightsRef.current) {
      const val = Math.min(y * 0.1, 150);
      highlightsRef.current.style.transform = `translate3d(0, ${val}px, 0)`;
    }

    rafRef.current = null;
  }, [enableParallax, prefersReducedMotion]);

  useEffect(() => {
    if (!enableParallax || prefersReducedMotion || !mounted) return;

    const handleScroll = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enableParallax, prefersReducedMotion, mounted, updateParallax]);

  // Initialize fluid simulation with proper canvas handling
  useEffect(() => {
    if (!mounted || prefersReducedMotion || !webGLSupported) {
      return;
    }

    let isCancelled = false;
    let scriptElement: HTMLScriptElement | null = null;

    const initializeFluid = async () => {
      try {
        // Wait for canvas to be rendered in DOM
        const checkCanvas = (): Promise<HTMLCanvasElement> => {
          return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50;

            const check = () => {
              const canvas = canvasRef.current;
              if (canvas && canvas.offsetParent !== null) {
                resolve(canvas);
              } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(check, 50);
              } else {
                reject(new Error('Canvas not found in DOM'));
              }
            };

            check();
          });
        };

        const canvas = await checkCanvas();
        if (isCancelled) return;

        // Set config before script loads
        const rgb = hexToRgb(backgroundColor);
        (window as any).fluidConfig = {
          COLORFUL: colorful,
          BLOOM: bloomEnabled,
          SUNRAYS: sunraysEnabled,
          BACK_COLOR: rgb,
          TRANSPARENT: false,
        };

        // Check if script already loaded
        const existingScript = document.querySelector('script[src="/fluid/script.js"]');
        if (existingScript) {
          // Script already loaded, just apply config
          if ((window as any).config) {
            Object.assign((window as any).config, {
              COLORFUL: colorful,
              BLOOM: bloomEnabled,
              SUNRAYS: sunraysEnabled,
              BACK_COLOR: rgb,
            });
            if ((window as any).updateKeywords) {
              (window as any).updateKeywords();
            }
          }
          setFluidInitialized(true);
          return;
        }

        // Load script - ensure canvas exists when script executes
        scriptElement = document.createElement('script');
        scriptElement.src = '/fluid/script.js';
        scriptElement.async = false; // Load synchronously to ensure canvas is ready

        scriptElement.onload = () => {
          if (isCancelled) return;

          // Apply config after script loads
          if ((window as any).config) {
            Object.assign((window as any).config, {
              COLORFUL: colorful,
              BLOOM: bloomEnabled,
              SUNRAYS: sunraysEnabled,
              BACK_COLOR: rgb,
            });
            if ((window as any).updateKeywords) {
              (window as any).updateKeywords();
            }
          }

          setFluidInitialized(true);
          (window as any).fluidInitialized = true;
        };

        scriptElement.onerror = () => {
          console.error('Failed to load fluid simulation script');
          setWebGLSupported(false);
        };

        // Append script - canvas must exist by now
        document.body.appendChild(scriptElement);
      } catch (error) {
        console.error('Failed to initialize fluid simulation:', error);
        setWebGLSupported(false);
      }
    };

    // Small delay to ensure canvas is rendered
    const timer = setTimeout(() => {
      initializeFluid();
    }, 100);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [mounted, prefersReducedMotion, webGLSupported, colorful, bloomEnabled, sunraysEnabled, backgroundColor]);

  // Handle window resize
  useEffect(() => {
    if (!mounted || !fluidInitialized) return;

    const handleResize = () => {
      // Trigger canvas resize if script exposes resize function
      if ((window as any).resizeFluidCanvas) {
        (window as any).resizeFluidCanvas();
      }
    };

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Also listen to window resize for orientation changes
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, fluidInitialized]);

  // Match fallback gradient to backgroundColor prop
  const fallbackGradient =
    variant === 'auth'
      ? 'linear-gradient(135deg, #1C2A39 0%, #0F1419 100%)'
      : `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}DD 50%, ${backgroundColor}AA 100%)`;

  return (
    <div
      ref={containerRef}
      className={`fluid-background relative w-full ${className}`}
      aria-hidden="true"
      style={{ minHeight: '100vh' }}
    >
      {/* Fluid simulation canvas - only render on client */}
      {mounted && !prefersReducedMotion && webGLSupported && (
        <div
          ref={particleContainerRef}
          className="fixed inset-0"
          style={{
            zIndex: 0,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
            pointerEvents: 'none',
          }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </div>
      )}

      {/* Fallback gradient for SSR, reduced motion, or WebGL not supported */}
      {(!mounted || prefersReducedMotion || !webGLSupported) && (
        <div
          className="fixed inset-0"
          style={{
            zIndex: 0,
            background: fallbackGradient,
          }}
        />
      )}

      {/* Pattern Overlay - increased opacity for better visibility */}
      {enablePatternOverlay && mounted && (
        <div
          ref={patternRef}
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 10,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
            opacity: 0.18,
            mixBlendMode: 'soft-light',
            backgroundImage: 'url(/patterns/hexagon.svg)',
            backgroundRepeat: 'repeat',
            backgroundSize: '120px',
          }}
        />
      )}

      {/* Data Highlights - responsive sizing */}
      {enableDataHighlights && dataHighlights.length > 0 && mounted && (
        <div
          ref={highlightsRef}
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 20,
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform',
          }}
        >
          {dataHighlights.map((d, i) => {
            // Responsive sizing using vw/vh units
            const baseSize = Math.max(1.5, 0.8 + d.intensity * 0.5); // vw units
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${d.x * 100}%`,
                  top: `${d.y * 100}%`,
                  width: `${baseSize}vw`,
                  height: `${baseSize}vw`,
                  minWidth: '16px',
                  minHeight: '16px',
                  maxWidth: '48px',
                  maxHeight: '48px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #E6C47F88 0%, transparent 80%)',
                  mixBlendMode: 'screen',
                  pointerEvents: 'none',
                  filter: 'blur(2px)',
                  opacity: 0.7,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
        </div>
      )}

      {/* Ambient Glow */}
      {enableAmbientGlow && mounted && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 30,
            background: 'radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
            animation: prefersReducedMotion ? 'none' : 'glowPulse 10s ease-in-out infinite',
          }}
        />
      )}

      {/* Gradient overlay for better text readability */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 40,
          background:
            variant === 'auth'
              ? 'linear-gradient(180deg, rgba(15, 20, 25, 0.4) 0%, rgba(15, 20, 25, 0.6) 100%)'
              : 'linear-gradient(180deg, rgba(28, 42, 57, 0.2) 0%, rgba(28, 42, 57, 0.5) 100%)',
        }}
      />

      {/* Content overlay - CRITICAL: Must enable pointer-events to allow interaction */}
      <div className="relative w-full" style={{ zIndex: 50, pointerEvents: 'auto' }}>
        {children}
      </div>

      {/* CSS for glow animation */}
      {enableAmbientGlow && mounted && !prefersReducedMotion && (
        <style>{`
          @keyframes glowPulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
          }
        `}</style>
      )}
    </div>
  );
};

export default FluidBackground;
