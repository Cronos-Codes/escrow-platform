/**
 * HeroGlobe.tsx
 * 
 * Wrapper component for GlobeWithArcs integration into homepage
 * Based on react-globe.gl random arcs example
 */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import GlobeWithArcs from '../globe/GlobeWithArcs';

// Dynamically import to avoid SSR issues
const GlobeWithArcsDynamic = dynamic(() => import('../globe/GlobeWithArcs'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-gold animate-pulse">Loading Globe...</div>
    </div>
  ),
});

interface HeroGlobeProps {
  className?: string;
  mode?: 'hero' | 'widget';
  onCityClick?: (cityId: string) => void;
  enableCursorRotation?: boolean;
  enableAutoRotation?: boolean;
}

export default function HeroGlobe({ 
  className = '', 
  mode = 'hero',
  onCityClick,
  enableCursorRotation = true,
  enableAutoRotation = true,
}: HeroGlobeProps) {
  return (
    <div className={`w-full h-full ${className}`} style={{ position: 'relative' }}>
      <GlobeWithArcsDynamic
        mode={mode}
        enableCursorRotation={enableCursorRotation}
        enableAutoRotation={enableAutoRotation}
        onCityClick={onCityClick}
      />
    </div>
  );
}

