import React, { useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface HeatmapData {
  x: number;
  y: number;
  value: number;
  label?: string;
  timestamp?: number;
}

interface Heatmap3DProps {
  data: HeatmapData[];
  title: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  showAnimation?: boolean;
  showLabels?: boolean;
  className?: string;
}

// 3D Heatmap Component
const Heatmap3D: React.FC<{
  data: HeatmapData[];
  showAnimation: boolean;
  showLabels: boolean;
  mouseX: any;
  mouseY: any;
}> = ({ data, showAnimation, showLabels, mouseX, mouseY }) => {
  const groupRef = useRef<THREE.Group>(null);
  const blockRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Normalize data
  const normalizedData = useMemo(() => {
    if (data.length === 0) return [];
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    return data.map(item => ({
      ...item,
      normalizedValue: ((item.value - minValue) / range) * 2, // Scale to 0-2
    }));
  }, [data]);

  // Calculate color based on value
  const getHeatmapColor = (value: number): string => {
    // Color gradient from blue (low) to red (high)
    const normalized = Math.max(0, Math.min(1, value));
    
    if (normalized < 0.5) {
      // Blue to green
      const t = normalized * 2;
      const r = Math.floor(0 + t * 0);
      const g = Math.floor(0 + t * 255);
      const b = Math.floor(255 - t * 0);
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Green to red
      const t = (normalized - 0.5) * 2;
      const r = Math.floor(0 + t * 255);
      const g = Math.floor(255 - t * 255);
      const b = Math.floor(0);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Rotate on mouse movement
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      mouseY.get() * 0.1,
      0.1
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      mouseX.get() * 0.1,
      0.1
    );

    // Animate blocks
    blockRefs.current.forEach((block, index) => {
      if (!block) return;
      
      if (showAnimation) {
        // Floating animation
        block.position.y = Math.sin(time * 2 + index * 0.3) * 0.02;
        
        // Scale animation on hover
        if (hoveredIndex === index) {
          block.scale.y = THREE.MathUtils.lerp(block.scale.y, 1.2, 0.1);
        } else {
          block.scale.y = THREE.MathUtils.lerp(block.scale.y, 1, 0.1);
        }
      }
    });
  });

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString();
  };

  return (
    <group ref={groupRef}>
      {/* Grid */}
      <group>
        {/* X-axis grid lines */}
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={`x-${i}`} position={[0, (i - 5) * 0.4, 0]}>
            <boxGeometry args={[10, 0.01, 0.01]} />
            <meshStandardMaterial color="#374151" transparent opacity={0.3} />
          </mesh>
        ))}
        
        {/* Y-axis grid lines */}
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={`y-${i}`} position={[(i - 5) * 1, 0, 0]}>
            <boxGeometry args={[0.01, 4, 0.01]} />
            <meshStandardMaterial color="#374151" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Heatmap blocks */}
      {normalizedData.map((item, index) => {
        const blockHeight = item.normalizedValue;
        const yPosition = blockHeight / 2 - 1;
        const color = getHeatmapColor(item.normalizedValue / 2);
        
        return (
          <group key={index} position={[item.x * 2 - 5, yPosition, item.y * 0.8 - 2]}>
            {/* Block */}
            <mesh
              ref={(el) => (blockRefs.current[index] = el)}
              onPointerOver={() => setHoveredIndex(index)}
              onPointerOut={() => setHoveredIndex(null)}
              position={[0, 0, 0]}
            >
              <boxGeometry args={[1.8, blockHeight, 0.6]} />
              <meshStandardMaterial 
                color={color}
                transparent
                opacity={hoveredIndex === index ? 0.9 : 0.7}
                metalness={0.3}
                roughness={0.2}
              />
            </mesh>

            {/* Value label */}
            {showLabels && (
              <Text
                position={[0, blockHeight + 0.1, 0]}
                fontSize={0.08}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {formatValue(item.value)}
              </Text>
            )}

            {/* Glow effect on hover */}
            {hoveredIndex === index && (
              <mesh position={[0, 0, -0.1]}>
                <boxGeometry args={[2, blockHeight + 0.1, 0.05]} />
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
      })}

      {/* Axes */}
      <group>
        {/* X-axis */}
        <mesh position={[0, -2.1, 0]}>
          <boxGeometry args={[10.2, 0.02, 0.02]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
        
        {/* Y-axis */}
        <mesh position={[-5.1, 0, 0]}>
          <boxGeometry args={[0.02, 4.2, 0.02]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
      </group>

      {/* Color legend */}
      <group position={[6, 0, 0]}>
        {Array.from({ length: 10 }, (_, i) => {
          const value = i / 9;
          const color = getHeatmapColor(value);
          const y = (i - 4.5) * 0.3;
          
          return (
            <group key={i} position={[0, y, 0]}>
              <mesh>
                <boxGeometry args={[0.5, 0.2, 0.2]} />
                <meshStandardMaterial color={color} />
              </mesh>
              {i % 2 === 0 && (
                <Text
                  position={[0.8, 0, 0]}
                  fontSize={0.1}
                  color="white"
                  anchorX="left"
                  anchorY="middle"
                >
                  {Math.round(value * 100)}%
                </Text>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
};

export const Heatmap3D: React.FC<Heatmap3DProps> = ({
  data,
  title,
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  height = 400,
  showAnimation = true,
  showLabels = true,
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
    
    const sampleData: HeatmapData[] = [];
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        sampleData.push({
          x,
          y,
          value: Math.random() * 1000,
          label: `Point ${x},${y}`,
          timestamp: Date.now() - Math.random() * 86400000,
        });
      }
    }
    return sampleData;
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
          {chartData.length} data points • {xLabel} vs {yLabel}
        </p>
      </div>

      {/* 3D Chart */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        <Heatmap3D
          data={chartData}
          showAnimation={showAnimation}
          showLabels={showLabels}
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
          onClick={() => {/* Toggle animation */}}
        >
          ✨
        </motion.button>
        <motion.button
          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {/* Toggle labels */}}
        >
          🏷️
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
            {chartData.length > 0 ? Math.max(...chartData.map(d => d.value)).toLocaleString() : '0'}
          </div>
          <div className="text-white/50 text-sm mt-2">
            Highest value
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 