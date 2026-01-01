import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const badges = [
  { name: 'UAE BAR', src: '/badges/uae-bar.svg', alt: 'UAE BAR', position: 'top' },
  { name: 'AML/KYC', src: '/badges/aml-kyc.svg', alt: 'AML/KYC Regulator', position: 'left' },
  { name: 'ISO 27001', src: '/badges/iso-27001.svg', alt: 'ISO 27001', position: 'right' },
  { name: 'DIFC License', src: '/badges/difc.svg', alt: 'DIFC License', position: 'bottom-left' },
  { name: 'Partnered Law Firms', src: '/badges/law-firm.svg', alt: 'Partnered Law Firms', position: 'bottom-right' },
];

const RegulatoryBadgeStrip = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const shieldRef = useRef<SVGSVGElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  const getPositionX = (position: string) => {
    const positions: Record<string, number> = {
      top: 0,
      left: -80,
      right: 80,
      'bottom-left': -60,
      'bottom-right': 60,
    };
    return positions[position] || 0;
  };

  const getPositionY = (position: string) => {
    const positions: Record<string, number> = {
      top: -80,
      left: 0,
      right: 0,
      'bottom-left': 60,
      'bottom-right': 60,
    };
    return positions[position] || 0;
  };

  // Shield assembly animation
  useEffect(() => {
    if (!shieldRef.current || !animationConfig.enableAnimations || typeof window === 'undefined') return;

    const badges = shieldRef.current.querySelectorAll('.badge-item');
    const shieldPath = shieldRef.current.querySelector('.shield-path') as SVGPathElement;

    // Animate shield path drawing using stroke-dasharray
    if (shieldPath) {
      const pathLength = shieldPath.getTotalLength();
      // Set initial state
      gsap.set(shieldPath, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
        opacity: 0,
      });

      // Animate to final state
      gsap.to(shieldPath, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 1.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }

    // Animate badges appearing and moving to positions
    badges.forEach((badge, index) => {
      const badgeElement = badge as HTMLElement;
      const position = badgeElement.dataset.position || 'center';

      gsap.fromTo(badgeElement,
        {
          opacity: 0,
          scale: 0,
          x: 0,
          y: 0,
        },
        {
          opacity: 1,
          scale: 1,
          x: getPositionX(position),
          y: getPositionY(position),
          duration: 0.8,
          delay: index * 0.15 + 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars && trigger.vars.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, [animationConfig.enableAnimations]);

  // Shield pulsing glow
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 0.6, 0.3]);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 bg-gradient-to-b from-[#1C2A39]/35 via-[#1C2A39]/50 to-[#1C2A39]/35 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className={`${device.isMobile ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-serif font-bold text-white mb-4`}>
            Licensed & Regulated
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our certifications and licenses form a protective shield around every transaction
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          {/* Shield Visualization */}
          <motion.div
            className="relative flex-shrink-0"
            style={{ opacity: glowOpacity }}
          >
            <svg
              ref={shieldRef}
              width={device.isMobile ? 280 : 400}
              height={device.isMobile ? 320 : 460}
              className="relative z-10"
            >
              {/* Shield shape */}
              <motion.path
                className="shield-path"
                d="M 200 50 L 280 120 L 280 200 Q 280 280 200 350 Q 120 280 120 200 L 120 120 Z"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="3"
                strokeOpacity="0.4"
                initial={{ opacity: 0 }}
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.5))',
                }}
              />
              
              {/* Pulsing glow effect */}
              {!device.isLowEnd && (
                <motion.circle
                  cx="200"
                  cy="200"
                  r="140"
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  strokeOpacity="0.2"
                  animate={{
                    r: [140, 160, 140],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Badge positions */}
              {badges.map((badge, index) => {
                const centerX = device.isMobile ? 140 : 200;
                const centerY = device.isMobile ? 160 : 200;
                let x = centerX;
                let y = centerY;

                switch (badge.position) {
                  case 'top':
                    x = centerX;
                    y = centerY - 80;
                    break;
                  case 'left':
                    x = centerX - 80;
                    y = centerY;
                    break;
                  case 'right':
                    x = centerX + 80;
                    y = centerY;
                    break;
                  case 'bottom-left':
                    x = centerX - 60;
                    y = centerY + 60;
                    break;
                  case 'bottom-right':
                    x = centerX + 60;
                    y = centerY + 60;
                    break;
                }

                return (
                  <g
                    key={badge.name}
                    className="badge-item"
                    data-position={badge.position}
                    transform={`translate(${x}, ${y})`}
                  >
                    <motion.foreignObject
                      x={device.isMobile ? -30 : -40}
                      y={device.isMobile ? -30 : -40}
                      width={device.isMobile ? 60 : 80}
                      height={device.isMobile ? 60 : 80}
                      whileHover={device.supportsTouch ? {} : { scale: 1.15 }}
                    >
                      <div className="w-full h-full flex items-center justify-center bg-white/10 backdrop-blur-md rounded-xl border-2 border-white/20 hover:border-[#D4AF37]/60 transition-all duration-300 hover:bg-white/20 hover:shadow-[0_8px_25px_rgba(212,175,55,0.3)] cursor-pointer">
                        {badge.src && badge.src.startsWith('/') ? (
                          <img
                            src={badge.src}
                            alt={badge.alt}
                            className="h-8 md:h-10 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-xl md:text-2xl opacity-70">🛡️</div>
                        )}
                      </div>
                    </motion.foreignObject>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* Badge list (mobile/expanded view) */}
          <div className="flex-1">
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden mb-4 text-[#D4AF37] text-sm font-semibold"
            >
              {isExpanded ? 'Show Less' : 'View All Certifications'}
            </motion.button>
            
            <div className={`grid ${device.isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 ${device.isMobile && !isExpanded ? 'hidden' : ''}`}>
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.name}
                  initial={animationConfig.enableAnimations ? { opacity: 0, x: -20 } : {}}
                  whileInView={animationConfig.enableAnimations ? { opacity: 1, x: 0 } : {}}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg">
                    {badge.src && badge.src.startsWith('/') ? (
                      <img
                        src={badge.src}
                        alt={badge.alt}
                        className="h-8 w-auto object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-xl">🛡️</div>
                    )}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm md:text-base">{badge.name}</div>
                    <div className="text-gray-400 text-xs">Verified & Active</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Click to expand shield */}
        {!device.isMobile && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-8 mx-auto block text-[#D4AF37] text-sm font-semibold hover:text-[#bfa134] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isExpanded ? 'Collapse Details' : 'Click to View All Certifications'}
          </motion.button>
        )}
      </div>
    </section>
  );
};

export default RegulatoryBadgeStrip;
