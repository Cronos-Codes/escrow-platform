# 🔧 Technical Implementation Examples

Quick-start code patterns for implementing the proposed redesigns.

---

## 1. Escrow Journey Scroll (HowItWorks)

### Horizontal Scroll with GSAP ScrollTrigger

```tsx
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const EscrowJourneyScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || !scrollRef.current) return;
    
    const container = containerRef.current;
    const scroller = scrollRef.current;
    const sections = gsap.utils.toArray('.journey-station');
    
    // Horizontal scroll animation
    const scrollTween = gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => `+=${scroller.offsetWidth}`,
      },
    });
    
    // Animate particles along path
    gsap.to('.particle', {
      motionPath: {
        path: '#journey-path',
        align: '#journey-path',
        alignOrigin: [0.5, 0.5],
      },
      duration: 3,
      repeat: -1,
      ease: 'none',
      stagger: 0.5,
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });
    
    return () => {
      scrollTween.kill();
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);
  
  return (
    <section ref={containerRef} className="relative h-screen overflow-hidden">
      <div ref={scrollRef} className="flex h-full">
        {/* Station 1: Funds Secured */}
        <div className="journey-station min-w-full h-full flex items-center justify-center">
          <div className="max-w-2xl">
            <div className="text-8xl mb-8 animate-float">🔒</div>
            <h3 className="text-4xl font-bold mb-4">Funds Secured</h3>
            <p className="text-xl text-gray-600">
              Deposits are held in a regulated, neutral escrow account.
            </p>
            <AnimatedPath />
          </div>
        </div>
        
        {/* Station 2: Terms Verified */}
        <div className="journey-station min-w-full h-full flex items-center justify-center">
          {/* ... */}
        </div>
        
        {/* Station 3: Disbursement */}
        <div className="journey-station min-w-full h-full flex items-center justify-center">
          {/* ... */}
        </div>
      </div>
      
      {/* SVG Path for particles */}
      <svg className="absolute inset-0 pointer-events-none">
        <path
          id="journey-path"
          d="M 100 400 L 600 400 L 1200 400 L 1800 400"
          fill="none"
          stroke="rgba(212, 175, 55, 0.3)"
          strokeWidth="2"
        />
        {[...Array(10)].map((_, i) => (
          <circle
            key={i}
            className="particle"
            r="4"
            fill="#D4AF37"
            opacity="0.8"
          />
        ))}
      </svg>
      
      {/* Progress indicator */}
      <ProgressIndicator />
    </section>
  );
};

const AnimatedPath = () => {
  const pathRef = useRef<SVGPathElement>(null);
  
  useEffect(() => {
    if (!pathRef.current) return;
    
    gsap.fromTo(
      pathRef.current,
      { strokeDashoffset: 1000 },
      {
        strokeDashoffset: 0,
        duration: 2,
        ease: 'power2.out',
      }
    );
  }, []);
  
  return (
    <svg className="w-full h-24 mt-8">
      <path
        ref={pathRef}
        d="M 0 50 L 400 50"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="3"
        strokeDasharray="1000"
        strokeLinecap="round"
      />
    </svg>
  );
};

const ProgressIndicator = () => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const updateProgress = () => {
      const scrolled = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setProgress((scrolled / maxScroll) * 100);
    };
    
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);
  
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full border border-white/20">
        <span className="text-sm text-white font-medium">YOUR JOURNEY</span>
        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
```

---

## 2. Live Trust Meter (StatsBanner)

### Animated Circular Gauge + Counter

