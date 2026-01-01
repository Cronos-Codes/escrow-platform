import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const testimonials = [
  {
    name: 'Aisha Al Mansoori',
    title: 'Legal Counsel',
    flag: '🇦🇪',
    quote: 'The only escrow I trust for cross-border deals. Fully compliant and always neutral.',
    location: { lat: 24.4539, lng: 54.3773 }, // UAE
    color: '#10b981',
  },
  {
    name: 'James Carter',
    title: 'Real Estate Broker',
    flag: '🇬🇧',
    quote: 'Gold Escrow made my client closings seamless and secure.',
    location: { lat: 51.5074, lng: -0.1278 }, // UK
    color: '#3b82f6',
  },
  {
    name: 'Priya Nair',
    title: 'Commodities Trader',
    flag: '🇮🇳',
    quote: 'Finally, a platform that understands legal risk and compliance.',
    location: { lat: 28.6139, lng: 77.2090 }, // India
    color: '#f59e0b',
  },
];

// Convert lat/lng to 3D coordinates on sphere
const latLngToVector3 = (lat: number, lng: number, radius: number = 2) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// Wave component
const Wave = ({ position, color, delay = 0 }: { position: THREE.Vector3; color: string; delay?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime() + delay;
      meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.3);
      meshRef.current.material.opacity = 0.5 + Math.sin(time * 2) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <ringGeometry args={[0.1, 0.3, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
    </mesh>
  );
};

// Globe scene
const GlobeScene = ({
  selectedIndex,
  onSelect
}: {
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}) => {
  const device = useDeviceOptimization();

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />

      {/* Globe */}
      <Sphere args={[2, 32, 32]}>
        <meshStandardMaterial color="#1C2A39" wireframe={!device.isLowEnd} />
      </Sphere>

      {/* Testimonial markers */}
      {testimonials.map((testimonial, index) => {
        const position = latLngToVector3(testimonial.location.lat, testimonial.location.lng, 2.1);
        const isSelected = selectedIndex === index;

        return (
          <group key={index} position={position}>
            {/* Marker */}
            <mesh
              onClick={() => onSelect(index)}
              onPointerOver={() => { }}
              onPointerOut={() => { }}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial
                color={testimonial.color}
                emissive={testimonial.color}
                emissiveIntensity={isSelected ? 1 : 0.5}
              />
            </mesh>

            {/* Waves */}
            {isSelected && (
              <>
                <Wave position={new THREE.Vector3(0, 0, 0)} color={testimonial.color} delay={0} />
                <Wave position={new THREE.Vector3(0, 0, 0)} color={testimonial.color} delay={0.3} />
                <Wave position={new THREE.Vector3(0, 0, 0)} color={testimonial.color} delay={0.6} />
              </>
            )}
          </group>
        );
      })}
    </>
  );
};

const Testimonials = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Auto-select first testimonial on mount
    if (selectedIndex === null && testimonials.length > 0) {
      setTimeout(() => setSelectedIndex(0), 1000);
    }
  }, [selectedIndex]);

  return (
    <section
      ref={sectionRef}
      className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className={`${device.isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'} font-serif font-bold mb-3 sm:mb-4 text-white px-4`}>
            What Our Clients Say
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Global voices of trust, visualized across the world
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Globe visualization */}
          {!device.isMobile && !device.isLowEnd ? (
            <motion.div
              initial={animationConfig.enableAnimations ? { opacity: 0, scale: 0.9 } : {}}
              whileInView={animationConfig.enableAnimations ? { opacity: 1, scale: 1 } : {}}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-[400px] md:h-[500px] rounded-xl overflow-hidden bg-[#1C2A39]/10"
            >
              <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
                <GlobeScene selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
              </Canvas>
            </motion.div>
          ) : (
            /* Mobile: Simple map visualization */
            <div className="h-[300px] glass-premium rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🌍</div>
                <p className="text-sm">Interactive globe on desktop</p>
              </div>
            </div>
          )}

          {/* Testimonials */}
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={animationConfig.enableAnimations ? { opacity: 0, x: 20 } : {}}
                whileInView={animationConfig.enableAnimations ? { opacity: 1, x: 0 } : {}}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => setSelectedIndex(index)}
                className={`${device.isLowEnd ? 'bg-white/10' : 'glass-premium'} rounded-xl p-6 md:p-8 flex flex-col items-center text-center transition-all duration-300 cursor-pointer ${selectedIndex === index
                    ? 'border-[#D4AF37] shadow-[0_8px_25px_rgba(212,175,55,0.3)]'
                    : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                  }`}
              >
                {/* Wave indicator */}
                {selectedIndex === index && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full"
                    style={{ backgroundColor: testimonial.color }}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}

                <span className={`absolute -top-4 sm:-top-6 left-4 ${device.isMobile ? 'text-4xl sm:text-5xl' : 'text-5xl'} text-[#D4AF37] opacity-60 select-none`} aria-hidden="true">"</span>
                <blockquote className={`${device.isMobile ? 'text-base sm:text-lg' : 'text-lg'} font-serif text-white mb-3 sm:mb-4 leading-relaxed relative z-10`}>
                  {testimonial.quote}
                </blockquote>
                <div className={`flex items-center gap-2 mt-auto ${device.isMobile ? 'flex-col sm:flex-row' : 'flex-row'}`}>
                  <span className={`${device.isMobile ? 'text-xl sm:text-2xl' : 'text-xl'}`} aria-label={`Flag of ${testimonial.name}`}>{testimonial.flag}</span>
                  <span className={`font-semibold text-gray-200 ${device.isMobile ? 'text-sm sm:text-base' : 'text-base'}`}>{testimonial.name}</span>
                  <span className={`text-gray-400 ${device.isMobile ? 'text-xs sm:text-sm' : 'text-sm'}`}>{testimonial.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
