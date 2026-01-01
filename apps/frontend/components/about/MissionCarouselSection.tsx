import React, { useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

interface MissionCarouselSectionProps {
  userRole: string;
}

interface MissionCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  details: string[];
  isLocked: boolean;
}

const missionCards: MissionCard[] = [
  {
    id: 'trust',
    title: 'Unwavering Trust',
    description: 'Building the most secure and transparent escrow system ever created.',
    icon: '🛡️',
    color: 'from-blue-400 to-blue-600',
    details: [
      '99.99% uptime guarantee',
      'Military-grade encryption',
      'Real-time audit trails',
      'Regulatory compliance across 50+ countries'
    ],
    isLocked: false
  },
  {
    id: 'ai',
    title: 'AI-Powered Intelligence',
    description: 'Advanced artificial intelligence that handles 95% of operations automatically.',
    icon: '🤖',
    color: 'from-purple-400 to-purple-600',
    details: [
      'Automated dispute resolution',
      'Predictive risk assessment',
      'Intelligent fraud detection',
      'Natural language processing for contracts'
    ],
    isLocked: false
  },
  {
    id: 'blockchain',
    title: 'Blockchain Security',
    description: 'Immutable blockchain technology ensuring transparency and security.',
    icon: '🔗',
    color: 'from-green-400 to-green-600',
    details: [
      'Smart contract automation',
      'Decentralized verification',
      'Tamper-proof records',
      'Instant settlement capabilities'
    ],
    isLocked: false
  },
  {
    id: 'global',
    title: 'Global Reach',
    description: 'Serving clients worldwide with localized compliance and support.',
    icon: '🌍',
    color: 'from-orange-400 to-orange-600',
    details: [
      '50+ countries supported',
      'Multi-currency transactions',
      '24/7 global support',
      'Local regulatory compliance'
    ],
    isLocked: false
  },
  {
    id: 'innovation',
    title: 'Continuous Innovation',
    description: 'Pioneering new technologies to redefine financial services.',
    icon: '⚡',
    color: 'from-indigo-400 to-indigo-600',
    details: [
      'Quantum-resistant security',
      'Advanced analytics',
      'Real-time market insights',
      'Future-proof architecture'
    ],
    isLocked: true
  },
  {
    id: 'community',
    title: 'Community Impact',
    description: 'Empowering businesses and individuals through accessible financial services.',
    icon: '🤝',
    color: 'from-pink-400 to-pink-600',
    details: [
      'Financial inclusion initiatives',
      'Educational programs',
      'Charitable partnerships',
      'Sustainable business practices'
    ],
    isLocked: true
  }
];

export const MissionCarouselSection: React.FC<MissionCarouselSectionProps> = ({ userRole }) => {
  const [activeCard, setActiveCard] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Auto-rotate carousel
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setActiveCard((prev) => {
        const visibleCards = getVisibleCards();
        return (prev + 1) % visibleCards.length;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isInView, userRole]);

  const getVisibleCards = () => {
    if (userRole === 'guest') {
      return missionCards.filter(card => !card.isLocked);
    }
    return missionCards;
  };

  const visibleCards = getVisibleCards();

  // Ensure activeCard is within bounds
  const safeActiveCard = Math.min(activeCard, visibleCards.length - 1);

  return (
    <section ref={containerRef} className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/3 to-cyan-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Mission & Philosophy
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our core principles guide every decision, every innovation, and every interaction.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Main Card Display */}
          <div className="flex justify-center mb-12">
            <motion.div
              key={safeActiveCard}
              className="w-full max-w-4xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`bg-gradient-to-br ${visibleCards[safeActiveCard].color} p-12 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-xl relative overflow-hidden`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mr-6 backdrop-blur-sm border border-white/30">
                      <span className="text-4xl">{visibleCards[safeActiveCard].icon}</span>
                    </div>
                    <div>
                      <h3 className="text-4xl font-bold text-white mb-2">{visibleCards[safeActiveCard].title}</h3>
                      <p className="text-white/80 text-xl">{visibleCards[safeActiveCard].description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {visibleCards[safeActiveCard].details.map((detail, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-white/60 rounded-full mr-4" />
                        <span className="text-white/90">{detail}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating Particles */}
                <AnimatePresence>
                  {hoveredCard === visibleCards[safeActiveCard].id && (
                    <>
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white/40 rounded-full"
                          initial={{
                            opacity: 0,
                            scale: 0,
                            x: 0,
                            y: 0
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: Math.cos((i * 30) * Math.PI / 180) * 100,
                            y: Math.sin((i * 30) * Math.PI / 180) * 100,
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Card Navigation */}
          <div className="flex justify-center space-x-4 mb-8">
            {visibleCards.map((card, index) => (
              <motion.button
                key={card.id}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === safeActiveCard 
                    ? 'bg-white shadow-lg' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                onClick={() => setActiveCard(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-between items-center absolute top-1/2 transform -translate-y-1/2 w-full px-4">
            <motion.button
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              onClick={() => setActiveCard((prev) => (prev - 1 + visibleCards.length) % visibleCards.length)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white text-xl">←</span>
            </motion.button>
            <motion.button
              className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              onClick={() => setActiveCard((prev) => (prev + 1) % visibleCards.length)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="text-white text-xl">→</span>
            </motion.button>
          </div>
        </div>

        {/* Role-based Additional Content */}
        {userRole !== 'guest' && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <h3 className="text-3xl font-bold text-blue-400 mb-4">
                {userRole === 'admin' ? 'Full Mission Access' : 'Extended Philosophy'}
              </h3>
              <p className="text-slate-300 text-lg">
                {userRole === 'admin'
                  ? 'Access complete mission details, strategic objectives, and future roadmap.'
                  : 'Explore our complete philosophy and how it guides our platform development.'
                }
              </p>
            </div>
          </motion.div>
        )}

        {/* Locked Content Notice for Guests */}
        {userRole === 'guest' && (
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <span className="text-2xl mr-3">🔒</span>
                <h4 className="text-xl font-bold text-white">Premium Content Available</h4>
              </div>
              <p className="text-slate-300">
                Sign up to unlock additional mission cards and exclusive content.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};


