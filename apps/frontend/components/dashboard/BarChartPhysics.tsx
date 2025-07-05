import React, { useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface BarData {
  label: string;
  value: number;
  color?: string;
  category?: string;
}

interface BarChartPhysicsProps {
  data: BarData[];
  title: string;
  height?: number;
  showAnimation?: boolean;
  stacked?: boolean;
  className?: string;
}

// 3D Bar Chart Component
const BarChart3D: React.FC<{
  data: BarData[];
  showAnimation: boolean;
  stacked: boolean;
  mouseX: any;
  mouseY: any;
}> = ({ data, showAnimation, stacked, mouseX, mouseY }) => {
  const groupRef = useRef<THREE.Group>(null);
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Normalize data
  const normalizedData = useMemo(() => {
    if (data.length === 0) return [];
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    return data.map((item, index) => ({
      ...item,
      normalizedValue: ((item.value - minValue) / range) * 2, // Scale to 0-2
      color: item.color || `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
    }));
  }, [data]);

  // Group by category if stacked
  const groupedData = useMemo(() => {
    if (!stacked) return [normalizedData];
    
    const groups = normalizedData.reduce((acc, item) => {
      const category = item.category || 'default';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof normalizedData>);
    
    return Object.values(groups);
  }, [normalizedData, stacked]);

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

    // Animate bars
    barRefs.current.forEach((bar, index) => {
      if (!bar) return;
      
      if (showAnimation) {
        // Floating animation
        bar.position.y = Math.sin(time * 2 + index * 0.5) * 0.02;
        
        // Scale animation on hover
        if (hoveredIndex === index) {
          bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, 1.1, 0.1);
        } else {
          bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, 1, 0.1);
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
        {Array.from({ length: 5 }, (_, i) => (
          <mesh key={`x-${i}`} position={[0, (i - 2) * 0.5, 0]}>
            <boxGeometry args={[6, 0.01, 0.01]} />
            <meshStandardMaterial color="#374151" transparent opacity={0.3} />
          </mesh>
        ))}
        
        {/* Y-axis grid lines */}
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={`y-${i}`} position={[(i - 3) * 1, 0, 0]}>
            <boxGeometry args={[0.01, 4, 0.01]} />
            <meshStandardMaterial color="#374151" transparent opacity={0.3} />
          </mesh>
        ))}
      </group>

      {/* Bars */}
      {groupedData.map((group, groupIndex) => (
        <group key={groupIndex} position={[groupIndex * 0.2, 0, 0]}>
          {group.map((item, index) => {
            const barIndex = groupIndex * group.length + index;
            const xPosition = (index - group.length / 2) * 1.2;
            const barHeight = item.normalizedValue;
            const yPosition = barHeight / 2 - 1;
            
            return (
              <group key={index} position={[xPosition, yPosition, 0]}>
                {/* Bar */}
                <mesh
                  ref={(el) => (barRefs.current[barIndex] = el)}
                  onPointerOver={() => setHoveredIndex(barIndex)}
                  onPointerOut={() => setHoveredIndex(null)}
                  position={[0, 0, 0]}
                >
                  <boxGeometry args={[0.8, barHeight, 0.8]} />
                  <meshStandardMaterial 
                    color={item.color}
                    transparent
                    opacity={hoveredIndex === barIndex ? 0.9 : 0.7}
                    metalness={0.3}
                    roughness={0.2}
                  />
                </mesh>

                {/* Bar label */}
                <Text
                  position={[0, barHeight + 0.2, 0]}
                  fontSize={0.1}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {item.label}
                </Text>

                {/* Value label */}
                <Text
                  position={[0, -0.2, 0]}
                  fontSize={0.08}
                  color="white"
                  anchorX="center"
                  anchorY="middle"
                >
                  {formatValue(item.value)}
                </Text>

                {/* Glow effect on hover */}
                {hoveredIndex === barIndex && (
                  <mesh position={[0, 0, -0.1]}>
                    <boxGeometry args={[1, barHeight + 0.1, 0.05]} />
                    <meshStandardMaterial 
                      color={item.color}
                      transparent
                      opacity={0.3}
                      emissive={item.color}
                      emissiveIntensity={0.2}
                    />
                  </mesh>
                )}
              </group>
            );
          })}
        </group>
      ))}

      {/* Axes */}
      <group>
        {/* X-axis */}
        <mesh position={[0, -2.1, 0]}>
          <boxGeometry args={[6.2, 0.02, 0.02]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
        
        {/* Y-axis */}
        <mesh position={[-3.1, 0, 0]}>
          <boxGeometry args={[0.02, 4.2, 0.02]} />
          <meshStandardMaterial color="#6B7280" />
        </mesh>
      </group>
    </group>
  );
};

export const BarChartPhysics: React.FC<BarChartPhysicsProps> = ({
  data,
  title,
  height = 400,
  showAnimation = true,
  stacked = false,
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
    
    return [
      { label: 'Q1', value: 1200, category: 'Sales' },
      { label: 'Q2', value: 1800, category: 'Sales' },
      { label: 'Q3', value: 1400, category: 'Sales' },
      { label: 'Q4', value: 2200, category: 'Sales' },
    ];
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
          {chartData.length} data points • {stacked ? 'Stacked' : 'Grouped'} view
        </p>
      </div>

      {/* 3D Chart */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        <BarChart3D
          data={chartData}
          showAnimation={showAnimation}
          stacked={stacked}
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
          onClick={() => {/* Toggle stacked */}}
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