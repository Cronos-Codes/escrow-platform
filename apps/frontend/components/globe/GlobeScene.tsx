/**
 * GlobeScene.tsx
 * 
 * Main 3D Globe Scene Component using React Three Fiber
 * 
 * Features:
 * - Physically accurate 3D Earth with texture
 * - Animated pulsing city markers
 * - Traveling pulse arcs between cities
 * - Cursor-responsive rotation
 * - Scroll-driven transitions
 * - Widget mode at scroll end
 */

'use client';

import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useFrame, useThree, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { cities, arcConnections, latLonToVector3, getCityById } from './GlobeData';
import { useGlobeLogic } from './GlobeLogic';
import { createArcMaterial, useShaderTime, useGlowMaterial } from './GlobeMaterial';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface GlobeSceneProps {
  /**
   * Enable cursor rotation
   */
  enableCursorRotation?: boolean;
  
  /**
   * Enable auto-rotation
   */
  enableAutoRotation?: boolean;
  
  /**
   * Scroll progress (0-1) for scroll-driven animations
   */
  scrollProgress?: number;
  
  /**
   * Whether globe is in widget mode
   */
  isWidget?: boolean;
  
  /**
   * Globe scale
   */
  scale?: number;
  
  /**
   * Globe position
   */
  position?: [number, number, number];
  
  /**
   * Callback when city is clicked
   */
  onCityClick?: (cityId: string) => void;
  
  /**
   * Callback when city is hovered
   */
  onCityHover?: (cityId: string | null) => void;
}

/**
 * Earth Sphere Component
 */