```tsx
import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

const LiveTrustMeter = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  
  return (
    <section
      ref={containerRef}
      className="relative py-24 bg-gradient-to-br from-[#1C2A39] to-[#0A1929] overflow-hidden"
    >
      {/* Background particles */}
      <ParticleField />
      
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
          {/* Central Trust Score */}
          <div className="lg:col-span-1 flex justify-center">
            <CircularTrustGauge value={98} isVisible={isInView} />
          </div>
          
          {/* Satellite Stats */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <StatCard
              icon="💰"
              value={350}
              suffix="M+"
              label="Escrowed Safely"
              delay={0.2}
              isVisible={isInView}
            />
            <StatCard
              icon="🤝"
              value={1000}
              suffix="+"
              label="Successful Transactions"
              delay={0.4}
              isVisible={isInView}
            />
            <StatCard
              icon="🌍"
              value={3}
              suffix=""
              label="Licensed Jurisdictions"
              delay={0.6}
              isVisible={isInView}
            />
            <StatCard
              icon="⚡"
              value={24}
              suffix="/7"
              label="Support Availability"
              delay={0.8}
              isVisible={isInView}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const CircularTrustGauge = ({ value, isVisible }: { value: number; isVisible: boolean }) => {
  const progress = useSpring(0, { duration: 2000, bounce: 0 });
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = useTransform(progress, [0, 100], [circumference, 0]);
  
  useEffect(() => {
    if (isVisible) {
      progress.set(value);
    }
  }, [isVisible, value, progress]);
  
  return (
    <div className="relative w-64 h-64">
      {/* SVG Circular Progress */}
      <svg className="w-full h-full -rotate-90">
        {/* Background circle */}
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="rgba(212, 175, 55, 0.1)"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <motion.circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="url(#goldGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#FFD700" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-6xl font-bold text-gold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AnimatedCounter end={value} isVisible={isVisible} />%
        </motion.div>
        <motion.p
          className="text-sm text-gray-400 mt-2 uppercase tracking-wider"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          Trust Score
        </motion.p>
      </div>
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

const StatCard = ({
  icon,
  value,
  suffix,
  label,
  delay,
  isVisible,
}: {
  icon: string;
  value: number;
  suffix: string;
  label: string;
  delay: number;
  isVisible: boolean;
}) => {
  return (
    <motion.div
      className="relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-gold/50 transition-all group"
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      {/* Icon */}
      <motion.div
        className="text-4xl mb-4"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          delay: delay + 1,
        }}
      >
        {icon}
      </motion.div>
      
      {/* Value */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-4xl font-bold text-gold">
          <AnimatedCounter end={value} isVisible={isVisible} />
        </span>
        <span className="text-2xl font-bold text-gold">{suffix}</span>
      </div>
      
      {/* Label */}
      <p className="text-sm text-gray-400">{label}</p>
      
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-transparent rounded-2xl" />
      </div>
    </motion.div>
  );
};

const AnimatedCounter = ({ end, isVisible }: { end: number; isVisible: boolean }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isVisible) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    const stepDuration = duration / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [end, isVisible]);
  
  return <>{count}</>;
};

const ParticleField = () => {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gold/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default LiveTrustMeter;
```

---

## 3. Trust Shield Visualizer (LegalTrust)

### Scroll-driven Layer Building

