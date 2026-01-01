import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const caseStudies = [
  {
    tab: 'Real Estate',
    steps: [
      { title: 'Agreement Signed', detail: 'All parties sign a law-governed contract. Clause: Section 2.1, UAE Escrow Law.' },
      { title: 'Funds Deposited', detail: 'Buyer deposits funds into regulated escrow. Clause: Section 3.4.' },
      { title: 'Contract Released', detail: 'Legal officers verify all terms. Clause: Section 4.2.' },
      { title: 'Disbursed', detail: 'Funds released to seller. Clause: Section 5.1.' },
    ],
    color: '#3b82f6',
  },
  {
    tab: 'Cross-Border',
    steps: [
      { title: 'Agreement Signed', detail: 'International contract signed. Clause: ICC Model Law 1.1.' },
      { title: 'Funds Deposited', detail: 'Multi-currency funds held in escrow. Clause: 2.3.' },
      { title: 'Contract Released', detail: 'Customs and legal checks. Clause: 3.2.' },
      { title: 'Disbursed', detail: 'Funds released post-verification. Clause: 4.1.' },
    ],
    color: '#10b981',
  },
  {
    tab: 'Private Equity',
    steps: [
      { title: 'Agreement Signed', detail: 'PE agreement signed by all parties. Clause: PE Law 1.2.' },
      { title: 'Funds Deposited', detail: 'Funds held pending regulatory approval. Clause: 2.4.' },
      { title: 'Contract Released', detail: 'Legal audit completed. Clause: 3.5.' },
      { title: 'Disbursed', detail: 'Funds released to fund manager. Clause: 4.3.' },
    ],
    color: '#f59e0b',
  },
];

// 3D Cylinder component
const TimelineCylinder = ({ 
  rotation, 
  activeIndex,
  onSelect 
}: { 
  rotation: number; 
  activeIndex: number;
  onSelect: (index: number) => void;
}) => {
  const cylinderRef = useRef<THREE.Group>(null);
  const device = useDeviceOptimization();

  useFrame(() => {
    if (cylinderRef.current) {
      cylinderRef.current.rotation.y = rotation;
    }
  });

  const radius = 3;
  const height = 8;
  const segments = 32;

  return (
    <group ref={cylinderRef}>
      {/* Cylinder mesh */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius, radius, height, segments]} />
        <meshStandardMaterial 
          color="#1C2A39" 
          wireframe={device.isLowEnd}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Case study cards on cylinder */}
      {caseStudies.map((study, index) => {
        const angle = (index / caseStudies.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const isActive = activeIndex === index;

        return (
          <group key={index} position={[x, 0, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <mesh
              onClick={() => onSelect(index)}
              onPointerOver={() => {}}
              onPointerOut={() => {}}
            >
              <boxGeometry args={[2, 1.5, 0.2]} />
              <meshStandardMaterial 
                color={isActive ? study.color : '#6b7280'}
                emissive={isActive ? study.color : '#000000'}
                emissiveIntensity={isActive ? 0.5 : 0}
              />
            </mesh>
            <Text
              position={[0, 0, 0.15]}
              fontSize={0.2}
              color="#fff"
              anchorX="center"
              anchorY="middle"
            >
              {study.tab}
            </Text>
          </group>
        );
      })}
    </group>
  );
};

// Scene component
const TimelineScene = ({ 
  rotation, 
  activeIndex,
  onSelect 
}: { 
  rotation: number; 
  activeIndex: number;
  onSelect: (index: number) => void;
}) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      <OrbitControls enableZoom={false} enablePan={false} />
      <TimelineCylinder rotation={rotation} activeIndex={activeIndex} onSelect={onSelect} />
    </>
  );
};

const CaseStudies = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openStep, setOpenStep] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll to rotation - use state to track rotation value
  const [rotationValue, setRotationValue] = React.useState(0);
  const rotation = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2]);

  useEffect(() => {
    const unsubscribe = rotation.on('change', (latest) => {
      setRotationValue(latest);
    });
    return () => unsubscribe();
  }, [rotation]);

  return (
    <section ref={sectionRef} className="py-16 bg-white/95 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900">
            Case Studies
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real success stories told through an immersive 3D timeline experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* 3D Timeline Cylinder */}
          {!device.isMobile && !device.isLowEnd ? (
            <motion.div
              initial={animationConfig.enableAnimations ? { opacity: 0, scale: 0.9 } : {}}
              whileInView={animationConfig.enableAnimations ? { opacity: 1, scale: 1 } : {}}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="h-[400px] md:h-[500px] rounded-xl overflow-hidden bg-gradient-to-br from-[#1C2A39]/10 to-[#1C2A39]/5"
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <TimelineScene 
                  rotation={rotationValue} 
                  activeIndex={activeTab}
                  onSelect={setActiveTab}
                />
              </Canvas>
            </motion.div>
          ) : (
            /* Mobile: Tab selector */
            <div className="flex justify-center gap-4 mb-8">
              {caseStudies.map((cs, i) => (
                <button
                  key={cs.tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-6 py-2 rounded-full font-semibold border transition-colors ${
                    activeTab === i 
                      ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                      : 'bg-white text-[#D4AF37] border-[#D4AF37]/40 hover:bg-[#D4AF37]/10'
                  }`}
                >
                  {cs.tab}
                </button>
              ))}
            </div>
          )}

          {/* Timeline steps */}
          <div className="max-w-3xl mx-auto lg:max-w-none">
            <ol className="relative border-l-4 border-[#D4AF37]/40">
              {caseStudies[activeTab].steps.map((step, i) => (
                <motion.li
                  key={step.title}
                  initial={animationConfig.enableAnimations ? { opacity: 0, x: -20 } : {}}
                  whileInView={animationConfig.enableAnimations ? { opacity: 1, x: 0 } : {}}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="mb-10 ml-6"
                >
                  <div className="flex items-center mb-2">
                    <motion.span
                      className="flex items-center justify-center w-8 h-8 bg-[#D4AF37] text-black rounded-full font-bold mr-4"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {i + 1}
                    </motion.span>
                    <button
                      className="text-lg font-semibold text-[#D4AF37] focus:outline-none hover:underline"
                      onClick={() => setOpenStep(openStep === i ? null : i)}
                    >
                      {step.title}
                    </button>
                  </div>
                  <AnimatePresence>
                    {openStep === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="ml-12 p-4 bg-[#D4AF37]/10 rounded-lg text-sm text-gray-800 border border-[#D4AF37]/20"
                      >
                        {step.detail}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        {/* Scroll indicator */}
        {!device.isMobile && (
          <motion.div
            className="mt-8 text-center text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Scroll to rotate timeline
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CaseStudies;
