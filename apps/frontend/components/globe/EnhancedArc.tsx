'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { TransactionData } from '../../types/transaction';
import { createArcShaderMaterial, updateArcShaderTime } from '../../shaders/arcAeonShader';
import { createAeonWaveMaterial, updateAeonWaveTime } from '../../shaders/aeonWave';
import { getThemePalette, getStatusColors } from '../../utils/themePalette';

export interface EnhancedArcProps {
  transaction: TransactionData;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  thickness?: number;
  theme?: 'day' | 'night';
  onUpdate?: (mesh: THREE.Mesh) => void;
}

/**
 * Create a curved arc geometry between two points on a sphere
 * Uses a simpler tube geometry for better performance
 */
function createArcGeometry(
  start: THREE.Vector3,
  end: THREE.Vector3,
  thickness: number,
  segments: number = 24 // Reduced for performance
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  // Calculate arc height (for curved path)
  const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const arcHeight = start.distanceTo(end) * 0.2; // 20% of distance for subtle curve
  midPoint.normalize().multiplyScalar(1.0 + arcHeight);

  // Generate vertices along the arc using quadratic Bezier
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // Quadratic Bezier curve: (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
    const point = new THREE.Vector3()
      .addScaledVector(start, (1 - t) * (1 - t))
      .addScaledVector(midPoint, 2 * (1 - t) * t)
      .addScaledVector(end, t * t);
    
    vertices.push(point.x, point.y, point.z);
    uvs.push(t, 0.5); // UV.x = position along arc (0 to 1)
  }

  // Create ribbon geometry (simple quad strip)
  const allVertices: number[] = [];
  const allUvs: number[] = [];
  
  for (let i = 0; i <= segments; i++) {
    const idx = i * 3;
    const point = new THREE.Vector3(vertices[idx], vertices[idx + 1], vertices[idx + 2]);
    
    // Calculate tangent for this point
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
    
    // Create perpendicular vectors for width
    const perpendicular = new THREE.Vector3().crossVectors(point, tangent).normalize();
    const width = perpendicular.multiplyScalar(thickness);
    
    // Bottom vertex
    const bottom = new THREE.Vector3().addVectors(point, width);
    allVertices.push(bottom.x, bottom.y, bottom.z);
    allUvs.push(i / segments, 0);
    
    // Top vertex
    const top = new THREE.Vector3().subVectors(point, width);
    allVertices.push(top.x, top.y, top.z);
    allUvs.push(i / segments, 1);
  }

  // Create indices for triangles
  for (let i = 0; i < segments; i++) {
    const base = i * 2;
    // First triangle
    indices.push(base, base + 1, base + 2);
    // Second triangle
    indices.push(base + 1, base + 3, base + 2);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(allVertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(allUvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Enhanced Arc Component
 * Renders a transaction arc with custom shaders, glow effects, and animations
 */
export const EnhancedArc: React.FC<EnhancedArcProps> = ({
  transaction,
  startPosition,
  endPosition,
  thickness = 0.015,
  theme,
  onUpdate,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const waveMeshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const animationFrameRef = useRef<number>();

  // Early return if transaction is invalid
  if (!transaction || !startPosition || !endPosition) {
    return null;
  }

  // Get theme palette
  const palette = useMemo(() => getThemePalette(theme), [theme]);
  
  // Get status-based colors
  const statusColors = useMemo(() => getStatusColors(transaction?.status || 'active'), [transaction?.status]);
  
  // Calculate arc properties based on transaction value
  const logValue = useMemo(() => {
    const value = transaction?.valueUSD || 1000;
    return Math.log10(Math.max(value, 1000));
  }, [transaction?.valueUSD]);
  
  // Calculate actual thickness based on transaction value
  const actualThickness = useMemo(() => {
    return thickness * (0.7 + (logValue / 6) * 0.3);
  }, [thickness, logValue]);
  
  // Calculate intensity based on transaction value
  const intensity = useMemo(() => {
    return Math.max(0.7, Math.min(1.0, 0.7 + (logValue / 6) * 0.3));
  }, [logValue]);
  
  // Animation speed variance (±20%) - use transaction ID for consistent randomization
  const speedVariance = useMemo(() => {
    // Use transaction ID hash for consistent but varied speed
    const id = transaction?.id || Math.random().toString();
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 0.8 + ((hash % 40) / 100); // 0.8 to 1.2
  }, [transaction?.id]);
  
  const waveSpeed = useMemo(() => 0.5 * speedVariance, [speedVariance]);

  // Determine segment count based on arc length (performance optimization)
  const segmentCount = useMemo(() => {
    const distance = startPosition.distanceTo(endPosition);
    // Use fewer segments for shorter arcs
    if (distance < 0.5) return 16;
    if (distance < 1.0) return 24;
    return 32;
  }, [startPosition, endPosition]);

  // Create geometries and materials
  const geometry = useMemo(() => {
    return createArcGeometry(startPosition, endPosition, actualThickness, segmentCount);
  }, [startPosition, endPosition, actualThickness, segmentCount]);

  const arcMaterial = useMemo(() => {
    return createArcShaderMaterial({
      colorStart: statusColors.start,
      colorEnd: statusColors.end,
      intensity,
      waveSpeed,
      waveWidth: 0.15,
      glowStrength: palette.glowIntensity,
    });
  }, [statusColors.start, statusColors.end, intensity, waveSpeed, palette.glowIntensity]);

  const waveMaterial = useMemo(() => {
    return createAeonWaveMaterial({
      waveColor: palette.waveColor,
      waveSpeed,
      waveIntensity: 1.5,
      waveWidth: 0.12,
    });
  }, [palette.waveColor, waveSpeed]);

  // Animation loop
  useEffect(() => {
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000; // Convert to seconds
      
      if (meshRef.current && arcMaterial) {
        updateArcShaderTime(arcMaterial, elapsed);
      }
      
      if (waveMeshRef.current && waveMaterial) {
        updateAeonWaveTime(waveMaterial, elapsed);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [arcMaterial, waveMaterial]);

  // Update callback
  useEffect(() => {
    if (meshRef.current && onUpdate) {
      onUpdate(meshRef.current);
    }
  }, [onUpdate]);

  // Cleanup
  useEffect(() => {
    return () => {
      geometry.dispose();
      arcMaterial.dispose();
      waveMaterial.dispose();
    };
  }, [geometry, arcMaterial, waveMaterial]);

  // Ensure materials are valid before rendering
  if (!arcMaterial || !waveMaterial || !geometry) {
    return null;
  }

  return (
    <group ref={groupRef}>
      {/* Main arc */}
      <mesh ref={meshRef} geometry={geometry} material={arcMaterial} />
      
      {/* Aeon wave overlay */}
      <mesh ref={waveMeshRef} geometry={geometry} material={waveMaterial} />
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