```tsx
import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const TrustShieldVisualizer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  
  // Map scroll progress to layer reveals
  const layer1Progress = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const layer2Progress = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const layer3Progress = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);
  const layer4Progress = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const layer5Progress = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  
  const layers = [
    { progress: layer1Progress, label: 'Licensed', icon: '🏛️', color: '#D4AF37' },
    { progress: layer2Progress, label: 'BAR Certified', icon: '⚖️', color: '#BFA134' },
    { progress: layer3Progress, label: 'KYC/AML', icon: '🔍', color: '#A88C2F' },
    { progress: layer4Progress, label: 'ISO 27001', icon: '🛡️', color: '#91782A' },
    { progress: layer5Progress, label: 'UAE Regulated', icon: '⚜️', color: '#7A6425' },
  ];
  
  return (
    <section
      ref={containerRef}
      className="relative py-32 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Shield Visualization */}
          <div className="relative flex justify-center">
            <ShieldSVG layers={layers} />
          </div>
          
          {/* Layer Details */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              Trust Built Layer by Layer
            </h2>
            {layers.map((layer, index) => (
              <LayerDetail
                key={index}
                layer={layer}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ShieldSVG = ({ layers }: { layers: any[] }) => {
  return (
    <div className="relative w-96 h-96">
      <svg viewBox="0 0 200 240" className="w-full h-full">
        <defs>
          {/* Gradient for each layer */}
          {layers.map((layer, i) => (
            <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={layer.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={layer.color} stopOpacity="0.4" />
            </linearGradient>
          ))}
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Shield layers (from bottom to top) */}
        {layers.map((layer, i) => (
          <motion.path
            key={i}
            d={getShieldPath(i)}
            fill={`url(#gradient-${i})`}
            stroke={layer.color}
            strokeWidth="2"
            filter="url(#glow)"
            style={{
              opacity: layer.progress,
              scale: useTransform(layer.progress, [0, 1], [0.8, 1]),
            }}
          />
        ))}
        
        {/* Center emblem */}
        <motion.circle
          cx="100"
          cy="100"
          r="30"
          fill="white"
          stroke="#D4AF37"
          strokeWidth="3"
          style={{
            opacity: layers[layers.length - 1].progress,
            scale: useTransform(layers[layers.length - 1].progress, [0, 1], [0, 1]),
          }}
        />
        <motion.text
          x="100"
          y="110"
          textAnchor="middle"
          fontSize="36"
          style={{
            opacity: layers[layers.length - 1].progress,
          }}
        >
          ⚜️
        </motion.text>
      </svg>
      
      {/* Pulsing glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

const getShieldPath = (layerIndex: number) => {
  const baseSize = 40 + layerIndex * 15;
  return `M 100 ${60 - layerIndex * 8}
          L ${100 + baseSize} ${80 + layerIndex * 10}
          L ${100 + baseSize} ${140 + layerIndex * 10}
          Q 100 ${200 + layerIndex * 10} ${100 - baseSize} ${140 + layerIndex * 10}
          L ${100 - baseSize} ${80 + layerIndex * 10}
          Z`;
};

const LayerDetail = ({ layer, index }: { layer: any; index: number }) => {
  return (
    <motion.div
      className="flex items-start gap-4 p-4 rounded-lg bg-white border border-gray-200 hover:border-gold/50 hover:shadow-lg transition-all group cursor-pointer"
      style={{
        opacity: layer.progress,
        x: useTransform(layer.progress, [0, 1], [-50, 0]),
      }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gold/10 rounded-lg text-2xl group-hover:scale-110 transition-transform">
        {layer.icon}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {layer.label}
        </h3>
        <p className="text-sm text-gray-600">
          {getLayerDescription(index)}
        </p>
      </div>
      
      {/* Progress indicator */}
      <motion.div
        className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-gold flex items-center justify-center"
        style={{
          backgroundColor: useTransform(layer.progress, [0, 1], ['transparent', layer.color]),
        }}
      >
        <motion.span
          className="text-white text-sm font-bold"
          style={{
            opacity: layer.progress,
          }}
        >
          ✓
        </motion.span>
      </motion.div>
    </motion.div>
  );
};

const getLayerDescription = (index: number) => {
  const descriptions = [
    'Officially licensed escrow service provider',
    'Certified by the Bar Association for legal compliance',
    'Full Know Your Customer and Anti-Money Laundering protocols',
    'International security standard certification',
    'Regulated under UAE Financial Authorities',
  ];
  return descriptions[index];
};

