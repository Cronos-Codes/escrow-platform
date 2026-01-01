import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CTAFooterProps {
  userRole: string;
  isLoggedIn: boolean;
}

export const CTAFooter: React.FC<CTAFooterProps> = ({
  userRole,
  isLoggedIn
}) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  const handleButtonClick = () => {
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 1000);
  };

  const generateSparkles = () => {
    return [...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-yellow-400 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -50, 0],
          opacity: [0, 1, 0],
          scale: [0, 1, 0],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut"
        }}
      />
    ));
  };

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background Sparkle Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {generateSparkles()}
      </div>

      {/* Golden Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-yellow-600/30 to-yellow-800/40" />
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Main CTA Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Ready to Experience
          </h2>
          <h3 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-yellow-500 to-yellow-700 bg-clip-text text-transparent">
            Luxury Escrow?
          </h3>
          
          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            AI responds instantly. Humans step in when disputes require.
          </p>

          {/* Animated CTA Button */}
          <div className="relative inline-block">
            <motion.button
              onHoverStart={() => setIsButtonHovered(true)}
              onHoverEnd={() => setIsButtonHovered(false)}
              onClick={handleButtonClick}
              className="relative px-12 py-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-xl rounded-2xl shadow-2xl overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Button Background Shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Button Content */}
              <span className="relative z-10 flex items-center gap-3">
                <span>Request Escrow Concierge</span>
                <motion.span
                  animate={{ x: isButtonHovered ? 5 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  →
                </motion.span>
              </span>

              {/* Ripple Effect */}
              <AnimatePresence>
                {showRipple && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-white/30 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Golden Particle Burst */}
              <AnimatePresence>
                {showRipple && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                        initial={{
                          x: 0,
                          y: 0,
                          scale: 0,
                          opacity: 1
                        }}
                        animate={{
                          x: Math.cos((i * 30) * Math.PI / 180) * 100,
                          y: Math.sin((i * 30) * Math.PI / 180) * 100,
                          scale: [0, 1, 0],
                          opacity: [1, 1, 0]
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.05
                        }}
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-gray-300 mt-8 text-lg"
          >
            Join thousands of clients who trust Gold Escrow for their most valuable transactions
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-8 mt-12 flex-wrap"
          >
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">24/7 AI Support</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm">Blockchain Secured</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-sm">Global Offices</span>
            </div>
          </motion.div>
        </motion.div>

        {/* VIP Indicator for logged-in users */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="mt-12"
          >
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-full px-8 py-4 backdrop-blur-sm">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              <span className="text-yellow-400 font-semibold text-lg">
                VIP Concierge Access Active
              </span>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating Golden Orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-yellow-400/30 rounded-full blur-sm"
              style={{
                left: `${10 + (i * 15)}%`,
                top: `${20 + (i % 2) * 60}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Floating Lines */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute w-px h-20 bg-gradient-to-b from-transparent via-yellow-400/50 to-transparent"
              style={{
                left: `${25 + (i * 20)}%`,
                top: `${10 + (i % 2) * 80}%`,
              }}
              animate={{
                scaleY: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
