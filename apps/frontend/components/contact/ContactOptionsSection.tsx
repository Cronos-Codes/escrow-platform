import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useRef } from 'react';

interface ContactOptionsSectionProps {
  userRole: string;
}

interface ContactOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  contactInfo: {
    primary: string;
    secondary?: string;
    action: string;
  };
  color: string;
  delay: number;
  status: 'online' | 'busy' | 'offline';
  responseTime: string;
}

const contactOptions: ContactOption[] = [
  {
    id: 'concierge-call',
    title: 'Concierge Call',
    subtitle: 'Priority Client Line',
    icon: '📞',
    description: 'Direct access to our VIP concierge team for immediate assistance with high-value transactions.',
    contactInfo: {
      primary: '+1 (888) GOLD-ESCROW',
      secondary: 'Available 24/7 for VIP clients',
      action: 'Call Now'
    },
    color: 'from-yellow-400 to-yellow-600',
    delay: 0,
    status: 'online',
    responseTime: 'Instant'
  },
  {
    id: 'blockchain-support',
    title: 'Blockchain Support',
    subtitle: 'Technical Assistance',
    icon: '⚡',
    description: 'Get help with wallet connections, transaction issues, or smart contract questions.',
    contactInfo: {
      primary: 'support@goldescrow.com',
      secondary: 'Average response: 2 minutes',
      action: 'Get Support'
    },
    color: 'from-purple-400 to-purple-600',
    delay: 0.1,
    status: 'online',
    responseTime: '2 minutes'
  },
  {
    id: 'partnerships',
    title: 'Partnerships',
    subtitle: 'Luxury Onboarding',
    icon: '🤝',
    description: 'Institutional client onboarding with dedicated relationship managers and custom solutions.',
    contactInfo: {
      primary: 'partnerships@goldescrow.com',
      secondary: 'Schedule a consultation',
      action: 'Partner With Us'
    },
    color: 'from-emerald-400 to-emerald-600',
    delay: 0.2,
    status: 'busy',
    responseTime: '4 hours'
  }
];

export const ContactOptionsSection: React.FC<ContactOptionsSectionProps> = ({
  userRole
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [shuffledCards, setShuffledCards] = useState(contactOptions);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Memoized status colors for performance
  const statusColors = useMemo(() => ({
    online: 'bg-green-400',
    busy: 'bg-yellow-400',
    offline: 'bg-red-400'
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

  const handleCardHover = (cardId: string) => {
    setHoveredCard(cardId);
    
    // Optimized shuffle - only on desktop
    if (!isMobile) {
      const shuffled = [...contactOptions].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
    }
  };

  const handleCardLeave = () => {
    setHoveredCard(null);
    if (!isMobile) {
      setShuffledCards(contactOptions);
    }
  };

  const handleCardClick = (option: ContactOption) => {
    // Handle different actions based on option type
    switch (option.id) {
      case 'concierge-call':
        window.location.href = `tel:${option.contactInfo.primary.replace(/\s/g, '')}`;
        break;
      case 'blockchain-support':
        window.location.href = `mailto:${option.contactInfo.primary}`;
        break;
      case 'partnerships':
        window.location.href = `mailto:${option.contactInfo.primary}`;
        break;
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 bg-gradient-to-b from-[#0A0A0A] to-[#1C2A39]"
      role="region"
      aria-label="Contact Options"
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Choose Your Concierge Experience
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            From instant AI responses to dedicated human concierge service — 
            we're here to ensure your escrow experience is seamless and secure.
          </p>
        </motion.div>

        {/* Enhanced Option Card Deck */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            <AnimatePresence>
              {shuffledCards.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 50, rotateY: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: option.delay,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true }}
                  layout
                  className="relative group"
                >
                  <motion.div
                    onHoverStart={() => handleCardHover(option.id)}
                    onHoverEnd={handleCardLeave}
                    onClick={() => handleCardClick(option)}
                    whileHover={{ 
                      y: isMobile ? -10 : -20, 
                      rotateY: isMobile ? 0 : 5,
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative h-72 sm:h-80 bg-gradient-to-br ${option.color} rounded-2xl p-4 sm:p-6 
                      cursor-pointer overflow-hidden shadow-2xl
                      transform perspective-1000
                      focus:outline-none focus:ring-4 focus:ring-white/20
                    `}
                    role="button"
                    tabIndex={0}
                    aria-label={`${option.title} - ${option.subtitle}`}
                  >
                    {/* Enhanced Card Background Pattern */}
                    <div className="absolute inset-0 bg-black/20 rounded-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
                    
                    {/* Enhanced Shimmer Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: option.delay
                      }}
                    />

                    {/* Enhanced Card Content */}
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header with Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl sm:text-4xl">{option.icon}</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusColors[option.status]} animate-pulse`} />
                          <span className="text-white/80 text-xs font-medium">
                            {option.responseTime}
                          </span>
                        </div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                        {option.title}
                      </h3>
                      
                      {/* Subtitle */}
                      <p className="text-white/80 text-sm font-medium mb-4">
                        {option.subtitle}
                      </p>
                      
                      {/* Description */}
                      <p className="text-white/90 text-sm leading-relaxed mb-6 flex-grow">
                        {option.description}
                      </p>

                      {/* Enhanced Contact Info - Hidden by default, revealed on hover */}
                      <AnimatePresence>
                        {hoveredCard === option.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-3"
                          >
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                              <p className="text-white font-semibold text-sm">
                                {option.contactInfo.primary}
                              </p>
                              {option.contactInfo.secondary && (
                                <p className="text-white/70 text-xs mt-1">
                                  {option.contactInfo.secondary}
                                </p>
                              )}
                            </div>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
                            >
                              {option.contactInfo.action}
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Enhanced Default Action Button */}
                      <AnimatePresence>
                        {hoveredCard !== option.id && (
                          <motion.button
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-white/20 backdrop-blur-sm text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors"
                          >
                            Learn More
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Enhanced Glow Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      animate={{
                        boxShadow: hoveredCard === option.id 
                          ? '0 0 40px rgba(255, 255, 255, 0.3)' 
                          : '0 0 20px rgba(255, 255, 255, 0.1)'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced Hover Shuffle Animation Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-yellow-400/60 text-sm font-medium">
            {isMobile ? '💫 Tap cards to access contact options' : '💫 Hover over cards to see them shuffle and reveal contact details'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};


