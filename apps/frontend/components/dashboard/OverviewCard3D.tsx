import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface OverviewCard3DProps {
  icon: string;
  title: string;
  metric: {
    value: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
    lastUpdated: number;
  };
  color?: string;
  onClick?: () => void;
  className?: string;
}

// 3D Card Component
const Card3D: React.FC<{
  icon: string;
  title: string;
  metric: OverviewCard3DProps['metric'];
  color: string;
  mouseX: any;
  mouseY: any;
}> = ({ icon, title, metric, color, mouseX, mouseY }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Rotate on hover
    if (hovered) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        mouseY.get() * 0.1,
        0.1
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        mouseX.get() * 0.1,
        0.1
      );
    } else {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.1);
    }

    // Floating animation
    meshRef.current.position.y = Math.sin(time * 2) * 0.02;
  });

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '#10B981';
      case 'down': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <group>
      {/* Main Card */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.05 : 1}
      >
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.9}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Icon */}
      <Text
        position={[-0.8, 0.3, 0.06]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {icon}
      </Text>

      {/* Title */}
      <Text
        position={[0, 0.3, 0.06]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        {title}
      </Text>

      {/* Metric Value */}
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.25}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {formatValue(metric.value)}
      </Text>

      {/* Trend */}
      {metric.change !== undefined && (
        <group position={[0, -0.3, 0.06]}>
          <Text
            fontSize={0.12}
            color={getTrendColor(metric.trend)}
            anchorX="center"
            anchorY="middle"
          >
            {getTrendIcon(metric.trend)} {Math.abs(metric.change).toFixed(1)}%
          </Text>
        </group>
      )}

      {/* Glow effect on hover */}
      {hovered && (
        <mesh position={[0, 0, -0.1]}>
          <boxGeometry args={[2.2, 1.4, 0.05]} />
          <meshStandardMaterial 
            color={color} 
            transparent 
            opacity={0.3}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
      )}
    </group>
  );
};

export const OverviewCard3D: React.FC<OverviewCard3DProps> = ({
  icon,
  title,
  metric,
  color = '#3B82F6',
  onClick,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set((event.clientX - centerX) / (rect.width / 2));
    mouseY.set((event.clientY - centerY) / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative w-full h-48 rounded-xl overflow-hidden cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Card3D
          icon={icon}
          title={title}
          metric={metric}
          color={color}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      </Canvas>

      {/* Fallback for non-3D environments */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 flex flex-col justify-between opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center justify-between">
          <span className="text-3xl">{icon}</span>
          <span className="text-white/80 text-sm">
            {new Date(metric.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
        
        <div>
          <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
          <div className="text-white text-2xl font-bold">
            {metric.value.toLocaleString()}
          </div>
          {metric.change !== undefined && (
            <div className="text-white/80 text-sm mt-1">
              {metric.change > 0 ? '↗️' : metric.change < 0 ? '↘️' : '→'} {Math.abs(metric.change).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}; 