export default TrustShieldVisualizer;
```

---

## 4. Industry Portal Grid

### 3D Portal Opening Effect

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IndustryPortalGrid = () => {
  const [activePortal, setActivePortal] = useState<number | null>(null);
  
  const industries = [
    {
      title: 'M&A Transactions',
      icon: '🏢',
      color: 'from-blue-500 to-cyan-500',
      description: 'All M&A escrows are subject to custom legal review and KYC/AML checks.',
      checklist: ['Audited Process', 'Custom Agreement', 'Verified Identity'],
    },
    {
      title: 'Real Estate',
      icon: '🏠',
      color: 'from-green-500 to-emerald-500',
      description: 'Escrow for property transfer governed by RERA and UAE BAR.',
      checklist: ['Title Verification', 'Legal Clearance', 'Funds Protection'],
    },
    // ... more industries
  ];
  
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          Industries We Serve
        </h2>
        
        {/* Scattered Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {industries.map((industry, index) => (
            <PortalCard
              key={index}
              industry={industry}
              index={index}
              isActive={activePortal === index}
              onToggle={() => setActivePortal(activePortal === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const PortalCard = ({
  industry,
  index,
  isActive,
  onToggle,
}: {
  industry: any;
  index: number;
  isActive: boolean;
  onToggle: () => void;
}) => {
  return (
    <motion.div
      className="relative"
      style={{
        // Scattered positioning
        marginTop: index % 3 === 1 ? '2rem' : index % 3 === 2 ? '4rem' : '0',
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Animated border */}
      <AnimatedBorder />
      
      {/* Card */}
      <motion.div
        className="relative bg-white rounded-2xl overflow-hidden cursor-pointer"
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
        whileHover={{ scale: 1.02 }}
        onClick={onToggle}
      >
        {/* Front face */}
        <motion.div
          className="p-8 relative z-10"
          animate={{
            rotateY: isActive ? -20 : 0,
            x: isActive ? -20 : 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Icon */}
          <div className={`text-6xl mb-4 bg-gradient-to-br ${industry.color} bg-clip-text text-transparent`}>
            {industry.icon}
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            {industry.title}
          </h3>
          
          {/* Checklist */}
          <ul className="space-y-2 mb-4">
            {industry.checklist.map((item: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-gold">✓</span>
                {item}
              </li>
            ))}
          </ul>
          
          {/* CTA */}
          <div className="text-sm text-gold font-medium">
            {isActive ? 'Close' : 'Explore →'}
          </div>
        </motion.div>
        
        {/* Portal depth content */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-gold/90 to-gold/70 backdrop-blur-lg"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{ duration: 0.6 }}
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
              }}
            >
              <div className="p-8 h-full flex flex-col justify-center text-white">
                <p className="text-lg leading-relaxed mb-6">
                  {industry.description}
                </p>
                
                {/* Animated legal excerpt */}
                <div className="space-y-2">
                  <div className="text-xs font-mono opacity-80">
                    Excerpt: Section 2.1
                  </div>
                  <div className="text-sm italic border-l-2 border-white/50 pl-4">
                    "Disbursement only upon verified title transfer and legal clearance."
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const AnimatedBorder = () => {
  return (
    <motion.div
      className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gold via-yellow-400 to-gold opacity-0 blur-sm"
      animate={{
        opacity: [0.5, 0.8, 0.5],
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        backgroundSize: '200% 200%',
      }}
    />
  );
};

export default IndustryPortalGrid;
```

---

## 5. Performance Optimization Hook

### Device-Aware Animation Configuration

```tsx
import { useEffect, useState } from 'react';

interface DeviceCapabilities {
  isLowEnd: boolean;
  isMobile: boolean;
  isTablet: boolean;
  supportsTouch: boolean;
  preferReducedMotion: boolean;
  gpuTier: 'high' | 'medium' | 'low';
}

export const useDeviceCapabilities = (): DeviceCapabilities => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isLowEnd: false,
    isMobile: false,
    isTablet: false,
    supportsTouch: false,
    preferReducedMotion: false,
    gpuTier: 'high',
  });
  
  useEffect(() => {
    const checkCapabilities = () => {
      // Screen size detection
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      
      // Touch support
      const supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Motion preference
      const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Performance detection
      const memory = (navigator as any).deviceMemory || 8; // GB
      const cores = navigator.hardwareConcurrency || 4;
      
      // GPU tier estimation
      let gpuTier: 'high' | 'medium' | 'low' = 'high';
      if (memory < 4 || cores < 4) {
        gpuTier = 'low';
      } else if (memory < 8 || cores < 6) {
        gpuTier = 'medium';
      }
      
      const isLowEnd = gpuTier === 'low' || preferReducedMotion;
      
      setCapabilities({
        isLowEnd,
        isMobile,
        isTablet,
        supportsTouch,
        preferReducedMotion,
        gpuTier,
      });
    };
    
    checkCapabilities();
    window.addEventListener('resize', checkCapabilities);
    return () => window.removeEventListener('resize', checkCapabilities);
  }, []);
  
  return capabilities;
};

export const useOptimizedAnimation = () => {
  const { isLowEnd, preferReducedMotion, gpuTier } = useDeviceCapabilities();
  
  return {
    // Animation durations
    duration: isLowEnd ? 0.2 : 0.6,
    staggerDelay: isLowEnd ? 0.05 : 0.1,
    
    // Feature flags
    enableParticles: !isLowEnd && gpuTier === 'high',
    enableBlur: !isLowEnd,
    enable3D: !isLowEnd && gpuTier !== 'low',
    enableAnimations: !preferReducedMotion,
    
    // Particle counts
    particleCount: gpuTier === 'high' ? 100 : gpuTier === 'medium' ? 50 : 0,
    
    // Quality settings
    blurAmount: gpuTier === 'high' ? 20 : 10,
    shadowQuality: gpuTier === 'high' ? 'high' : 'low',
  };
};

// Usage in components:
const MyAnimatedSection = () => {
  const animation = useOptimizedAnimation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={animation.enableAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
      transition={{ duration: animation.duration }}
      className={animation.enableBlur ? 'backdrop-blur-lg' : ''}
    >
      {animation.enableParticles && <ParticleField count={animation.particleCount} />}
      {/* Content */}
    </motion.div>
  );
};
```

