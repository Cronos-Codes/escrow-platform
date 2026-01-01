import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import gsap from 'gsap';

interface TrustIndicator {
  label: string;
  value: number;
  unit: string;
  color: string;
  status: 'good' | 'attention' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const indicators: TrustIndicator[] = [
  { label: 'Uptime', value: 99.9, unit: '%', color: '#10b981', status: 'good', trend: 'up' },
  { label: 'Security Score', value: 98.5, unit: '%', color: '#10b981', status: 'good', trend: 'stable' },
  { label: 'Response Time', value: 120, unit: 'ms', color: '#f59e0b', status: 'attention', trend: 'down' },
  { label: 'Compliance', value: 100, unit: '%', color: '#10b981', status: 'good', trend: 'stable' },
];

const TrustSignals = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const [values, setValues] = useState(indicators.map(i => 0));
  const sectionRef = useRef<HTMLElement>(null);

  // Animate counters on mount
  useEffect(() => {
    if (!animationConfig.enableAnimations) {
      setValues(indicators.map(i => i.value));
      return;
    }

    indicators.forEach((indicator, index) => {
      gsap.to({ val: 0 }, {
        val: indicator.value,
        duration: 2,
        delay: index * 0.2,
        ease: 'power2.out',
        onUpdate: function() {
          setValues(prev => {
            const newValues = [...prev];
            newValues[index] = this.targets()[0].val;
            return newValues;
          });
        },
      });
    });
  }, [animationConfig.enableAnimations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return '#10b981';
      case 'attention':
        return '#f59e0b';
      case 'critical':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-16 bg-gradient-to-br from-[#1C2A39]/50 to-[#1C2A39]/30 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className={`${device.isMobile ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-serif font-bold text-white mb-2`}>
            Platform Health Monitor
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Real-time indicators of our platform's trustworthiness
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {indicators.map((indicator, index) => (
            <motion.div
              key={indicator.label}
              initial={animationConfig.enableAnimations ? { opacity: 0, scale: 0.9 } : {}}
              whileInView={animationConfig.enableAnimations ? { opacity: 1, scale: 1 } : {}}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 relative overflow-hidden"
            >
              {/* Pulsing background effect */}
              {!device.isLowEnd && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(circle at center, ${indicator.color}15 0%, transparent 70%)`,
                  }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              <div className="relative z-10">
                {/* Label */}
                <div className="text-gray-400 text-xs md:text-sm font-medium mb-2">
                  {indicator.label}
                </div>

                {/* Value with trend */}
                <div className="flex items-baseline gap-2 mb-3">
                  <div className={`${device.isMobile ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-bold`} style={{ color: indicator.color }}>
                    {indicator.unit === '%' 
                      ? values[index].toFixed(1)
                      : Math.floor(values[index]).toLocaleString()}
                    {indicator.unit}
                  </div>
                  <motion.div
                    className="text-sm"
                    style={{ color: indicator.color }}
                    animate={{
                      y: indicator.trend === 'up' ? [-2, 0, -2] : indicator.trend === 'down' ? [2, 0, 2] : [0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    {getTrendIcon(indicator.trend)}
                  </motion.div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: indicator.color }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <span className="text-xs text-gray-500 capitalize">{indicator.status}</span>
                </div>

                {/* Mini trend chart */}
                {!device.isLowEnd && (
                  <div className="mt-3 h-8 flex items-end gap-0.5">
                    {[...Array(10)].map((_, i) => {
                      const height = 20 + Math.sin(i * 0.5) * 10 + Math.random() * 5;
                      return (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t"
                          style={{
                            backgroundColor: indicator.color,
                            height: `${height}%`,
                            opacity: 0.6,
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{
                            duration: 0.5,
                            delay: i * 0.05,
                            ease: 'easeOut',
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional trust signals */}
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-6"
        >
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
            <span className="text-[#D4AF37] font-bold text-sm">Trustpilot 4.9★</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
            <span className="text-[#D4AF37] text-xs font-semibold">Verified on Chain</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
            <span className="text-[#D4AF37] text-xs font-semibold">Audited by LawPartner LLP</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSignals;
