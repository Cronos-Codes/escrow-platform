import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  Float, 
  Text3D,
  useGLTF,
  MeshDistortMaterial,
  Sphere,
  Plane,
  Box
} from '@react-three/drei';
import { motion } from 'framer-motion-3d';
import { useSpring, animated } from '@react-spring/three';
import { useTheme } from './theme';
import * as THREE from 'three';

// Custom shader for gold shimmer effect
const goldShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 goldColor;
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vec3 color = goldColor;
      
      // Add shimmer effect
      float shimmer = sin(vUv.x * 50.0 + time * 2.0) * 0.5 + 0.5;
      shimmer *= sin(vUv.y * 30.0 + time * 1.5) * 0.5 + 0.5;
      
      // Add metallic reflection
      float reflection = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      
      color = mix(color, vec3(1.0, 1.0, 0.8), shimmer * 0.3);
      color = mix(color, vec3(1.0, 1.0, 1.0), reflection * 0.2);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
};

// Floating gold particles
const FloatingParticles: React.FC = () => {
  const particles = useRef<THREE.Points>(null);
  const { theme } = useTheme();
  
  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y += 0.001;
      particles.current.rotation.x += 0.0005;
    }
  });

  const particleCount = 1000;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    
    const goldColor = theme === 'dark' ? [0.83, 0.69, 0.22] : [0.85, 0.65, 0.13];
    colors[i * 3] = goldColor[0];
    colors[i * 3 + 1] = goldColor[1];
    colors[i * 3 + 2] = goldColor[2];
  }

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

// Animated gold logo
const GoldLogo: React.FC = () => {
  const { theme } = useTheme();
  const meshRef = useRef<THREE.Mesh>(null);
  
  const [springs, api] = useSpring(() => ({
    rotation: [0, 0, 0],
    scale: 1,
    config: { mass: 1, tension: 280, friction: 60 }
  }));

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const handleHover = useCallback(() => {
    api.start({
      scale: 1.1,
      rotation: [0, Math.PI * 2, 0],
      config: { mass: 1, tension: 280, friction: 60 }
    });
  }, [api]);

  const handleLeave = useCallback(() => {
    api.start({
      scale: 1,
      rotation: [0, 0, 0],
      config: { mass: 1, tension: 280, friction: 60 }
    });
  }, [api]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <animated.mesh
        ref={meshRef}
        onPointerOver={handleHover}
        onPointerOut={handleLeave}
        scale={springs.scale}
        rotation={springs.rotation as any}
      >
        <boxGeometry args={[2, 2, 0.2]} />
        <shaderMaterial
          attach="material"
          args={[
            {
              ...goldShader,
              uniforms: {
                time: { value: 0 },
                goldColor: { value: new THREE.Color(theme === 'dark' ? '#D4AF37' : '#B8941F') }
              }
            }
          ]}
        />
      </animated.mesh>
    </Float>
  );
};

// Light beams effect
const LightBeams: React.FC = () => {
  const beamsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (beamsRef.current) {
      beamsRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={beamsRef}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0, -10]} rotation={[0, 0, (i * Math.PI) / 4]}>
          <planeGeometry args={[0.1, 20]} />
          <meshBasicMaterial
            color="#D4AF37"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main scene component
const Scene: React.FC = () => {
  const { camera } = useThree();
  const { theme } = useTheme();
  
  useEffect(() => {
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      
      {/* Ambient lighting */}
      <ambientLight intensity={theme === 'dark' ? 0.2 : 0.4} />
      
      {/* Directional lighting for depth */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Gold accent lighting */}
      <pointLight
        position={[0, 5, 5]}
        intensity={0.3}
        color="#D4AF37"
      />
      
      {/* Background environment */}
      <Environment preset={theme === 'dark' ? 'night' : 'sunset'} />
      
      {/* Floating particles */}
      <FloatingParticles />
      
      {/* Light beams */}
      <LightBeams />
      
      {/* Gold logo */}
      <GoldLogo />
      
      {/* Additional floating elements */}
      {Array.from({ length: 5 }).map((_, i) => (
        <Float key={i} speed={1 + i * 0.5} rotationIntensity={0.3} floatIntensity={0.3}>
          <Sphere args={[0.1 + i * 0.05]} position={[i * 2 - 4, i * 0.5, 0]}>
            <MeshDistortMaterial
              color="#D4AF37"
              speed={2}
              distort={0.3}
              radius={1}
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
};

// Main BackgroundScene component
interface BackgroundSceneProps {
  className?: string;
  children?: React.ReactNode;
}

const BackgroundScene: React.FC<BackgroundSceneProps> = ({ className, children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Simulate loading time for smooth entrance
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={`relative w-full h-full overflow-hidden ${className || ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #000814 0%, #1A1A1A 100%)'
          : 'linear-gradient(135deg, #F8F9FA 0%, #F0F0F0 100%)'
      }}
    >
      {/* Three.js Canvas */}
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        <Scene />
      </Canvas>
      
      {/* Content overlay */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
      
      {/* Fallback for WebGL disabled */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent opacity-50" />
    </motion.div>
  );
};

export default BackgroundScene; 