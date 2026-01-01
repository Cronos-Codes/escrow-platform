'use client';

import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { aeonWaveVertexShader, aeonWaveFragmentShader } from './aeonWave';

/**
 * R3F-compatible shader material for aeon wave overlay
 */
export const AeonWaveMaterial = shaderMaterial(
  {
    u_time: 0,
    u_waveSpeed: 0.6,
    u_waveIntensity: 1.5,
    u_waveColor: new THREE.Color('#FFFFFF'),
    u_waveWidth: 0.12,
  },
  // Pass shaders directly - drei's shaderMaterial handles the wrapping
  aeonWaveVertexShader,
  aeonWaveFragmentShader
);

// Extend R3F with our custom material
extend({ AeonWaveMaterial });

// TypeScript declaration
declare module '@react-three/fiber' {
  interface ThreeElements {
    aeonWaveMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, any> & {
      u_time?: number;
      u_waveSpeed?: number;
      u_waveIntensity?: number;
      u_waveColor?: THREE.Color | string;
      u_waveWidth?: number;
    };
  }
}

