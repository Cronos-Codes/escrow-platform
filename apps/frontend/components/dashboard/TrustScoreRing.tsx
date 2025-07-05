import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface TrustScoreRingProps {
  score: number; // 0-100
  title?: string;
  size?: number;
  showAnimation?: boolean;
  showGlow?: boolean;
  className?: string;
  onClick?: () => void;
}

// 3D Trust Score Ring Component
const TrustRing3D: React.FC<{
  score: number;
  size: number;
  showAnimation: boolean;
  showGlow: boolean;
  mouseX: any;
  mouseY: any;
}> = ({ score, size, showAnimation, showGlow, mouseX, mouseY }) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Normalize score to 0-1
  const normalizedScore = Math.max(0, Math.min(1, score / 100));
  
  // Calculate color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    if (score >= 40) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const scoreColor = getScoreColor(score);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Rotate on hover
    if (hovered) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mouseY.get() * 0.2,
        0.1
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseX.get() * 0.2,
        0.1
      );
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.1);
    }

    // Animate ring
    if (ringRef.current && showAnimation) {
      // Floating animation
      ringRef.current.position.y = Math.sin(time * 2) * 0.02;
      
      // Pulse animation
      const scale = 1 + Math.sin(time * 3) * 0.02;
      ringRef.current.scale.set(scale, scale, scale);
    }

    // Animate glow
    if (glowRef.current && showGlow) {
      glowRef.current.rotation.z = time * 0.5;
      const glowIntensity = 0.3 + Math.sin(time * 2) * 0.1;
      (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = glowIntensity;
    }
  });

  // Create ring geometry with score-based completion
  const ringGeometry = React.useMemo(() => {
    const geometry = new THREE.RingGeometry(size * 0.6, size * 0.8, 64);
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = new Float32Array(positions.length);
    
    // Color the ring based on score completion
    for (let i = 0; i < positions.length; i += 3) {
      const angle = Math.atan2(positions[i + 1], positions[i]);
      const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
      
      if (normalizedAngle <= normalizedScore) {
        colors[i] = parseInt(scoreColor.slice(1, 3), 16) / 255; // R
        colors[i + 1] = parseInt(scoreColor.slice(3, 5), 16) / 255; // G
        colors[i + 2] = parseInt(scoreColor.slice(5, 7), 16) / 255; // B
      } else {
        colors[i] = 0.2; // R
        colors[i + 1] = 0.2; // G
        colors[i + 2] = 0.2; // B
      }
    }
    
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [score, scoreColor, normalizedScore, size]);

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Background ring */}
      <mesh position={[0, 0, -0.1]}>
        <ringGeometry args={[size * 0.6, size * 0.8, 64]} />
        <meshStandardMaterial 
          color="#374151" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glow effect */}
      {showGlow && (
        <mesh ref={glowRef} position={[0, 0, -0.2]}>
          <ringGeometry args={[size * 0.5, size * 0.9, 64]} />
          <meshStandardMaterial 
            color={scoreColor}
            transparent 
            opacity={0.2}
            emissive={scoreColor}
            emissiveIntensity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Main score ring */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <primitive object={ringGeometry} />
        <meshStandardMaterial 
          vertexColors
          transparent 
          opacity={0.9}
          metalness={0.3}
          roughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Score text */}
      <Text
        position={[0, 0, 0.1]}
        fontSize={size * 0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {score}
      </Text>

      {/* Percentage symbol */}
      <Text
        position={[size * 0.15, -size * 0.1, 0.1]}
        fontSize={size * 0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        %
      </Text>

      {/* Trust label */}
      <Text
        position={[0, -size * 0.3, 0.1]}
        fontSize={size * 0.08}
        color="#9CA3AF"
        anchorX="center"
        anchorY="middle"
      >
        TRUST
      </Text>

      {/* Score indicator dots */}
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * size * 0.7;
        const y = Math.sin(angle) * size * 0.7;
        const isActive = i < Math.floor(normalizedScore * 10);
        
        return (
          <mesh key={i} position={[x, y, 0.05]}>
            <sphereGeometry args={[size * 0.02, 8, 8]} />
            <meshStandardMaterial 
              color={isActive ? scoreColor : '#374151'}
              emissive={isActive ? scoreColor : '#000000'}
              emissiveIntensity={isActive ? 0.2 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export const TrustScoreRing: React.FC<TrustScoreRingProps> = ({
  score,
  title = 'Trust Score',
  size = 2,
  showAnimation = true,
  showGlow = true,
  className = '',
  onClick,
}) => {
  const ringRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!ringRef.current) return;
    
    const rect = ringRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set((event.clientX - centerX) / (rect.width / 2));
    mouseY.set((event.clientY - centerY) / (rect.height / 2));
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Get trust level description
  const getTrustLevel = (score: number): { level: string; description: string; color: string } => {
    if (score >= 90) return { level: 'Excellent', description: 'Very high trust', color: '#10B981' };
    if (score >= 80) return { level: 'Good', description: 'High trust', color: '#10B981' };
    if (score >= 70) return { level: 'Fair', description: 'Moderate trust', color: '#F59E0B' };
    if (score >= 60) return { level: 'Poor', description: 'Low trust', color: '#F97316' };
    return { level: 'Critical', description: 'Very low trust', color: '#EF4444' };
  };

  const trustInfo = getTrustLevel(score);

  return (
    <motion.div
      ref={ringRef}
      className={`relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-r from-gray-900/80 to-transparent">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: trustInfo.color }}
          />
          <span className="text-white/70 text-sm">{trustInfo.level}</span>
        </div>
      </div>

      {/* 3D Ring */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        <TrustRing3D
          score={score}
          size={size}
          showAnimation={showAnimation}
          showGlow={showGlow}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      </Canvas>

      {/* Trust level info */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <div className="text-white text-sm font-medium">{trustInfo.level}</div>
          <div className="text-white/70 text-xs">{trustInfo.description}</div>
        </div>
      </div>

      {/* Fallback for non-3D environments */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 flex flex-col justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="text-center">
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-white font-semibold text-xl mb-2">{title}</h3>
          <div className="text-white text-4xl font-bold mb-2">{score}%</div>
          <div className="text-white/70 text-sm">{trustInfo.description}</div>
        </div>
      </div>
    </motion.div>
  );
}; 