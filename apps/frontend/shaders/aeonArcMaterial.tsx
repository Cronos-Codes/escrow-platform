'use client';

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { arcVertexShader, arcFragmentShader } from './arcAeonShader';

/**
 * R3F-compatible shader material for enhanced arcs
 * Uses shaderMaterial from drei for proper React Three Fiber integration
 */
export const AeonArcMaterial = shaderMaterial(
  {
    u_time: 0,
    u_colorStart: new THREE.Color('#D4AF37'),
    u_colorEnd: new THREE.Color('#FFFFFF'),
    u_intensity: 1.0,
    u_waveSpeed: 0.5,
    u_waveWidth: 0.15,
    u_glowStrength: 0.5,
  },
  // Pass shaders directly - drei's shaderMaterial handles the wrapping
  arcVertexShader,
  arcFragmentShader
);

// Extend R3F with our custom material
extend({ AeonArcMaterial });

// TypeScript declaration for the extended material
declare module '@react-three/fiber' {
  interface ThreeElements {
    aeonArcMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, any> & {
      u_time?: number;
      u_colorStart?: THREE.Color | string;
      u_colorEnd?: THREE.Color | string;
      u_intensity?: number;
      u_waveSpeed?: number;
      u_waveWidth?: number;
      u_glowStrength?: number;
    };
  }
}

