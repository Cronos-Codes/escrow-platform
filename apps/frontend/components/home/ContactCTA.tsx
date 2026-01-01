import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ContactCTA = ({ onOpen }: { onOpen: () => void }) => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Portal opening animation
  useEffect(() => {
    if (!portalRef.current || !animationConfig.enableAnimations) return;

    const portal = portalRef.current;

    gsap.fromTo(portal,
      {
        scale: 0,
        rotation: 0,
        opacity: 0,
      },
      {
        scale: 1,
        rotation: 360,
        opacity: 1,
        duration: 1.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [animationConfig.enableAnimations]);

  // Particle vortex animation
  useEffect(() => {
    if (!particlesRef.current || !animationConfig.enableAnimations || device.isLowEnd) return;

    const particles = particlesRef.current;
    const particleCount = 30;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-1 h-1 bg-[#D4AF37] rounded-full';
      particle.style.left = '50%';
      particle.style.top = '50%';
      particles.appendChild(particle);

      // Animate particle
      gsap.to(particle, {
        x: () => (Math.random() - 0.5) * 200,
        y: () => (Math.random() - 0.5) * 200,
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        duration: 2 + Math.random() * 2,
        repeat: -1,
        delay: Math.random() * 2,
        ease: 'power2.out',
      });
    }

    return () => {
      if (particlesRef.current) {
        particlesRef.current.innerHTML = '';
      }
    };
  }, [animationConfig.enableAnimations, device.isLowEnd]);

  const portalScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.9]);
  const portalOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.8]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden min-h-[600px] flex items-center justify-center"
    >
      {/* Background particles */}
      {!device.isLowEnd && isClient && typeof window !== 'undefined' && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => {
            const initialX = Math.random() * window.innerWidth;
            const initialY = Math.random() * window.innerHeight;
            const targetY = Math.random() * window.innerHeight;

            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#D4AF37]/20 rounded-full"
                initial={{
                  x: initialX,
                  y: initialY,
                }}
                animate={{
                  y: [null, targetY],
                  opacity: [0.2, 0.5, 0.2],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          style={{ scale: portalScale, opacity: portalOpacity }}
          className="relative inline-block"
        >
          {/* Portal */}
          <motion.div
            ref={portalRef}
            className="relative w-64 h-64 md:w-80 md:h-80 mx-auto"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={device.supportsTouch ? {} : { scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Portal ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-[#D4AF37]"
              animate={isHovered ? {
                boxShadow: [
                  '0 0 20px rgba(212, 175, 55, 0.5)',
                  '0 0 40px rgba(212, 175, 55, 0.8)',
                  '0 0 20px rgba(212, 175, 55, 0.5)',
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Inner portal */}
            <motion.div
              className="absolute inset-4 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 backdrop-blur-sm"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Particles container */}
            <div
              ref={particlesRef}
              className="absolute inset-0 rounded-full overflow-hidden"
            />

            {/* CTA Button */}
            <motion.button
              onClick={onOpen}
              className="absolute inset-0 flex items-center justify-center z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="text-center">
                <motion.div
                  className="text-4xl md:text-5xl mb-4"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  💬
                </motion.div>
                <div className="text-white font-bold text-xl md:text-2xl mb-2">
                  Start a Conversation
                </div>
                <div className="text-gray-400 text-sm md:text-base">
                  Let's discuss your escrow needs
                </div>
              </div>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Additional CTAs */}
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.button
            onClick={onOpen}
            className="px-6 py-3 bg-[#D4AF37] text-[#1C2A39] font-semibold rounded-lg hover:bg-[#bfa134] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Legal Team
          </motion.button>
          <motion.button
            onClick={onOpen}
            className="px-6 py-3 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Schedule Consultation
          </motion.button>
        </motion.div>

        {/* Form preview on hover (desktop only) */}
        {!device.isMobile && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 glass-premium rounded-xl p-6 max-w-md mx-auto"
          >
            <div className="text-white text-sm space-y-3">
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-full"></div>
              <div className="h-4 bg-white/20 rounded w-5/6"></div>
              <div className="h-20 bg-white/20 rounded"></div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ContactCTA; 
