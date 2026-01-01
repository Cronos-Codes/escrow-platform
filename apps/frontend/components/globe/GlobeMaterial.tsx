/**
 * GlobeMaterial.tsx
 * 
 * Custom shader materials for the globe visualization
 */

import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import glowShaderVertex from './shaders/glowShader.vert.glsl';
import glowShaderFragment from './shaders/glowShader.glsl';
import arcShaderVertex from './shaders/arcShader.vert.glsl';
import arcShaderFragment from './shaders/arcShader.glsl';

// Glow Shader Material
const GlowMaterial = {
  uniforms: {
    glowColor: { value: new THREE.Color('#D4AF37') },
    glowIntensity: { value: 0.3 },
    time: { value: 0 },
    viewDirection: { value: new THREE.Vector3(0, 0, 0) },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    uniform float glowIntensity;
    uniform float time;
    uniform vec3 viewDirection;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(viewDirection - vWorldPosition);
      
      float rim = 1.0 - max(dot(normal, viewDir), 0.0);
      rim = pow(rim, 2.0);
      
      float pulse = sin(time * 0.5) * 0.1 + 0.9;
      
      vec3 finalColor = glowColor * rim * glowIntensity * pulse;
      
      gl_FragColor = vec4(finalColor, rim * glowIntensity * pulse);
    }
  `,
  transparent: true,
  side: THREE.BackSide,
  blending: THREE.AdditiveBlending,
};

// Arc Shader Material
export function createArcMaterial(
  startColor: THREE.Color,
  endColor: THREE.Color,
  pulseSpeed: number = 1.0,
  pulseOffset: number = 0.0,
  arcLength: number = 1.0
) {
  return {
    uniforms: {
      startColor: { value: startColor },
      endColor: { value: endColor },
      time: { value: 0 },
      pulseSpeed: { value: pulseSpeed },
      pulseOffset: { value: pulseOffset },
      arcLength: { value: arcLength },
      alpha: { value: 0.8 },
    },
    vertexShader: `
      uniform float arcLength;
      varying float vDistance;
      
      void main() {
        vDistance = position.z * arcLength;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 startColor;
      uniform vec3 endColor;
      uniform float time;
      uniform float pulseSpeed;
      uniform float pulseOffset;
      uniform float arcLength;
      uniform float alpha;
      
      varying float vDistance;
      
      void main() {
        float position = vDistance / arcLength;
        
        float pulsePosition = mod((time * pulseSpeed) + pulseOffset, 1.0);
        float pulseWidth = 0.15;
        
        float distFromPulse = abs(position - pulsePosition);
        float pulseIntensity = 1.0 - smoothstep(0.0, pulseWidth, distFromPulse);
        
        vec3 gradientColor = mix(startColor, endColor, position);
        vec3 finalColor = gradientColor * (0.3 + pulseIntensity * 0.7);
        
        float edgeFade = smoothstep(0.0, 0.1, position) * smoothstep(1.0, 0.9, position);
        float finalAlpha = alpha * edgeFade * (0.4 + pulseIntensity * 0.6);
        
        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  };
}

/**
 * Hook to update shader uniforms with time
 */
export function useShaderTime(materialRef: React.RefObject<THREE.ShaderMaterial>, speed: number = 1.0) {
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime() * speed;
    }
  });
}

/**
 * Hook to update glow material view direction
 */
export function useGlowMaterial(
  materialRef: React.RefObject<THREE.ShaderMaterial>,
  camera: THREE.Camera
) {
  useFrame(() => {
    if (materialRef.current && camera) {
      materialRef.current.uniforms.viewDirection.value.copy(camera.position);
      materialRef.current.uniforms.time.value = performance.now() * 0.001;
    }
  });
}

