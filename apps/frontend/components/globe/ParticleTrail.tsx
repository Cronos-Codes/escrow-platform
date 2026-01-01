'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { TransactionData } from '../../types/transaction';
import { getThemePalette } from '../../utils/themePalette';

export interface ParticleTrailProps {
  transaction: TransactionData;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  particleCount?: number;
  theme?: 'day' | 'night';
}

/**
 * Particle Trail Component
 * GPU-accelerated particle system following arc's leading edge
 */
export const ParticleTrail: React.FC<ParticleTrailProps> = ({
  transaction,
  startPosition,
  endPosition,
  particleCount = 20,
  theme,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  // Get theme palette
  const palette = useMemo(() => getThemePalette(theme), [theme]);

  // Early return if positions are invalid (after hooks)
  if (!startPosition || !endPosition || !transaction) {
    return null;
  }

  // Create particle geometry
  const geometry = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      
      // Start at arc start position
      positions[idx] = startPosition.x;
      positions[idx + 1] = startPosition.y;
      positions[idx + 2] = startPosition.z;
      
      // Random velocity (turbulence effect)
      const turbulence = 0.002;
      velocities[idx] = (Math.random() - 0.5) * turbulence;
      velocities[idx + 1] = (Math.random() - 0.5) * turbulence;
      velocities[idx + 2] = (Math.random() - 0.5) * turbulence;
      
      // Random lifetime offset
      lifetimes[i] = Math.random() * 2.0;
      
      // Random size
      sizes[i] = Math.random() * 0.02 + 0.01;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geom.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    return geom;
  }, [particleCount, startPosition]);

  // Create particle material
  const material = useMemo(() => {
    // Create particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 215, 0, 0.0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    return new THREE.PointsMaterial({
      map: texture,
      color: palette.waveColor,
      size: 0.02,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
  }, [palette.waveColor]);

  // Animation loop
  useEffect(() => {
    if (!pointsRef.current || !geometry) return;

    const direction = new THREE.Vector3().subVectors(endPosition, startPosition).normalize();
    const distance = startPosition.distanceTo(endPosition);
    const speed = distance / 3.0; // 3 seconds to travel

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      
      const positions = geometry.attributes.position.array as Float32Array;
      const velocities = geometry.attributes.velocity.array as Float32Array;
      const lifetimes = geometry.attributes.lifetime.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        const particleLifetime = (elapsed + lifetimes[i]) % 3.0;
        const t = particleLifetime / 3.0;
        
        // Base position along arc
        const basePos = new THREE.Vector3().lerpVectors(startPosition, endPosition, t);
        
        // Add turbulence
        positions[idx] = basePos.x + velocities[idx] * elapsed * 10;
        positions[idx + 1] = basePos.y + velocities[idx + 1] * elapsed * 10;
        positions[idx + 2] = basePos.z + velocities[idx + 2] * elapsed * 10;
        
        // Reset particle if it reaches the end
        if (t >= 1.0) {
          positions[idx] = startPosition.x;
          positions[idx + 1] = startPosition.y;
          positions[idx + 2] = startPosition.z;
          lifetimes[i] = elapsed % 2.0;
        }
      }
      
      geometry.attributes.position.needsUpdate = true;
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [geometry, particleCount, startPosition, endPosition]);

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose();
      if (material.map) {
        material.map.dispose();
      }
      material.dispose();
    };
  }, [geometry, material]);

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
};

