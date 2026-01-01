'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { CityData } from '../../types/city';

export interface CityNodeProps {
  city: CityData;
  position: THREE.Vector3;
  onClick?: () => void;
}

/**
 * City Node Component for Globe
 * Displays city markers with glow intensity based on transaction activity
 */
export const CityNode: React.FC<CityNodeProps> = ({
  city,
  position,
  onClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Calculate size based on transaction count
  const size = useMemo(() => {
    return Math.max(0.015, Math.min(0.03, Math.log10(city.transactionCount + 1) * 0.008));
  }, [city.transactionCount]);

  // Calculate glow intensity based on activity
  const glowIntensity = useMemo(() => {
    const now = Date.now();
    const timeSinceLastTransaction = now - city.lastTransactionTime;
    const recentActivity = timeSinceLastTransaction < 60000 ? 1.5 : 1.0;
    return Math.min(2.0, recentActivity * (city.transactionCount / 200));
  }, [city.transactionCount, city.lastTransactionTime]);

  // Animate pulse effect
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    if (meshRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.1;
      meshRef.current.scale.setScalar(size * pulse);
    }
    
    if (glowRef.current) {
      const glowPulse = glowIntensity * (0.9 + Math.sin(time * 3) * 0.1);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowPulse * 0.3;
    }
  });

  const color = city.active ? '#D4AF37' : '#6B7280';

  return (
    <group position={position} onClick={onClick}>
      {/* Main city marker */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>

      {/* Glow effect */}
      {city.active && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[size * 2, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={glowIntensity * 0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

