import React, { useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@escrow/ui';

interface FooterCTASectionProps {
  userRole: string;
  isLoggedIn: boolean;
}

export const FooterCTASection: React.FC<FooterCTASectionProps> = ({ userRole, isLoggedIn }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowParticles(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const getCTAText = () => {
    if (userRole === 'admin') {
      return {
        title: 'Join the Revolution',
        subtitle: 'Lead the future of digital trust with advanced admin capabilities.',
        buttonText: 'Access Admin Panel',
        buttonLink: '/admin/panel'
      };
    } else if (isLoggedIn) {
      return {
        title: 'Continue Your Journey',
        subtitle: 'Access your dashboard and manage your escrow transactions.',
        buttonText: 'Go to Dashboard',
        buttonLink: '/dashboard'
      };
    } else {
      return {
        title: 'Join the Revolution',
        subtitle: 'Experience the future of trust with AI-driven escrow services.',
        buttonText: 'Create Your First Escrow',
        buttonLink: '/auth'
      };
    }
  };

  const ctaContent = getCTAText();

  return (
    <section ref={containerRef} className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center">
          {/* Main CTA Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {ctaContent.title}
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
              {ctaContent.subtitle}
            </p>
          </motion.div>

          {/* Animated CTA Button */}
          <motion.div
            className="relative inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Link href={ctaContent.buttonLink}>
              <motion.div
                className="relative"
                onHoverStart={() => setIsButtonHovered(true)}
                onHoverEnd={() => setIsButtonHovered(false)}
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border border-blue-400/30 text-xl backdrop-blur-sm"
                >
                  {ctaContent.buttonText}
                </Button>

                {/* Button Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isButtonHovered ? 0.5 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Sparkle Effect */}
                <AnimatePresence>
                  {isButtonHovered && (
                    <>
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-white rounded-full"
                          initial={{
                            opacity: 0,
                            scale: 0,
                            x: 0,
                            y: 0
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: Math.cos((i * 45) * Math.PI / 180) * 60,
                            y: Math.sin((i * 45) * Math.PI / 180) * 60,
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-white font-bold text-lg mb-2">Regulated</h3>
              <p className="text-slate-300 text-sm">UAE BAR, AML/KYC, ISO 27001</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-white font-bold text-lg mb-2">Secure</h3>
              <p className="text-slate-300 text-sm">Military-grade encryption</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-white font-bold text-lg mb-2">Fast</h3>
              <p className="text-slate-300 text-sm">Instant settlements</p>
            </div>
            
            <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-white font-bold text-lg mb-2">Global</h3>
              <p className="text-slate-300 text-sm">50+ countries served</p>
            </div>
          </motion.div>

          {/* Floating AI Cube */}
          <motion.div
            className="absolute top-1/4 right-1/4 w-32 h-32"
            animate={{
              rotateY: [0, 360],
              rotateX: [0, 360],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl border border-blue-300/50 shadow-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl border border-blue-300/50 transform rotateY(90deg) translateZ(64px)" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl border border-blue-300/50 transform rotateX(90deg) translateZ(64px)" />
          </motion.div>

          {/* Floating Coins */}
          <AnimatePresence>
            {showParticles && (
              <>
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-2xl"
                    initial={{
                      opacity: 0,
                      scale: 0,
                      x: Math.random() * window.innerWidth,
                      y: Math.random() * window.innerHeight,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight - 200],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                    }}
                  >
                    💰
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Role-based Additional Content */}
        {userRole !== 'guest' && (
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <h3 className="text-3xl font-bold text-blue-400 mb-4">
                {userRole === 'admin' ? 'Advanced Features Available' : 'Premium Features Unlocked'}
              </h3>
              <p className="text-slate-300 text-lg">
                {userRole === 'admin'
                  ? 'Access advanced analytics, dispute resolution tools, and system monitoring capabilities.'
                  : 'Enjoy premium features including priority support, advanced analytics, and exclusive tools.'
                }
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};


