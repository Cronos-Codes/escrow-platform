import React, { useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Text, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface DataPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface LineChart3DProps {
  data: DataPoint[];
  title: string;
  color?: string;
  height?: number;
  showParticles?: boolean;
  showGrid?: boolean;
  className?: string;
}

// 3D Line Chart Component
const Chart3D: React.FC<{
  data: DataPoint[];
  color: string;
  showParticles: boolean;
  showGrid: boolean;
  mouseX: any;
  mouseY: any;
}> = ({ data, color, showParticles, showGrid, mouseX, mouseY }) => {
  const meshRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.Line>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [hovered, setHovered] = useState(false);

  const { camera } = useThree();

  // Normalize data to fit in 3D space
  const normalizedData = useMemo(() => {
    if (data.length === 0) return [];
    
    const minX = Math.min(...data.map(d => d.x));
    const maxX = Math.max(...data.map(d => d.x));
    const minY = Math.min(...data.map(d => d.y));
    const maxY = Math.max(...data.map(d => d.y));
    
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    
    return data.map((point, index) => ({
      x: ((point.x - minX) / rangeX) * 4 - 2, // Scale to -2 to 2
      y: ((point.y - minY) / rangeY) * 2 - 1, // Scale to -1 to 1
      z: index * 0.01, // Slight depth for 3D effect
      original: point,
    }));
  }, [data]);

  // Create line geometry
  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(normalizedData.length * 3);
    
    normalizedData.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [normalizedData]);

  // Create particle geometry
  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(normalizedData.length * 3);
    
    normalizedData.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [normalizedData]);

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

    // Animate particles
    if (particlesRef.current && showParticles) {
      particlesRef.current.rotation.z = time * 0.1;
    }

    // Animate line
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] = Math.sin(time * 2 + i * 0.1) * 0.02;
      }
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Grid */}
      {showGrid && (
        <group>
          {/* X-axis grid lines */}
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={`x-${i}`} position={[0, (i - 2) * 0.5, 0]}>
              <boxGeometry args={[4, 0.01, 0.01]} />
              <meshStandardMaterial color="#374151" transparent opacity={0.3} />
            </mesh>
          ))}
          
          {/* Y-axis grid lines */}
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={`y-${i}`} position={[(i - 2) * 1, 0, 0]}>
              <boxGeometry args={[0.01, 2, 0.01]} />
              <meshStandardMaterial color="#374151" transparent opacity={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {/* Line */}
      <primitive ref={lineRef} object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color, linewidth: 3 }))} />

      {/* Particles */}
      {showParticles && (
        <points ref={particlesRef} geometry={particleGeometry}>
          <pointsMaterial
            size={0.05}
            color={color}
            transparent
            opacity={0.8}
            sizeAttenuation
          />
        </points>
      )}

      {/* Data point labels on hover */}
      {hovered && normalizedData.length > 0 && (
        <group>
          {normalizedData.map((point, index) => (
            <Text
              key={index}
              position={[point.x, point.y + 0.2, point.z]}
              fontSize={0.05}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {point.original.y.toFixed(2)}
            </Text>
          ))}
        </group>
      )}

      {/* Axes */}
      <group>
        {/* X-axis */}
        <mesh position={[0, -1.1, 0]}>
          <boxGeometry args={[4.2, 0.02, 0.02]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
        
        {/* Y-axis */}
        <mesh position={[-2.1, 0, 0]}>
          <boxGeometry args={[0.02, 2.2, 0.02]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
      </group>
    </group>
  );
};

export const LineChart3D: React.FC<LineChart3DProps> = ({
  data,
  title,
  color = '#3B82F6',
  height = 400,
  showParticles = true,
  showGrid = true,
  className = '',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!chartRef.current) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set((event.clientX - centerX) / (rect.width / 2));
    mouseY.set((event.clientY - centerY) / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Generate sample data if none provided
  const chartData = useMemo(() => {
    if (data.length > 0) return data;
    
    return Array.from({ length: 20 }, (_, i) => ({
      x: i,
      y: Math.sin(i * 0.5) * 100 + Math.random() * 20,
      timestamp: Date.now() - (20 - i) * 3600000,
    }));
  }, [data]);

  return (
    <motion.div
      ref={chartRef}
      className={`relative w-full rounded-xl overflow-hidden bg-white shadow-lg ${className}`}
      style={{ height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-r from-gray-900/80 to-transparent">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-white/70 text-sm">
          {chartData.length} data points • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* 3D Chart */}
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        <Chart3D
          data={chartData}
          color={color}
          showParticles={showParticles}
          showGrid={showGrid}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <motion.button
          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {/* Toggle particles */}}
        >
          ✨
        </motion.button>
        <motion.button
          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {/* Toggle grid */}}
        >
          ⊞
        </motion.button>
      </div>

      {/* Fallback for non-3D environments */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 flex flex-col justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="text-center">
          <h3 className="text-white font-semibold text-xl mb-4">{title}</h3>
          <div className="text-white/70 text-sm mb-4">
            {chartData.length} data points available
          </div>
          <div className="text-white text-2xl font-bold">
            {chartData.length > 0 ? chartData[chartData.length - 1].y.toFixed(2) : '0'}
          </div>
          <div className="text-white/50 text-sm mt-2">
            Latest value
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 