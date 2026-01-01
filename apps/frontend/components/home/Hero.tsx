import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import InteractiveGlobe from './InteractiveGlobe';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';

interface HeroProps {
  onOpenContact: () => void;
  onOpenAuth: () => void;
  onScrollPast?: () => void;
}

const Hero = ({ onOpenContact, onOpenAuth, onScrollPast }: HeroProps) => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Reduced parallax effects on mobile/low-end devices
  const parallaxIntensity = device.isMobile || device.isLowEnd ? 0.3 : 1;
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, device.isMobile ? 0.9 : 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, device.isMobile ? -50 : -100]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      if (latest > 0.3 && onScrollPast) {
        onScrollPast();
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, onScrollPast]);

  return (
    <section
      ref={heroRef}
      className={`relative flex flex-col md:flex-row items-center justify-between text-white rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 overflow-hidden min-h-screen ${device.isLowEnd ? '' : 'glass-premium'
        }`}
      style={{ position: 'relative' }} // FIXED: Explicit position for framer-motion scroll tracking
    >
      {/* FIXED: Interactive Globe Background - pass heroRef for proper scroll tracking */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <InteractiveGlobe mode="hero" heroSectionRef={heroRef} scrollYProgress={scrollYProgress} />
        {/* Enhanced overlay gradient - left to right fade to balance visual weight */}
        <div className={`absolute inset-0 z-0 ${device.isMobile
            ? 'bg-gradient-to-r from-[#1C2A39]/95 via-[#1C2A39]/88 to-[#1C2A39]/75'
            : 'bg-gradient-to-r from-[#1C2A39]/88 via-[#1C2A39]/70 to-[#1C2A39]/45'
          }`} />
        {/* Additional right edge fade to blend Earth image smoothly */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#1C2A39]/35 z-0" />
        {/* Subtle radial fade from center-left to enhance text readability */}
        <div className="absolute inset-0 bg-gradient-radial from-[#1C2A39]/20 via-transparent to-transparent z-0"
          style={{ background: 'radial-gradient(ellipse 80% 100% at 20% 50%, rgba(28, 42, 57, 0.2) 0%, transparent 60%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl w-full px-4 sm:px-6 md:px-8 lg:px-12">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          animate={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: animationConfig.duration }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-[1.15] relative"
            initial={animationConfig.enableAnimations ? { opacity: 0, y: 10 } : {}}
            animate={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: animationConfig.duration, delay: 0.1 }}
          >
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-white via-gold-200 to-gold-400 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]">
                Legal Escrow. Neutral Protection. Global Confidence.
              </span>
              {/* Enhanced text glow effect with multiple layers */}
              {!device.isLowEnd && (
                <>
                  <span className="absolute inset-0 bg-gradient-to-r from-white via-gold-200 to-gold-400 bg-clip-text text-transparent blur-md opacity-20 -z-10">
                    Legal Escrow. Neutral Protection. Global Confidence.
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 bg-clip-text text-transparent blur-lg opacity-10 -z-20">
                    Legal Escrow. Neutral Protection. Global Confidence.
                  </span>
                </>
              )}
            </span>
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-[#d1d5db] mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-2xl"
            initial={animationConfig.enableAnimations ? { opacity: 0, y: 10 } : {}}
            animate={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: animationConfig.duration, delay: 0.2 }}
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
            A regulated, independent escrow platform for high-value, cross-border transactions — trusted by global enterprises and legal professionals.
          </motion.p>
          <motion.div
            className="flex gap-3 sm:gap-4 flex-col sm:flex-row items-start sm:items-center"
            initial={animationConfig.enableAnimations ? { opacity: 0, y: 10 } : {}}
            animate={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: animationConfig.duration, delay: 0.3 }}
          >
            <motion.button
              aria-label="Open an Escrow Account"
              className={`group relative px-5 sm:px-6 py-2.5 sm:py-3 bg-[#D4AF37] text-[#1C2A39] font-semibold rounded-full shadow-lg transition-all duration-300 overflow-hidden ${device.supportsTouch ? 'touch-manipulation active:scale-95' : 'hover:scale-105'
                }`}
              onClick={onOpenAuth}
              whileHover={device.supportsTouch ? {} : { scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              style={{
                boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              <span className="text-sm sm:text-base relative z-10 font-semibold whitespace-nowrap">Open an Escrow Account</span>
              {/* Animated shine effect */}
              {!device.isLowEnd && (
                <>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -z-10 rounded-full"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-[#D4AF37] rounded-full blur-xl opacity-0 -z-20"
                    whileHover={{ opacity: 0.6 }}
                    transition={{ duration: 0.3 }}
                  />
                </>
              )}
            </motion.button>
            <motion.button
              aria-label="Talk to an Escrow Specialist"
              onClick={onOpenContact}
              className={`group relative px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border-2 border-gold/40 text-white font-semibold rounded-full transition-all duration-300 overflow-hidden ${device.supportsTouch ? 'touch-manipulation active:scale-95 active:bg-white/20' : ''
                }`}
              whileHover={device.supportsTouch ? {} : { scale: 1.02, borderColor: 'rgba(212, 175, 55, 0.7)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(212, 175, 55, 0.1)'
              }}
            >
              <span className="text-sm sm:text-base relative z-10 font-semibold whitespace-nowrap">Talk to an Escrow Specialist</span>
              {/* Enhanced depth with multiple layers */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/5 via-transparent to-black/15 pointer-events-none" />
              {/* Golden glow on hover */}
              {!device.isLowEnd && (
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0 pointer-events-none"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, transparent 70%)',
                    boxShadow: 'inset 0 0 30px rgba(212, 175, 55, 0.2)'
                  }}
                />
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced scroll indicator - Hidden on mobile, shown on tablet+ */}
      {!device.isMobile && (
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          animate={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: animationConfig.enableAnimations ? 1.2 : 0, duration: 0.6 }}
          className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={animationConfig.enableAnimations ? { y: [0, 8, 0] } : {}}
            transition={animationConfig.enableAnimations ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}}
            className="text-gold/90 text-xs sm:text-sm flex flex-col items-center cursor-pointer group"
            onClick={() => {
              window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
            }}
          >
            <motion.span
              className="group-hover:text-gold transition-colors font-medium tracking-wide"
              whileHover={{ scale: 1.1 }}
            >
              ↓ Learn More
            </motion.span>
            <motion.svg
              className="w-5 h-5 sm:w-6 sm:h-6 mt-2 text-gold/70 group-hover:text-gold transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              animate={animationConfig.enableAnimations ? { y: [0, 4, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </motion.svg>
            {/* Pulsing dot indicator */}
            <motion.div
              className="w-1 h-1 bg-gold rounded-full mt-1 opacity-60"
              animate={animationConfig.enableAnimations ? {
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero; 