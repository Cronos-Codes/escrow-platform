import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Ring } from '@react-three/drei';
import * as THREE from 'three';
import { Timeframe } from '@escrow/schemas';

interface TimeframeRadialProps {
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  size?: number;
  showAnimation?: boolean;
  className?: string;
}

const timeframes: { value: Timeframe; label: string; icon: string; color: string }[] = [
  { value: '1h', label: '1 Hour', icon: '⏰', color: '#3B82F6' },
  { value: '24h', label: '24 Hours', icon: '🌅', color: '#10B981' },
  { value: '7d', label: '7 Days', icon: '📅', color: '#F59E0B' },
  { value: '30d', label: '30 Days', icon: '📊', color: '#8B5CF6' },
  { value: '90d', label: '90 Days', icon: '📈', color: '#EF4444' },
  { value: '1y', label: '1 Year', icon: '🎯', color: '#06B6D4' },
  { value: 'all', label: 'All Time', icon: '♾️', color: '#6B7280' },
];

// 3D Radial Menu Component
const RadialMenu3D: React.FC<{
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  size: number;
  showAnimation: boolean;
  mouseX: any;
  mouseY: any;
}> = ({ selectedTimeframe, onTimeframeChange, size, showAnimation, mouseX, mouseY }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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

    // Floating animation
    if (showAnimation) {
      groupRef.current.position.y = Math.sin(time * 2) * 0.02;
    }
  });

  const handleItemClick = (timeframe: Timeframe) => {
    onTimeframeChange(timeframe);
  };

  return (
    <group ref={groupRef}>
      {/* Background ring */}
      <mesh position={[0, 0, -0.1]}>
        <ringGeometry args={[size * 0.8, size * 1.2, 64]} />
        <meshStandardMaterial 
          color="#1F2937" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Menu items */}
      {timeframes.map((item, index) => {
        const angle = (index / timeframes.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * size * 0.9;
        const y = Math.sin(angle) * size * 0.9;
        const isSelected = item.value === selectedTimeframe;
        const isHovered = hoveredIndex === index;
        
        return (
          <group key={item.value} position={[x, y, 0]}>
            {/* Item background */}
            <mesh
              onPointerOver={() => setHoveredIndex(index)}
              onPointerOut={() => setHoveredIndex(null)}
              onClick={() => handleItemClick(item.value)}
              scale={isSelected ? 1.2 : isHovered ? 1.1 : 1}
            >
              <ringGeometry args={[0.3, 0.5, 16]} />
              <meshStandardMaterial 
                color={isSelected ? item.color : isHovered ? item.color : '#374151'}
                transparent 
                opacity={isSelected ? 0.9 : isHovered ? 0.7 : 0.5}
                emissive={isSelected ? item.color : '#000000'}
                emissiveIntensity={isSelected ? 0.3 : 0}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Icon */}
            <Text
              position={[0, 0, 0.1]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {item.icon}
            </Text>

            {/* Label */}
            <Text
              position={[0, -0.4, 0.1]}
              fontSize={0.08}
              color="white"
              anchorX="center"
              anchorY="middle"
              maxWidth={0.8}
            >
              {item.label}
            </Text>

            {/* Selection indicator */}
            {isSelected && (
              <mesh position={[0, 0, -0.05]}>
                <ringGeometry args={[0.6, 0.7, 16]} />
                <meshStandardMaterial 
                  color={item.color}
                  transparent 
                  opacity={0.3}
                  emissive={item.color}
                  emissiveIntensity={0.2}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Glow effect on hover */}
            {isHovered && !isSelected && (
              <mesh position={[0, 0, -0.1]}>
                <ringGeometry args={[0.7, 0.8, 16]} />
                <meshStandardMaterial 
                  color={item.color}
                  transparent 
                  opacity={0.2}
                  emissive={item.color}
                  emissiveIntensity={0.1}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Center indicator */}
      <mesh position={[0, 0, 0.05]}>
        <ringGeometry args={[0.2, 0.3, 16]} />
        <meshStandardMaterial 
          color="#6B7280"
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Text
        position={[0, 0, 0.1]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        TIME
      </Text>
    </group>
  );
};

export const TimeframeRadial: React.FC<TimeframeRadialProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  size = 2,
  showAnimation = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTimeframe, setHoveredTimeframe] = useState<Timeframe | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = timeframes.find(tf => tf.value === selectedTimeframe);

  const handleTimeframeSelect = (timeframe: Timeframe) => {
    onTimeframeChange(timeframe);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main button */}
      <motion.button
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-lg">{selectedOption?.icon}</span>
        <span className="font-medium text-gray-700">{selectedOption?.label}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          ▼
        </motion.span>
      </motion.button>

      {/* Radial menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <div className="relative w-80 h-80">
              {/* Background circle */}
              <div className="absolute inset-0 bg-white rounded-full shadow-xl border border-gray-200" />
              
              {/* Center info */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-sm text-gray-500">Select Timeframe</div>
                </div>
              </div>

              {/* Timeframe options */}
              {timeframes.map((timeframe, index) => {
                const angle = (index / timeframes.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 120;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const isSelected = timeframe.value === selectedTimeframe;
                const isHovered = hoveredTimeframe === timeframe.value;

                return (
                  <motion.button
                    key={timeframe.value}
                    className="absolute w-16 h-16 rounded-full flex items-center justify-center text-white font-medium shadow-lg"
                    style={{
                      left: `calc(50% + ${x}px - 32px)`,
                      top: `calc(50% + ${y}px - 32px)`,
                      backgroundColor: timeframe.color,
                    }}
                    onClick={() => handleTimeframeSelect(timeframe.value)}
                    onMouseEnter={() => setHoveredTimeframe(timeframe.value)}
                    onMouseLeave={() => setHoveredTimeframe(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      backgroundColor: isSelected ? timeframe.color : timeframe.color,
                    }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.3,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    <div className="text-center">
                      <div className="text-lg">{timeframe.icon}</div>
                      <div className="text-xs mt-1">{timeframe.label}</div>
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                      </motion.div>
                    )}

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap"
                        >
                          {timeframe.label}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {timeframes.map((timeframe, index) => {
                  const angle = (index / timeframes.length) * 2 * Math.PI - Math.PI / 2;
                  const radius = 120;
                  const x = Math.cos(angle) * radius + 160;
                  const y = Math.sin(angle) * radius + 160;
                  
                  return (
                    <line
                      key={`line-${timeframe.value}`}
                      x1="160"
                      y1="160"
                      x2={x}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  );
                })}
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}; 