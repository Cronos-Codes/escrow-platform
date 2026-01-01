'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TransactionData } from '../../types/transaction';
import { getThemePalette, getStatusColors } from '../../utils/themePalette';

// Import shader materials - these extend R3F
import '../../shaders/aeonArcMaterial';
import '../../shaders/aeonWaveMaterial';

/**
 * Create a curved arc geometry between two points on a sphere
 */
function createArcGeometry(
  start: THREE.Vector3,
  end: THREE.Vector3,
  thickness: number,
  segments: number = 24
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const arcHeight = start.distanceTo(end) * 0.2;
  midPoint.normalize().multiplyScalar(1.0 + arcHeight);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3()
      .addScaledVector(start, (1 - t) * (1 - t))
      .addScaledVector(midPoint, 2 * (1 - t) * t)
      .addScaledVector(end, t * t);
    
    vertices.push(point.x, point.y, point.z);
    uvs.push(t, 0.5);
  }

  const allVertices: number[] = [];
  const allUvs: number[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const idx = i * 3;
    const point = new THREE.Vector3(vertices[idx], vertices[idx + 1], vertices[idx + 2]);
    
    let tangent: THREE.Vector3;
    if (i === 0) {
      tangent = new THREE.Vector3().subVectors(
        new THREE.Vector3(vertices[3], vertices[4], vertices[5]),
        point
      ).normalize();
    } else if (i === segments) {
      tangent = new THREE.Vector3().subVectors(
        point,
        new THREE.Vector3(vertices[idx - 3], vertices[idx - 2], vertices[idx - 1])
      ).normalize();
    } else {
      tangent = new THREE.Vector3().subVectors(
        new THREE.Vector3(vertices[idx + 3], vertices[idx + 4], vertices[idx + 5]),
        new THREE.Vector3(vertices[idx - 3], vertices[idx - 2], vertices[idx - 1])
      ).normalize();
    }
    
    const perpendicular = new THREE.Vector3().crossVectors(point, tangent).normalize();
    const width = perpendicular.multiplyScalar(thickness);
    
    const bottom = new THREE.Vector3().addVectors(point, width);
    allVertices.push(bottom.x, bottom.y, bottom.z);
    allUvs.push(i / segments, 0);
    
    const top = new THREE.Vector3().subVectors(point, width);
    allVertices.push(top.x, top.y, top.z);
    allUvs.push(i / segments, 1);
  }

  for (let i = 0; i < segments; i++) {
    const base = i * 2;
    indices.push(base, base + 1, base + 2);
    indices.push(base + 1, base + 3, base + 2);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(allVertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(allUvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

export interface R3FEnhancedArcProps {
  transaction: TransactionData;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  thickness?: number;
  theme?: 'day' | 'night';
  onClick?: (transaction: TransactionData) => void;
  onHover?: (transaction: TransactionData | null) => void;
}

/**
 * R3F-compatible Enhanced Arc Component
 * Uses extended shader materials for proper React Three Fiber integration
 * 
 * ✨ RESTORED AFTER SHADER FIX:
 * - All visual effects (gradient colors, glow, wave pulse, edge fade)
 * - Real-time animation via u_time uniform updates
 * - Gold Escrow color scheme (#D4AF37 primary, white secondary)
 * - Geometry attributes properly bound (position, uv)
 * - Material uniforms correctly accessed through mesh refs
 * - No shader redefinition errors (uses drei's built-in attributes/uniforms)
 */
export const R3FEnhancedArc: React.FC<R3FEnhancedArcProps> = ({
  transaction,
  startPosition,
  endPosition,
  thickness = 0.015,
  theme,
  onClick,
  onHover,
}) => {
  // RESTORED: Material refs for uniform updates - drei's shaderMaterial pattern
  // These refs point to the mesh components, we'll access materials through them
  const arcMeshRef = useRef<THREE.Mesh>(null);
  const waveMeshRef = useRef<THREE.Mesh>(null);

  // Early return if transaction is invalid
  if (!transaction || !startPosition || !endPosition) {
    return null;
  }

  // Get theme palette
  const palette = useMemo(() => getThemePalette(theme), [theme]);
  const statusColors = useMemo(() => getStatusColors(transaction?.status || 'active'), [transaction?.status]);

  // Calculate arc properties
  const logValue = useMemo(() => {
    const value = transaction?.valueUSD || 1000;
    return Math.log10(Math.max(value, 1000));
  }, [transaction?.valueUSD]);

  const actualThickness = useMemo(() => {
    return thickness * (0.7 + (logValue / 6) * 0.3);
  }, [thickness, logValue]);

  const intensity = useMemo(() => {
    return Math.max(0.7, Math.min(1.0, 0.7 + (logValue / 6) * 0.3));
  }, [logValue]);

  const speedVariance = useMemo(() => {
    const id = transaction?.id || Math.random().toString();
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 0.8 + ((hash % 40) / 100);
  }, [transaction?.id]);

  const waveSpeed = useMemo(() => 0.5 * speedVariance, [speedVariance]);

  // Determine segment count
  const segmentCount = useMemo(() => {
    const distance = startPosition.distanceTo(endPosition);
    if (distance < 0.5) return 16;
    if (distance < 1.0) return 24;
    return 32;
  }, [startPosition, endPosition]);

  // Create geometry
  const geometry = useMemo(() => {
    return createArcGeometry(startPosition, endPosition, actualThickness, segmentCount);
  }, [startPosition, endPosition, actualThickness, segmentCount]);

  // Convert colors to THREE.Color
  const colorStart = useMemo(() => {
    return typeof statusColors.start === 'string' 
      ? new THREE.Color(statusColors.start) 
      : statusColors.start;
  }, [statusColors.start]);

  const colorEnd = useMemo(() => {
    return typeof statusColors.end === 'string' 
      ? new THREE.Color(statusColors.end) 
      : statusColors.end;
  }, [statusColors.end]);

  const waveColor = useMemo(() => {
    return typeof palette.waveColor === 'string' 
      ? new THREE.Color(palette.waveColor) 
      : palette.waveColor;
  }, [palette.waveColor]);

  // RESTORED: Animate time uniform - properly updates shader animation state
  // This drives the pulsing wave effects along arcs, creating the "real-time transaction" motion
  // FIXED: Ensure animations are always running for smooth arc effects
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    
    // Access material through mesh ref (drei's shaderMaterial creates ShaderMaterial instances)
    if (arcMeshRef.current?.material) {
      const material = arcMeshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms?.u_time !== undefined) {
        material.uniforms.u_time.value = elapsed;
        // Ensure material is marked as needing update
        material.needsUpdate = true;
      }
    }
    
    if (waveMeshRef.current?.material) {
      const material = waveMeshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms?.u_time !== undefined) {
        material.uniforms.u_time.value = elapsed;
        // Ensure material is marked as needing update
        material.needsUpdate = true;
      }
    }
  });

  // FIXED: Click and hover handlers for transaction arcs
  const handleClick = useCallback((event: THREE.Event) => {
    event.stopPropagation();
    if (onClick) {
      onClick(transaction);
    }
  }, [onClick, transaction]);

  const handlePointerEnter = useCallback(() => {
    if (onHover) {
      onHover(transaction);
    }
  }, [onHover, transaction]);

  const handlePointerLeave = useCallback(() => {
    if (onHover) {
      onHover(null);
    }
  }, [onHover]);

  return (
    <group>
      {/* RESTORED: Main arc with enhanced shader material - Gold Escrow color scheme */}
      {/* This renders the primary arc with gradient colors (gold to white) and pulsing wave effects */}
      {/* RESTORED: All visual effects - gradient, glow, wave pulse, edge fade */}
      {/* FIXED: Added click and hover handlers for transaction interaction */}
      <mesh 
        ref={arcMeshRef} 
        geometry={geometry}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        cursor="pointer"
      >
        <aeonArcMaterial
          u_time={0} // Initial value, updated via useFrame animation loop
          u_colorStart={colorStart}
          u_colorEnd={colorEnd}
          u_intensity={intensity}
          u_waveSpeed={waveSpeed}
          u_waveWidth={0.15}
          u_glowStrength={palette.glowIntensity}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* RESTORED: Aeon wave overlay - adds traveling lightwave effect */}
      {/* This creates the animated shimmer/pulse that travels along arcs for "real-time" feel */}
      {/* RESTORED: Wave animation, shimmer effect, edge fade */}
      <mesh ref={waveMeshRef} geometry={geometry}>
        <aeonWaveMaterial
          u_time={0} // Initial value, updated via useFrame animation loop
          u_waveColor={waveColor}
          u_waveSpeed={waveSpeed}
          u_waveIntensity={1.5}
          u_waveWidth={0.12}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

/**
 * Helper function to convert lat/lng to 3D position on sphere
 */
export function latLngToVector3(lat: number, lng: number, radius: number = 1.0): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

