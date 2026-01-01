import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig, useTouchConfig } from '../../hooks/useDeviceOptimization';

const industries = [
  {
    title: 'M&A Transactions',
    excerpt: 'All M&A escrows are subject to custom legal review and KYC/AML checks. Excerpt: "Funds are held until all merger conditions are satisfied and verified by counsel."',
  },
  {
    title: 'Real Estate Transfer (UAE/Dubai)',
    excerpt: 'Escrow for property transfer in Dubai is governed by RERA and UAE BAR. Excerpt: "Disbursement only upon verified title transfer and legal clearance."',
  },
  {
    title: 'Private Equity Fund Escrow',
    excerpt: "Private equity escrows require multi-party agreement and regulatory compliance. Excerpt: \"Release of funds is subject to all parties' sign-off and legal audit.\"",
  },
  {
    title: 'Cross-border Logistics and Trade',
    excerpt: 'Trade escrows are compliant with ICC and local customs law. Excerpt: "Funds are released upon delivery confirmation and customs clearance."',
  },
  {
    title: 'Intellectual Property Licensing',
    excerpt: 'IP escrows are bound by WIPO and local IP law. Excerpt: "Disbursement occurs only after license registration and legal verification."',
  },
];

const checklist = [
  'Audited Process',
  'Custom Agreement',
  'Verified Identity',
];

const IndustriesServed = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const touchConfig = useTouchConfig();
  const [hovered, setHovered] = useState<number | null>(null);
  const [tapped, setTapped] = useState<number | null>(null);

  const handleInteraction = (index: number) => {
    if (device.supportsTouch) {
      setTapped(tapped === index ? null : index);
    } else {
      setHovered(index);
    }
  };

  const handleInteractionEnd = () => {
    if (!device.supportsTouch) {
      setHovered(null);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white/90 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
        <h2 className={`${device.isMobile ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'} font-serif font-bold mb-3 sm:mb-4 text-gray-900`}>
          Industries We Serve
        </h2>
        <p className={`${device.isMobile ? 'text-base sm:text-lg' : 'text-lg'} text-gray-600 px-4`}>
          Legal-first escrow for high-value, regulated verticals.
        </p>
      </div>
      <div className={`grid grid-cols-1 ${device.isTablet ? 'sm:grid-cols-2' : 'sm:grid-cols-2 md:grid-cols-3'} gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto`}>
        {industries.map((ind, i) => (
          <motion.div
            key={ind.title}
            className={`relative ${device.isLowEnd ? 'bg-white' : 'bg-white/60 backdrop-blur-lg'} border border-gold/30 rounded-xl shadow-lg ${device.isMobile ? 'p-6' : 'p-8'} flex flex-col items-center text-center transition-all ${
              touchConfig.enableHover ? 'hover:shadow-gold hover:border-gold' : 'active:shadow-gold active:border-gold'
            } group cursor-pointer min-h-touch touch-manipulation`}
            onMouseEnter={touchConfig.enableHover ? () => handleInteraction(i) : undefined}
            onMouseLeave={touchConfig.enableHover ? handleInteractionEnd : undefined}
            onClick={() => handleInteraction(i)}
            tabIndex={0}
            aria-label={ind.title}
            aria-expanded={tapped === i || hovered === i}
            {...(animationConfig.enableAnimations ? {
              initial: { opacity: 0, y: 30 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, margin: device.isMobile ? '-50px' : '-100px' },
              transition: { duration: animationConfig.duration, delay: i * 0.1 }
            } : {
              viewport: { once: true, margin: device.isMobile ? '-50px' : '-100px' }
            })}
          >
            <h3 className={`font-semibold ${device.isMobile ? 'text-base sm:text-lg' : 'text-lg'} mb-2 sm:mb-3 text-gold text-center`}>
              {ind.title}
            </h3>
            <ul className={`mb-3 sm:mb-4 space-y-1 ${device.isMobile ? 'text-xs sm:text-sm' : 'text-sm'} w-full`}>
              {checklist.map((item, j) => (
                <li key={j} className="flex items-center gap-2 text-gray-700 justify-center sm:justify-start">
                  <span className="text-gold text-base flex-shrink-0">✔️</span>
                  <span className="text-left">{item}</span>
                </li>
              ))}
            </ul>
            <motion.div
              className={`absolute inset-0 flex items-center justify-center bg-gold/90 text-white ${device.isMobile ? 'text-xs px-3 py-4' : 'text-xs font-mono px-4 py-6'} rounded-xl shadow-lg pointer-events-none ${
                device.isLowEnd ? '' : 'backdrop-blur-lg'
              } transition-all duration-300`}
              initial={{ opacity: 0, filter: device.isLowEnd ? 'none' : 'blur(8px)' }}
              animate={(hovered === i || tapped === i) ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: device.isLowEnd ? 'none' : 'blur(8px)' }}
              transition={{ duration: 0.3 }}
              aria-hidden={(hovered !== i && tapped !== i)}
            >
              <p className={`${device.isMobile ? 'text-xs leading-relaxed px-2' : 'text-xs'} text-center`}>
                {ind.excerpt}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default IndustriesServed; 