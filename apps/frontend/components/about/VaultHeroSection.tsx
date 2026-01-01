import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@escrow/ui';

interface VaultHeroSectionProps {
  userRole: string;
  isLoggedIn: boolean;
}

export const VaultHeroSection: React.FC<VaultHeroSectionProps> = ({ userRole, isLoggedIn }) => {
  const [vaultOpen, setVaultOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const { scrollYProgress } = useScroll();
  
  // Transform scroll progress for vault opening
  const vaultScale = useTransform(scrollYProgress, [0, 0.1], [1, 1.2]);
  const vaultRotation = useTransform(scrollYProgress, [0, 0.1], [0, 5]);

  useEffect(() => {
    // Open vault after initial load
    const timer = setTimeout(() => setVaultOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show particles when vault opens
    if (vaultOpen) {
      const timer = setTimeout(() => setShowParticles(true), 500);
      return () => clearTimeout(timer);
    }
  }, [vaultOpen]);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <g stroke="#FFFFFF" strokeOpacity="0.1">
              <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/>
            </g>
          </g>
        </svg>
      </div>

      {/* Glass Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Vault Container */}
      <motion.div
        className="relative w-96 h-96"
        style={{ scale: vaultScale, rotateY: vaultRotation }}
      >
        {/* Vault Door */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-slate-700/80 to-slate-800/80 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-xl"
          animate={{
            rotateY: vaultOpen ? -90 : 0,
            boxShadow: vaultOpen 
              ? "0 0 60px rgba(59, 130, 246, 0.4)" 
              : "0 0 30px rgba(59, 130, 246, 0.2)"
          }}
          transition={{ 
            duration: 2, 
            ease: "easeInOut",
            delay: 0.5 
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Vault Handle */}
          <div className="absolute top-1/2 left-4 w-8 h-16 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full transform -translate-y-1/2 flex items-center justify-center shadow-lg">
            <div className="w-4 h-4 bg-blue-200 rounded-full shadow-inner" />
          </div>
          
          {/* Vault Lock */}
          <div className="absolute top-1/3 right-8 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 bg-blue-200 rounded-full animate-pulse shadow-inner" />
          </div>

          {/* Vault Details */}
          <div className="absolute inset-4 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl border border-white/10" />
        </motion.div>

        {/* AI Cube */}
        <AnimatePresence>
          {vaultOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                className="w-32 h-32 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-xl shadow-2xl border border-blue-300/50"
                animate={{
                  rotateY: [0, 360],
                  rotateX: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Cube Faces */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl border border-blue-300/50" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl border border-blue-300/50 transform rotateY(90deg) translateZ(64px)" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl border border-blue-300/50 transform rotateX(90deg) translateZ(64px)" />
                
                {/* AI Circuit Pattern */}
                <div className="absolute inset-2 bg-slate-900/30 rounded-lg backdrop-blur-sm">
                  <div className="w-full h-0.5 bg-blue-300 mt-4 shadow-sm" />
                  <div className="w-0.5 h-full bg-blue-300 ml-4 shadow-sm" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full absolute top-2 left-2 animate-pulse shadow-sm" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full absolute bottom-2 right-2 animate-pulse shadow-sm" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Particles */}
      <AnimatePresence>
        {showParticles && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full shadow-sm"
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
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Hero Text Overlay */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center z-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.h1
          className="text-6xl md:text-8xl font-bold text-white mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
            Gold Escrow
          </span>
        </motion.h1>
        
        <motion.p
          className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3 }}
        >
          The Future of Trust: AI-driven, blockchain-secured, human-guided only when necessary.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 3.5 }}
        >
          <Button
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-yellow-400/30"
            onClick={() => {
              const element = document.getElementById('story-timeline');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore the System
          </Button>
          
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20 hover:text-black font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white/5"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/20 hover:text-black font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white/5"
              >
                Create Escrow
              </Button>
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-yellow-400/50 rounded-full flex justify-center backdrop-blur-sm bg-white/5">
          <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-bounce" />
        </div>
      </motion.div>
    </section>
  );
};
