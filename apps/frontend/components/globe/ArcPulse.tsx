'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { getThemePalette } from '../../utils/themePalette';

export interface ArcPulseProps {
  position: THREE.Vector3;
  color?: THREE.Color | string;
  size?: number;
  duration?: number;
  theme?: 'day' | 'night';
}

/**
 * Arc Pulse Component
 * Creates expanding glow effects at arc start/end points
 */
export const ArcPulse: React.FC<ArcPulseProps> = ({
  position,
  color,
  size = 0.05,
  duration = 2.0,
  theme,
}) => {
  const spriteRef = useRef<THREE.Sprite>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());

  // Get theme palette for default color
  const palette = useMemo(() => getThemePalette(theme), [theme]);
  
  // Resolve color
  const pulseColor = useMemo(() => {
    if (color) {
      return typeof color === 'string' ? new THREE.Color(color) : color;
    }
    return palette.pulseColor;
  }, [color, palette.pulseColor]);

  // Create radial gradient texture for pulse effect
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    
    // Get RGB values from color
    const r = Math.floor(pulseColor.r * 255);
    const g = Math.floor(pulseColor.g * 255);
    const b = Math.floor(pulseColor.b * 255);
    
    // Create radial gradient with golden overlay
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1.0)`);
    gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.8)`);
    gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.4)`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.0)`);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [pulseColor]);

  // Create sprite material
  const material = useMemo(() => {
    if (!texture) return null;
    
    return new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [texture]);

  // Animation loop
  useEffect(() => {
    if (!spriteRef.current || !material) return;

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const cycle = (elapsed % duration) / duration;
      
      // Pulsing scale (expand and contract)
      const scale = size * (0.8 + 0.4 * Math.sin(cycle * Math.PI * 2));
      
      // Fade in/out
      const opacity = Math.sin(cycle * Math.PI);
      
      if (spriteRef.current) {
        spriteRef.current.scale.set(scale, scale, 1);
        if (material) {
          material.opacity = opacity;
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [size, duration, material]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose();
      }
      if (material) {
        material.dispose();
      }
    };
  }, [texture, material]);

  if (!material) return null;

  return (
    <sprite
      ref={spriteRef}
      position={position}
      material={material}
      scale={[size, size, 1]}
    />
  );
};

