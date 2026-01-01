import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as MUIThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ThemeProvider } from '@escrow/ui';
import Lenis from 'lenis';
import '../styles/globals.css';
import '../styles/globe.css';

// Create Material-UI theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#D4AF37',
      dark: '#B8941F',
      light: '#E6C866',
      contrastText: '#1C2A39',
    },
    secondary: {
      main: '#1C2A39',
      dark: '#0F172A',
      light: '#334155',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1C2A39',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: ['Inter', 'system-ui', 'sans-serif'].join(','),
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.3px',
    },
    h6: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  // Initialize Lenis smooth scroll
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      console.log('[Smooth Scroll] Disabled - user prefers reduced motion');
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false, // Keep native touch scrolling on mobile
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    console.log('[Smooth Scroll] Lenis initialized ✅');

    // RAF loop for smooth scroll
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
      console.log('[Smooth Scroll] Lenis destroyed');
    };
  }, []);

  return (
    <SessionProvider>
      <ErrorBoundary>
        <MUIThemeProvider theme={muiTheme}>
          <CssBaseline />
          <ThemeProvider>
            <Component {...pageProps} />
          </ThemeProvider>
        </MUIThemeProvider>
      </ErrorBoundary>
    </SessionProvider>
  );
}

export default MyApp; 