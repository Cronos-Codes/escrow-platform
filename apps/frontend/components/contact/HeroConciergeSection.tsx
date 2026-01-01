import React, { useState, useEffect, useMemo } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef } from 'react';

interface HeroConciergeSectionProps {
  userRole: string;
  isLoggedIn: boolean;
}

export const HeroConciergeSection: React.FC<HeroConciergeSectionProps> = ({
  userRole,
  isLoggedIn
}) => {
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const keyAnimation = useAnimation();
  const vaultAnimation = useAnimation();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Memoized animations for performance
  const floatingAnimation = useMemo(() => ({
    y: [-10, 10, -10],
    rotate: [0, 5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }), []);

  const keyHoverAnimation = useMemo(() => ({
    rotate: [0, 360],
    scale: 1.1,
    transition: { duration: 0.8, ease: "easeInOut" }
  }), []);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isInView) return;

    // Optimized vault opening animation
    const timer = setTimeout(() => {
      setIsVaultOpen(true);
      vaultAnimation.start({
        rotateY: [0, 90],
        transition: { duration: 2.5, ease: "easeInOut" }
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [isInView, vaultAnimation]);

  useEffect(() => {
    if (!isInView) return;

    // Continuous floating animation for the golden key
    keyAnimation.start(floatingAnimation);
  }, [isInView, keyAnimation, floatingAnimation]);

  const handleKeyHover = () => {
    keyAnimation.start(keyHoverAnimation);
  };

  const handleKeyLeave = () => {
    keyAnimation.start(floatingAnimation);
  };

  const handleKeyClick = () => {
    // Accessibility: keyboard and click support
    if (!isVaultOpen) {
      setIsVaultOpen(true);
      vaultAnimation.start({
        rotateY: [0, 90],
        transition: { duration: 2.5, ease: "easeInOut" }
      });
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
      role="banner"
      aria-label="Gold Escrow Concierge Hero Section"
    >
      {/* Enhanced Animated Background - Vault Texture + Particles */}
      <div className="absolute inset-0">
        {/* Vault Door Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1C2A39] via-[#0A0A0A] to-[#141414]">
          <div className="absolute inset-0 bg-[url('/patterns/hexagon.svg')] opacity-10" />
        </div>
        
        {/* Enhanced Vault Door Animation */}
        <motion.div
          animate={vaultAnimation}
          className="absolute inset-0 bg-gradient-to-r from-[#2A2A2A] to-[#1A1A1A]"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 40%, rgba(212, 175, 55, 0.1) 50%, transparent 60%),
              radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)
            `,
            transformStyle: 'preserve-3d'
          }}
        />

        {/* Optimized Golden Sparks - Reduced count on mobile */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isMobile ? 8 : 20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Floating Golden Key Animation */}
      <motion.div
        animate={keyAnimation}
        onHoverStart={handleKeyHover}
        onHoverEnd={handleKeyLeave}
        onClick={handleKeyClick}
        onKeyDown={(e) => e.key === 'Enter' && handleKeyClick()}
        className="absolute top-1/4 left-1/4 z-20 cursor-pointer focus:outline-none focus:ring-4 focus:ring-yellow-400/50 rounded-lg"
        role="button"
        tabIndex={0}
        aria-label="Interactive golden key - click to open vault"
      >
        <div className="relative">
          {/* Enhanced Key Glow Effect */}
          <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30 animate-pulse" />
          
          {/* Enhanced Golden Key */}
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-2xl"
            style={{
              background: `
                linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)
              `,
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)'
            }}
            whileHover={{
              boxShadow: '0 0 50px rgba(212, 175, 55, 0.8)',
              scale: 1.1
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Enhanced Key Details */}
            <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded opacity-80" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-yellow-700 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-700 rounded-full" />
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Concierge Text Overlay */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.5 }}
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent leading-tight">
            Your Global Escrow Concierge Awaits
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 2 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto"
          >
            Reach us anytime — AI responds instantly, humans step in when needed.
          </motion.p>

          {/* Enhanced VIP Indicator for logged-in users */}
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 2.5 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-full px-6 py-3 backdrop-blur-sm"
              role="status"
              aria-label="VIP Concierge Access Active"
            >
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 font-semibold">
                VIP Concierge Access Active
              </span>
            </motion.div>
          )}

          {/* Enhanced CTA for non-logged in users */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 2.5 }}
              className="mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(212, 175, 55, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-4 px-8 rounded-full text-lg shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300"
              >
                Start Your Journey
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 3 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        role="presentation"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-yellow-400 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-yellow-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};


