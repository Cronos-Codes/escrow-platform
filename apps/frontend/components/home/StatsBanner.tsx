import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import gsap from 'gsap';

const stats = [
  { value: 350, suffix: 'M+', label: 'Escrowed Safely', unit: '$' },
  { value: 1000, suffix: '+', label: 'Successful Legal Transactions', unit: '' },
  { value: 3, suffix: '', label: 'Licensed Global Jurisdictions', unit: '' },
];

const StatsBanner = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const gaugeRef = useRef<SVGCircleElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animate gauge on scroll
  useEffect(() => {
    if (!gaugeRef.current || !animationConfig.enableAnimations) return;

    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference;

    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const progress = Math.min(latest * 1.5, 1); // Speed up the animation
      const strokeDashoffset = offset - (progress * circumference * 0.85); // Fill to 85%

      gsap.to(gaugeRef.current, {
        strokeDashoffset,
        duration: 0.1,
        ease: 'none',
      });
    });

    return () => unsubscribe();
  }, [scrollYProgress, animationConfig.enableAnimations]);

  // Counter animation
  const Counter = ({ value, suffix, unit }: { value: number; suffix: string; unit: string }) => {
    const [count, setCount] = React.useState(0);
    const counterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!animationConfig.enableAnimations) {
        setCount(value);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            gsap.to({ val: 0 }, {
              val: value,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function () {
                setCount(Math.floor(this.targets()[0].val));
              },
            });
          }
        },
        { threshold: 0.5 }
      );

      if (counterRef.current) {
        observer.observe(counterRef.current);
      }

      return () => observer.disconnect();
    }, [value, animationConfig.enableAnimations]);

    return (
      <div ref={counterRef} className="text-center">
        <div className={`${device.isMobile ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} font-bold text-[#D4AF37] mb-2`}>
          {unit}{count.toLocaleString()}{suffix}
        </div>
        <div className={`${device.isMobile ? 'text-xs md:text-sm' : 'text-sm md:text-base'} text-gray-300`}>
          {stats.find(s => s.value === value)?.label}
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 bg-gradient-to-br from-[#1C2A39] via-[#1C2A39]/95 to-[#1C2A39] overflow-hidden"
    >
      {/* Animated background particles */}
      {!device.isLowEnd && isClient && typeof window !== 'undefined' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => {
            const initialX = Math.random() * window.innerWidth;
            const initialY = Math.random() * window.innerHeight;
            const targetY = Math.random() * window.innerHeight;

            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#D4AF37]/30 rounded-full"
                initial={{
                  x: initialX,
                  y: initialY,
                }}
                animate={{
                  y: [null, targetY],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className={`${device.isMobile ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-serif font-bold text-white mb-4`}>
            Trusted by Thousands Worldwide
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Real-time proof of our platform's reliability and scale
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
          {/* Left: Trust Meter Gauge */}
          <motion.div
            className="col-span-1 md:col-span-1 flex justify-center"
            initial={animationConfig.enableAnimations ? { opacity: 0, scale: 0.8 } : {}}
            whileInView={animationConfig.enableAnimations ? { opacity: 1, scale: 1 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <svg
                width={device.isMobile ? 200 : 240}
                height={device.isMobile ? 200 : 240}
                className="transform -rotate-90"
              >
                {/* Background circle */}
                <circle
                  cx={device.isMobile ? 100 : 120}
                  cy={device.isMobile ? 100 : 120}
                  r="90"
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.1)"
                  strokeWidth="8"
                />
                {/* Animated gauge */}
                <circle
                  ref={gaugeRef}
                  cx={device.isMobile ? 100 : 120}
                  cy={device.isMobile ? 100 : 120}
                  r="90"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 90}
                  strokeDashoffset={2 * Math.PI * 90}
                  className="transition-all duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))',
                  }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="text-4xl md:text-5xl font-bold text-[#D4AF37] mb-1"
                  animate={animationConfig.enableAnimations ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  ⭐
                </motion.div>
                <div className="text-sm md:text-base text-gray-400 font-semibold">
                  Trust Score
                </div>
                <div className="text-xl md:text-2xl font-bold text-white">
                  98.5%
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Stats Grid */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={animationConfig.enableAnimations ? { opacity: 0, y: 30 } : {}}
                whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.4 }}
                className="glass-premium rounded-xl p-6 hover:border-[#D4AF37]/50 transition-all duration-300"
              >
                <Counter value={stat.value} suffix={stat.suffix} unit={stat.unit} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
