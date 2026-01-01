'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface BabyGlobeProps {
  className?: string;
  height?: number;
}

const BabyGlobe: React.FC<BabyGlobeProps> = ({ 
  className = '', 
  height = 600 
}) => {
  // Generate random arc data with baby-themed colors
  const N = 20;
  const arcsData = useMemo(() => {
    return [...Array(N).keys()].map(() => {
      // Baby colors: soft pink, baby blue, mint green, lavender, peach
      const babyColors = [
        ['#FFB6C1', '#FFC0CB'], // Light Pink
        ['#ADD8E6', '#B0E0E6'], // Baby Blue
        ['#98FB98', '#F0FFF0'], // Mint Green
        ['#E6E6FA', '#DDA0DD'], // Lavender
        ['#FFDAB9', '#FFE4E1'], // Peach
        ['#FFF0F5', '#FFE4E1'], // Lavender Blush
      ];
      
      const colorPair = babyColors[Math.floor(Math.random() * babyColors.length)];
      
      return {
        startLat: (Math.random() - 0.5) * 180,
        startLng: (Math.random() - 0.5) * 360,
        endLat: (Math.random() - 0.5) * 180,
        endLng: (Math.random() - 0.5) * 360,
        color: colorPair,
      };
    });
  }, []);

  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <Globe
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        arcsData={arcsData}
        arcColor={'color'}
        arcDashLength={() => Math.random()}
        arcDashGap={() => Math.random()}
        arcDashAnimateTime={() => Math.random() * 4000 + 500}
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="#FFB6C1"
        atmosphereAltitude={0.15}
      />
    </div>
  );
};

export default BabyGlobe;