function EarthSphere({ radius = 1 }: { radius?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  
  // Load Earth texture - use external URLs like existing implementation
  const earthTexture = useTexture('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
  const earthBump = useTexture('//unpkg.com/three-globe/example/img/earth-topology.png');
  
  // Create glow material
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color('#D4AF37') },
        glowIntensity: { value: 0.3 },
        time: { value: 0 },
        viewDirection: { value: new THREE.Vector3(0, 0, 0) },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float glowIntensity;
        uniform float time;
        uniform vec3 viewDirection;
        
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(viewDirection - vWorldPosition);
          
          float rim = 1.0 - max(dot(normal, viewDir), 0.0);
          rim = pow(rim, 2.0);
          
          float pulse = sin(time * 0.5) * 0.1 + 0.9;
          
          vec3 finalColor = glowColor * rim * glowIntensity * pulse;
          
          gl_FragColor = vec4(finalColor, rim * glowIntensity * pulse);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Update glow material
  useFrame((state) => {
    if (glowMaterialRef.current && camera) {
      glowMaterialRef.current.uniforms.viewDirection.value.copy(camera.position);
      glowMaterialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group>
      {/* Main Earth Sphere */}
      <mesh ref={meshRef} rotation={[0, 0, 0]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={earthBump}
          bumpScale={0.05}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Atmospheric Glow */}
      <mesh>
        <sphereGeometry args={[radius * 1.02, 64, 64]} />
        <primitive object={glowMaterial} ref={glowMaterialRef} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * City Marker Component
 */
function CityMarker({
  city,
  position,
  onHover,
  onClick,
}: {
  city: typeof cities[0];
  position: [number, number, number];
  onHover?: (hovered: boolean) => void;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Pulsing animation
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 2 + city.id.length) * 0.2;
      meshRef.current.scale.setScalar(pulse);
    }
  });

  const color = hovered ? '#FFD700' : '#D4AF37';
  const size = 0.02;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          if (onHover) onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          if (onHover) onHover(false);
        }}
        onClick={onClick}
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.8}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* HTML Tooltip */}
      {hovered && (
        <Html distanceFactor={10} center>
          <div
            style={{
              background: 'rgba(28, 42, 57, 0.95)',
              color: '#D4AF37',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              pointerEvents: 'none',
            }}
          >
            {city.name}
            {city.transactionCount && (
              <div style={{ fontSize: '10px', color: '#fff', marginTop: '4px' }}>
                {city.transactionCount} transactions
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * Arc Component with Traveling Pulse
 */
function Arc({
  start,
  end,
  color,
  pulseSpeed,
  pulseOffset,
}: {
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  pulseSpeed: number;
  pulseOffset: number;
}) {
  const curveRef = useRef<THREE.CatmullRomCurve3 | null>(null);
  const tubeRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Create curved path
  const curve = useMemo(() => {
    const startVec = new THREE.Vector3(...start);
    const endVec = new THREE.Vector3(...end);
    
    // Create control point above the globe for curvature
    const midPoint = new THREE.Vector3()
      .addVectors(startVec, endVec)
      .normalize()
      .multiplyScalar(1.5);
    
    return new THREE.CatmullRomCurve3([startVec, midPoint, endVec]);
  }, [start, end]);
  
  curveRef.current = curve;
  
  // Create arc material
  const arcMaterial = useMemo(() => {
    const startColor = new THREE.Color(color);
    const endColor = new THREE.Color(color).multiplyScalar(0.6);
    const arcLength = curve.getLength();
    
    return new THREE.ShaderMaterial({
      uniforms: {
        startColor: { value: startColor },
        endColor: { value: endColor },
        time: { value: 0 },
        pulseSpeed: { value: pulseSpeed },
        pulseOffset: { value: pulseOffset },
        arcLength: { value: arcLength },
        alpha: { value: 0.8 },
      },
      vertexShader: `
        uniform float arcLength;
        varying float vDistance;
        
        void main() {
          vDistance = position.z * arcLength;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 startColor;
        uniform vec3 endColor;
        uniform float time;
        uniform float pulseSpeed;
        uniform float pulseOffset;
        uniform float arcLength;
        uniform float alpha;
        
        varying float vDistance;
        
        void main() {
          float position = vDistance / arcLength;
          
          float pulsePosition = mod((time * pulseSpeed) + pulseOffset, 1.0);
          float pulseWidth = 0.15;
          
          float distFromPulse = abs(position - pulsePosition);
          float pulseIntensity = 1.0 - smoothstep(0.0, pulseWidth, distFromPulse);
          
          vec3 gradientColor = mix(startColor, endColor, position);
          vec3 finalColor = gradientColor * (0.3 + pulseIntensity * 0.7);
          
          float edgeFade = smoothstep(0.0, 0.1, position) * smoothstep(1.0, 0.9, position);
          float finalAlpha = alpha * edgeFade * (0.4 + pulseIntensity * 0.6);
          
          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [color, pulseSpeed, pulseOffset, curve]);
  
  materialRef.current = arcMaterial;
  
  // Update shader time
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
      <mesh ref={tubeRef}>
        <tubeGeometry args={[curve, 64, 0.008, 8, false]} />
        <primitive object={arcMaterial} ref={materialRef} attach="material" />
      </mesh>
  );
}

/**
 * Main Globe Scene Component
 */
function GlobeSceneContent({
  enableCursorRotation = true,
  enableAutoRotation = true,
  scrollProgress = 0,
  isWidget = false,
  scale = 1,
  position = [0, 0, 0],
  onCityClick,
  onCityHover,
}: GlobeSceneProps) {
  const { globeRef } = useGlobeLogic({
    enableCursorRotation,
    enableAutoRotation,
    onScrollProgress: (progress) => {
      // Handle scroll progress updates
    },
    onWidgetTransition: (widget) => {
      // Handle widget transition
    },
  });
  
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  
  // Calculate globe transform based on scroll
  const globeTransform = useMemo(() => {
    if (typeof window === 'undefined') {
      return { scale: 1, position: [0, 0, 0] as [number, number, number] };
    }
    
    if (isWidget) {
      return {
        scale: 0.3,
        position: [window.innerWidth * 0.4, -window.innerHeight * 0.4, 0] as [number, number, number],
      };
    }
    
    if (scrollProgress < 0.3) {
      return {
        scale: 1,
        position: [0, 0, 0] as [number, number, number],
      };
    } else if (scrollProgress < 0.6) {
      const t = (scrollProgress - 0.3) / 0.3;
      return {
        scale: 1 - t * 0.4,
        position: [-t * 0.3, -t * 0.1, 0] as [number, number, number],
      };
    } else {
      const t = (scrollProgress - 0.6) / 0.4;
      return {
        scale: 0.6 - t * 0.3,
        position: [-0.3 - t * 0.1, -0.1 - t * 0.3, 0] as [number, number, number],
      };
    }
  }, [scrollProgress, isWidget]);

  return (
    <group ref={globeRef} scale={globeTransform.scale * scale} position={globeTransform.position}>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#4A90E2" />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#D4AF37" />
      
      {/* Earth Sphere */}
      <Suspense fallback={null}>
        <EarthSphere radius={1} />
      </Suspense>
      
      {/* City Markers */}
      {cities.map((city) => {
        const [x, y, z] = latLonToVector3(city.lat, city.lon, 1.01);
        return (
          <CityMarker
            key={city.id}
            city={city}
            position={[x, y, z]}
            onHover={(hovered) => {
              setHoveredCity(hovered ? city.id : null);
              if (onCityHover) onCityHover(hovered ? city.id : null);
            }}
            onClick={() => {
              if (onCityClick) onCityClick(city.id);
            }}
          />
        );
      })}
      
      {/* Arcs */}
      {arcConnections.map((arc) => {
        const startCity = getCityById(arc.startCityId);
        const endCity = getCityById(arc.endCityId);
        
        if (!startCity || !endCity) return null;
        
        const start = latLonToVector3(startCity.lat, startCity.lon, 1.01);
        const end = latLonToVector3(endCity.lat, endCity.lon, 1.01);
        
        return (
          <Arc
            key={arc.id}
            start={start}
            end={end}
            color={arc.color || '#D4AF37'}
            pulseSpeed={arc.pulseSpeed || 1.0}
            pulseOffset={arc.startTime || 0}
          />
        );
      })}
    </group>
  );
}

/**
 * GlobeScene - Main Component
 */
export default function GlobeScene(props: GlobeSceneProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isWidget, setIsWidget] = useState(false);

  useEffect(() => {
    // Setup scroll tracking
    const updateScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(1, Math.max(0, scrollY / (maxScroll || 1)));
      
      setScrollProgress(progress);
      setIsWidget(progress > 0.6);
    };

    // GSAP ScrollTrigger
    const scrollTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setScrollProgress(self.progress);
        setIsWidget(self.progress > 0.6);
      },
    });

    window.addEventListener('scroll', updateScroll, { passive: true });

    return () => {
      scrollTrigger.kill();
      window.removeEventListener('scroll', updateScroll);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 50 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ 
        width: '100%', 
        height: '100%',
        pointerEvents: 'auto',
        position: 'absolute',
        top: 0,
        left: 0,
      }}
      dpr={[1, 2]}
      performance={{ min: 0.5 }}
    >
      <GlobeSceneContent
        {...props}
        scrollProgress={scrollProgress}
        isWidget={isWidget}
      />
    </Canvas>
  );
}

