import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Mock trusted partners with approximate geographic positions
const trustedPartners = [
  { name: 'Bank of Dubai', logo: '/partners/bank-dubai.svg', placeholder: '🏦', x: 0.25, y: 0.35 }, // UAE
  { name: 'Global Law Partners', logo: '/partners/global-law.svg', placeholder: '⚖️', x: 0.65, y: 0.55 }, // UK
  { name: 'International Finance Corp', logo: '/partners/ifc.svg', placeholder: '💼', x: 0.55, y: 0.45 }, // India
  { name: 'Emirates Legal', logo: '/partners/emirates-legal.svg', placeholder: '📜', x: 0.28, y: 0.38 }, // UAE
  { name: 'DIFC Trust', logo: '/partners/difc-trust.svg', placeholder: '🏛️', x: 0.26, y: 0.36 }, // UAE
];

const TrustedBy = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPartner, setHoveredPartner] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0.8]);

  useEffect(() => {
    if (!containerRef.current || !animationConfig.enableAnimations || device.isLowEnd) return;

    const partners = containerRef.current.querySelectorAll('.partner-logo');

    // Animate logos appearing
    gsap.fromTo(partners,
      {
        opacity: 0,
        scale: 0.5,
        y: 50,
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    // Animate connection lines
    const lines = containerRef.current.querySelectorAll('.connection-line');
    gsap.fromTo(lines,
      {
        scaleX: 0,
        opacity: 0,
      },
      {
        scaleX: 1,
        opacity: 0.4,
        duration: 1,
        delay: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [animationConfig.enableAnimations, device.isLowEnd]);

  // Calculate connection lines between nearby partners
  const getConnections = () => {
    const connections: Array<{ from: number; to: number }> = [];
    const threshold = 0.15; // Distance threshold for connections

    for (let i = 0; i < trustedPartners.length; i++) {
      for (let j = i + 1; j < trustedPartners.length; j++) {
        const dx = trustedPartners[i].x - trustedPartners[j].x;
        const dy = trustedPartners[i].y - trustedPartners[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < threshold) {
          connections.push({ from: i, to: j });
        }
      }
    }
    return connections;
  };

  const connections = getConnections();

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 bg-gradient-to-b from-transparent via-[#1C2A39]/20 to-[#1C2A39]/35 overflow-hidden min-h-[500px]"
    >
      <motion.div style={{ opacity }} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.p
            className="text-xs md:text-sm text-gray-400 uppercase tracking-[0.2em] font-semibold mb-2"
            initial={animationConfig.enableAnimations ? { opacity: 0 } : {}}
            whileInView={animationConfig.enableAnimations ? { opacity: 1 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Trusted by
          </motion.p>
          <motion.div
            className="w-12 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto"
            initial={animationConfig.enableAnimations ? { scaleX: 0 } : {}}
            whileInView={animationConfig.enableAnimations ? { scaleX: 1 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </motion.div>

        <div
          ref={containerRef}
          className="relative w-full h-[400px] md:h-[500px]"
        >
          {/* Connection lines */}
          {!device.isLowEnd && connections.map((conn, idx) => {
            const from = trustedPartners[conn.from];
            const to = trustedPartners[conn.to];
            const x1 = from.x * 100;
            const y1 = from.y * 100;
            const x2 = to.x * 100;
            const y2 = to.y * 100;

            return (
              <svg
                key={`${conn.from}-${conn.to}`}
                className="absolute inset-0 w-full h-full pointer-events-none connection-line"
                style={{ zIndex: 0 }}
              >
                <line
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="#D4AF37"
                  strokeWidth="2"
                  strokeOpacity={hoveredPartner === conn.from || hoveredPartner === conn.to ? 0.8 : 0.3}
                  className="transition-opacity duration-300"
                  style={{
                    filter: 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.5))',
                  }}
                />
                {/* Animated particles along line */}
                {animationConfig.enableAnimations && (
                  <motion.circle
                    r="3"
                    fill="#D4AF37"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{
                      cx: `${x1}%`,
                      cy: `${y1}%`,
                    }}
                  />
                )}
              </svg>
            );
          })}

          {/* Partner logos */}
          {trustedPartners.map((partner, index) => {
            const left = `${partner.x * 100}%`;
            const top = `${partner.y * 100}%`;

            return (
              <motion.div
                key={partner.name}
                className="partner-logo absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left, top, zIndex: 10 }}
                initial={animationConfig.enableAnimations ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                whileHover={device.supportsTouch ? {} : {
                  scale: 1.2,
                  z: 50,
                  transition: { duration: 0.3 },
                }}
                onHoverStart={() => setHoveredPartner(index)}
                onHoverEnd={() => setHoveredPartner(null)}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative group">
                  {/* Logo container */}
                  <div className="relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center glass-premium rounded-xl border-2 border-white/20 group-hover:border-[#D4AF37]/60 transition-all duration-300 group-hover:bg-white/20 group-hover:shadow-[0_8px_25px_rgba(212,175,55,0.3)]">
                    {/* Glow effect on hover */}
                    {!device.isLowEnd && (
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
                        transition={{ duration: 0.3 }}
                        style={{
                          background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.2) 0%, transparent 70%)',
                          filter: 'blur(12px)',
                        }}
                      />
                    )}

                    {partner.logo && partner.logo.startsWith('/') ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-10 md:h-14 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500 opacity-70 group-hover:opacity-100 relative z-10"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'placeholder text-2xl md:text-3xl opacity-70 group-hover:opacity-100 transition-opacity relative z-10';
                            placeholder.textContent = partner.placeholder;
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="text-2xl md:text-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 relative z-10">
                        {partner.placeholder}
                      </div>
                    )}
                  </div>

                  {/* Tooltip on hover */}
                  {!device.isMobile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={hoveredPartner === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#1C2A39] text-white text-xs rounded-lg whitespace-nowrap border border-[#D4AF37]/30 shadow-lg"
                      style={{ zIndex: 100 }}
                    >
                      {partner.name}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#1C2A39] border-l border-t border-[#D4AF37]/30 rotate-45" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile fallback: Simple grid */}
        {device.isMobile && (
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {trustedPartners.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={animationConfig.enableAnimations ? { opacity: 0, scale: 0.8 } : {}}
                whileInView={animationConfig.enableAnimations ? { opacity: 1, scale: 1 } : {}}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-24 h-16 flex items-center justify-center glass-premium rounded-lg border border-white/20"
              >
                {partner.logo && partner.logo.startsWith('/') ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-8 w-auto object-contain grayscale opacity-70"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-2xl opacity-70">{partner.placeholder}</div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default TrustedBy;
