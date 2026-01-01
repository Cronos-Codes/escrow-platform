import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { FaHome, FaHandshake, FaCreditCard, FaBalanceScale, FaMicrophone } from 'react-icons/fa';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const useCases = [
  {
    icon: <FaHome className="text-blue-500" />,
    label: 'Real Estate Closings',
    desc: 'Secure property transactions with neutral, licensed escrow for buyers, sellers, and agents.',
    flow: ['Buyer', 'Escrow', 'Verification', 'Seller'],
    color: '#3b82f6',
  },
  {
    icon: <FaHandshake className="text-emerald-500" />,
    label: 'Broker Commissions',
    desc: 'Guarantee commission disbursement only when all deal terms are satisfied.',
    flow: ['Client', 'Escrow', 'Terms Met', 'Broker'],
    color: '#10b981',
  },
  {
    icon: <FaCreditCard className="text-amber-500" />,
    label: 'Bond Disbursement',
    desc: 'Release bond funds only upon verified completion of legal or contractual milestones.',
    flow: ['Issuer', 'Escrow', 'Milestone', 'Beneficiary'],
    color: '#f59e0b',
  },
  {
    icon: <FaBalanceScale className="text-violet-500" />,
    label: 'Commodity Payment',
    desc: 'Protect both buyer and seller in high-value commodity trades with legal-first escrow.',
    flow: ['Buyer', 'Escrow', 'Delivery', 'Seller'],
    color: '#8b5cf6',
  },
  {
    icon: <FaMicrophone className="text-pink-500" />,
    label: 'Event Sponsorship',
    desc: 'Ensure sponsor funds are released only after event deliverables are met.',
    flow: ['Sponsor', 'Escrow', 'Event', 'Organizer'],
    color: '#ec4899',
  },
];

const UseCases = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Horizontal scroll setup
  useEffect(() => {
    if (!containerRef.current || !animationConfig.enableAnimations || device.isMobile) return;

    const cards = containerRef.current.querySelectorAll('.use-case-card');

    // Create horizontal scroll
    gsap.to(cards, {
      xPercent: -100 * (cards.length - 1),
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${cards.length * (typeof window !== 'undefined' ? window.innerWidth : 1200)}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // Animate cards on scroll
    cards.forEach((card, index) => {
      gsap.fromTo(card,
        {
          rotationY: 15,
          opacity: 0.7,
        },
        {
          rotationY: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: card as HTMLElement,
            containerAnimation: gsap.getById('horizontal-scroll') as ScrollTrigger,
            start: 'left center',
            end: 'right center',
            scrub: true,
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [animationConfig.enableAnimations, device.isMobile]);

  // Flow animation for active card
  const FlowAnimation = ({ flow, color }: { flow: string[]; color: string }) => {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setActiveStep(prev => (prev + 1) % (flow.length + 1));
      }, 1500);
      return () => clearInterval(interval);
    }, [flow.length]);

    return (
      <div className="flex items-center justify-center gap-2 md:gap-4 mt-6">
        {flow.map((step, index) => (
          <React.Fragment key={index}>
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{
                scale: activeStep === index ? 1.1 : 1,
                opacity: activeStep >= index ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm"
                style={{
                  backgroundColor: activeStep === index ? color : `${color}80`,
                }}
              >
                {step}
              </div>
            </motion.div>
            {index < flow.length - 1 && (
              <motion.div
                className="h-0.5 md:h-1 flex-1 max-w-16 md:max-w-24"
                style={{ backgroundColor: color }}
                animate={{
                  scaleX: activeStep > index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 20 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className={`${device.isMobile ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'} font-serif font-bold mb-4 text-white px-4`}>
            Built for Complex Transactions
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            See how escrow protects different transaction types through animated flows
          </p>
        </motion.div>

        {/* Desktop: Horizontal scroll carousel */}
        {!device.isMobile ? (
          <div
            ref={containerRef}
            className="flex gap-8 overflow-x-hidden"
            style={{ width: `${useCases.length * 100}%` }}
          >
            {useCases.map((uc, index) => (
              <motion.div
                key={uc.label}
                className="use-case-card flex-shrink-0 w-screen px-8"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="glass-premium rounded-2xl p-8 md:p-12 hover:shadow-2xl transition-shadow duration-300"
                  whileHover={device.supportsTouch ? {} : {
                    y: -8,
                    transition: { duration: 0.3 },
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-6xl md:text-7xl mb-6"
                      animate={{
                        rotateY: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {uc.icon}
                    </motion.div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                      {uc.label}
                    </h3>
                    <p className="text-gray-300 mb-8 max-w-md mx-auto">
                      {uc.desc}
                    </p>
                    <FlowAnimation flow={uc.flow} color={uc.color} />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Mobile: Vertical stack with swipe */
          <div className="space-y-6">
            {useCases.map((uc, index) => (
              <motion.div
                key={uc.label}
                initial={animationConfig.enableAnimations ? { opacity: 0, y: 30 } : {}}
                whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-premium rounded-xl p-6"
                onClick={() => setActiveIndex(index)}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4">{uc.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {uc.label}
                  </h3>
                  <p className="text-gray-300 mb-6 text-sm">
                    {uc.desc}
                  </p>
                  {activeIndex === index && (
                    <FlowAnimation flow={uc.flow} color={uc.color} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Scroll indicator for desktop */}
        {!device.isMobile && (
          <motion.div
            className="mt-8 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-400 text-sm">Scroll horizontally to explore</span>
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default UseCases;
