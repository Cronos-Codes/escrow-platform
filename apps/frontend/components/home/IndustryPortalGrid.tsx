import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeviceOptimization, useAnimationConfig } from '../../hooks/useDeviceOptimization';

const industries = [
  {
    title: 'M&A Transactions',
    icon: '🏢',
    color: 'from-blue-500 to-cyan-500',
    bgPattern: '💼',
    description: 'All M&A escrows are subject to custom legal review and KYC/AML checks.',
    excerpt: '"Funds are held until all merger conditions are satisfied and verified by counsel."',
    checklist: ['Multi-Party Approval', 'Legal Audit', 'Regulatory Compliance'],
    regulatedBy: 'UAE Commercial Law & BAR',
  },
  {
    title: 'Real Estate Transfer',
    icon: '🏠',
    color: 'from-green-500 to-emerald-500',
    bgPattern: '🏗️',
    description: 'Escrow for property transfer in Dubai governed by RERA and UAE BAR.',
    excerpt: '"Disbursement only upon verified title transfer and legal clearance."',
    checklist: ['Title Verification', 'RERA Compliance', 'Legal Clearance'],
    regulatedBy: 'RERA & Dubai Land Department',
  },
  {
    title: 'Private Equity Funds',
    icon: '💰',
    color: 'from-purple-500 to-pink-500',
    bgPattern: '📊',
    description: 'Private equity escrows require multi-party agreement and regulatory compliance.',
    excerpt: '"Release of funds is subject to all parties\' sign-off and legal audit."',
    checklist: ['Fund Verification', 'Multi-Signatory', 'Due Diligence'],
    regulatedBy: 'DFSA & SEC Standards',
  },
  {
    title: 'Cross-Border Trade',
    icon: '🚢',
    color: 'from-orange-500 to-red-500',
    bgPattern: '🌍',
    description: 'Trade escrows are compliant with ICC and local customs law.',
    excerpt: '"Funds are released upon delivery confirmation and customs clearance."',
    checklist: ['ICC Compliance', 'Customs Verified', 'Delivery Proof'],
    regulatedBy: 'ICC & International Trade Law',
  },
  {
    title: 'Intellectual Property',
    icon: '⚡',
    color: 'from-yellow-500 to-amber-500',
    bgPattern: '©️',
    description: 'IP escrows are bound by WIPO and local IP law.',
    excerpt: '"Disbursement occurs only after license registration and legal verification."',
    checklist: ['IP Verification', 'WIPO Compliant', 'License Registry'],
    regulatedBy: 'WIPO & UAE IP Law',
  },
  {
    title: 'Commodity Trading',
    icon: '⚖️',
    color: 'from-teal-500 to-cyan-500',
    bgPattern: '🛢️',
    description: 'Protect both buyer and seller in high-value commodity trades.',
    excerpt: '"Legal-first escrow ensures quality, delivery, and payment security."',
    checklist: ['Quality Assurance', 'Delivery Verified', 'Payment Security'],
    regulatedBy: 'DMCC & Commodities Law',
  },
];

