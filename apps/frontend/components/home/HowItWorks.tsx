import React from 'react';
import { motion } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig, useTouchConfig } from '../../hooks/useDeviceOptimization';

const steps = [
  {
    icon: '🔒',
    title: 'Funds Secured',
    desc: 'Deposits are held in a regulated, neutral escrow account until all terms are met.'
  },
  {
    icon: '📜',
    title: 'Terms Verified',
    desc: 'All parties agree to legal terms, milestones, and compliance checks before release.'
  },
  {
    icon: '💸',
    title: 'Disbursement',
    desc: 'Funds are released only when all contractual obligations are fulfilled.'
  }
];

const HowItWorks = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const touchConfig = useTouchConfig();

  return (
    <section className="py-12 sm:py-16 bg-white/80 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
        <h2 className={`${device.isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'} font-serif font-bold mb-3 sm:mb-4 text-gray-900`}>
          How Escrow Works
        </h2>
        <p className={`${device.isMobile ? 'text-base sm:text-lg' : 'text-lg'} text-gray-600 px-4`}>
          A simple, secure, and transparent process for all parties.
        </p>
      </div>
      <div className={`grid grid-cols-1 ${device.isTablet ? 'sm:grid-cols-2 md:grid-cols-3' : 'md:grid-cols-3'} gap-6 sm:gap-8 max-w-5xl mx-auto`}>
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className={`bg-white rounded-xl ${device.isMobile ? 'p-6' : 'p-8'} shadow-lg flex flex-col items-center transition-all ring-1 ring-gray-200 ${
              touchConfig.enableHover 
                ? 'hover:-translate-y-2 hover:shadow-gold hover:ring-[#D4AF37]' 
                : 'active:scale-95 active:shadow-gold active:ring-[#D4AF37]'
            } focus-within:ring-[#D4AF37] touch-manipulation min-h-touch`}
            tabIndex={0}
            aria-label={step.title}
            {...(animationConfig.enableAnimations ? {
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: device.isMobile ? '-50px' : '-100px' },
              transition: { duration: animationConfig.duration, delay: i * 0.1 }
            } : {
              viewport: { once: true, margin: device.isMobile ? '-50px' : '-100px' }
            })}
          >
            <span className={`${device.isMobile ? 'text-4xl sm:text-5xl' : 'text-5xl'} mb-3 sm:mb-4`} aria-hidden="true">
              {step.icon}
            </span>
            <h3 className={`${device.isMobile ? 'text-lg sm:text-xl' : 'text-xl'} font-semibold mb-2 sm:mb-3 text-gray-900 text-center`}>
              {step.title}
            </h3>
            <p className={`${device.isMobile ? 'text-sm sm:text-base' : 'text-base'} text-gray-600 text-center leading-relaxed`}>
              {step.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks; 