---

## 6. Reusable Animation Components

### Staggered Fade In Container

```tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  className = '',
}: StaggerContainerProps) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ children, className = '' }: { children: ReactNode; className?: string }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

// Usage:
const MySection = () => (
  <StaggerContainer className="grid grid-cols-3 gap-8">
    <StaggerItem>
      <Card>Item 1</Card>
    </StaggerItem>
    <StaggerItem>
      <Card>Item 2</Card>
    </StaggerItem>
    <StaggerItem>
      <Card>Item 3</Card>
    </StaggerItem>
  </StaggerContainer>
);
```

### Magnetic Hover Effect

```tsx
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion';
import { useRef, MouseEvent } from 'react';

export const MagneticButton = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Magnetic pull effect (max 20px)
    x.set(Math.max(-20, Math.min(20, distanceX * 0.3)));
    y.set(Math.max(-20, Math.min(20, distanceY * 0.3)));
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block cursor-pointer"
    >
      {children}
    </motion.div>
  );
};
```

---

## 7. Tailwind Custom Utilities

Add these to your `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        gold: '#D4AF37',
        navy: '#1C2A39',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'gold': '0 8px 32px rgba(212, 175, 55, 0.25)',
        'gold-lg': '0 16px 48px rgba(212, 175, 55, 0.35)',
        'inner-gold': 'inset 0 2px 8px rgba(212, 175, 55, 0.2)',
      },
    },
  },
  plugins: [],
};
```

### Custom CSS Utilities

```css
/* globals.css */

/* Glass morphism */
.glass-card {
  @apply bg-white/60 backdrop-blur-lg border border-white/20;
}

/* Animated gradient border */
.gradient-border {
  position: relative;
  background: white;
  border-radius: 1rem;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 1rem;
  padding: 2px;
  background: linear-gradient(45deg, #D4AF37, #FFD700, #D4AF37);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: rotate 3s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Shimmer effect */
.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}

/* Glow text */
.text-glow {
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.5),
               0 0 40px rgba(212, 175, 55, 0.3),
               0 0 60px rgba(212, 175, 55, 0.2);
}
```

---

## 📦 Package Installation Commands

```bash
# Core animation libraries
npm install framer-motion gsap
npm install @gsap/react  # If using React

# 3D and visualization
npm install three @react-three/fiber @react-three/drei
npm install d3

# UI components
npm install @radix-ui/react-dialog @radix-ui/react-tooltip
npm install react-intersection-observer

# Utilities
npm install countup.js
npm install lottie-react
```

---

## 🎯 Quick Start Checklist

To implement any section:

1. ✅ Install required packages
2. ✅ Copy relevant code example
3. ✅ Add custom Tailwind utilities
4. ✅ Replace placeholder content with real data
5. ✅ Test on multiple devices
6. ✅ Optimize based on performance metrics
7. ✅ Add accessibility features (keyboard nav, ARIA)
8. ✅ Add loading states and error boundaries

---

**Ready to start building? Pick a section and let's code! 🚀**