const IndustryPortalGrid = () => {
  const device = useDeviceOptimization();
  const animationConfig = useAnimationConfig();
  const [activePortal, setActivePortal] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-white/95 via-gray-50/90 to-white/95 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 text-8xl">⚖️</div>
        <div className="absolute bottom-20 right-10 text-8xl">🏛️</div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={animationConfig.enableAnimations ? { opacity: 0, y: 30 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block mb-4"
            initial={animationConfig.enableAnimations ? { scale: 0 } : {}}
            whileInView={animationConfig.enableAnimations ? { scale: 1 } : {}}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-gold font-semibold">
              Regulated Industries
            </span>
          </motion.div>
          <h2 className={`${device.isMobile ? 'text-3xl sm:text-4xl' : 'text-4xl md:text-5xl'} font-serif font-bold mb-4 text-gray-900`}>
            Industries We Serve
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Legal-first escrow for high-value, regulated transactions across multiple sectors.
          </p>
        </motion.div>

        {/* Portal Grid - Scattered Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {industries.map((industry, index) => (
            <PortalCard
              key={index}
              industry={industry}
              index={index}
              isActive={activePortal === index}
              onToggle={() => setActivePortal(activePortal === index ? null : index)}
              device={device}
              animationConfig={animationConfig}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          className="text-center mt-12 md:mt-16"
          initial={animationConfig.enableAnimations ? { opacity: 0 } : {}}
          whileInView={animationConfig.enableAnimations ? { opacity: 1 } : {}}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-sm text-gray-500">
            All transactions subject to KYC/AML compliance and legal review
          </p>
        </motion.div>
      </div>
    </section>
  );
};

interface PortalCardProps {
  industry: typeof industries[0];
  index: number;
  isActive: boolean;
  onToggle: () => void;
  device: any;
  animationConfig: any;
}

const PortalCard = ({ industry, index, isActive, onToggle, device, animationConfig }: PortalCardProps) => {
  return (
    <motion.div
      className="relative"
      style={{
        // Scattered positioning for visual interest
        marginTop: device.isMobile ? 0 : (index % 3 === 1 ? '2rem' : index % 3 === 2 ? '1rem' : '0'),
      }}
      initial={animationConfig.enableAnimations ? { opacity: 0, y: 50 } : {}}
      whileInView={animationConfig.enableAnimations ? { opacity: 1, y: 0 } : {}}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
    >
      {/* Animated border glow */}
      <AnimatedBorder isActive={isActive} />

      {/* Main Card */}
      <motion.div
        className={`relative rounded-2xl overflow-hidden cursor-pointer ${
          device.isLowEnd ? 'bg-white' : 'bg-white/80 backdrop-blur-md'
        } border-2 border-transparent transition-all duration-300 shadow-lg hover:shadow-2xl`}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
        whileHover={!device.isLowEnd ? { scale: 1.02 } : {}}
        onClick={onToggle}
      >
        {/* Front face */}
        <motion.div
          className="p-6 md:p-8 relative z-10"
          animate={{
            rotateY: isActive ? -15 : 0,
            x: isActive ? -10 : 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Icon with gradient */}
          <div className="mb-4 relative">
            <div className={`text-6xl md:text-7xl bg-gradient-to-br ${industry.color} bg-clip-text text-transparent inline-block`}>
              {industry.icon}
            </div>
            <div className="absolute -right-2 -top-2 text-2xl opacity-30">
              {industry.bgPattern}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl md:text-2xl font-bold mb-3 text-gray-900 group-hover:text-gold transition-colors">
            {industry.title}
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-gray-600 mb-4 leading-relaxed">
            {industry.description}
          </p>

          {/* Checklist */}
          <ul className="space-y-2 mb-4">
            {industry.checklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-gold text-base flex-shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex items-center gap-2 text-gold font-medium text-sm">
            <span>{isActive ? 'Close Portal' : 'Explore →'}</span>
          </div>
        </motion.div>

        {/* Portal depth content - opens like a door */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-gold/95 to-gold/85 backdrop-blur-lg flex flex-col justify-center p-6 md:p-8"
              initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'left center',
              }}
            >
              {/* Legal excerpt */}
              <div className="mb-6">
                <div className="text-xs uppercase tracking-wider text-white/80 mb-2">
                  Legal Excerpt
                </div>
                <blockquote className="text-white text-base md:text-lg font-serif italic border-l-4 border-white/50 pl-4 leading-relaxed">
                  {industry.excerpt}
                </blockquote>
              </div>

              {/* Regulated by */}
              <div className="mb-6">
                <div className="text-xs uppercase tracking-wider text-white/80 mb-2">
                  Regulated By
                </div>
                <p className="text-white text-sm md:text-base font-medium">
                  {industry.regulatedBy}
                </p>
              </div>

              {/* Compliance badge */}
              <div className="flex items-center gap-2 text-white/90 text-xs">
                <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  🛡️ KYC/AML Compliant
                </span>
                <span className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  ⚖️ BAR Approved
                </span>
              </div>

              {/* Decorative pattern */}
              <div className="absolute bottom-4 right-4 text-6xl opacity-10 pointer-events-none">
                {industry.icon}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

const AnimatedBorder = ({ isActive }: { isActive: boolean }) => {
  return (
    <motion.div
      className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-gold via-yellow-400 to-gold blur-sm"
      animate={{
        opacity: isActive ? [0.5, 0.8, 0.5] : [0, 0.3, 0],
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        backgroundSize: '200% 200%',
      }}
    />
  );
};

export default IndustryPortalGrid;


