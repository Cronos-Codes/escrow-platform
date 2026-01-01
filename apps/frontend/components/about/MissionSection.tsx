import React, { useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { Button } from '@escrow/ui';
import { DraggableFeatureCards } from './DraggableFeatureCards';

interface MissionSectionProps {
  userRole: string;
  isLoggedIn: boolean;
}

export const MissionSection: React.FC<MissionSectionProps> = ({ userRole, isLoggedIn }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  // Role-based content
  const getMissionContent = () => {
    if (isLoggedIn) {
      return {
        title: "Beyond Traditional Escrow",
        subtitle: "We're revolutionizing secure transactions with blockchain technology and AI-powered decision making.",
        description: "Gold Escrow combines the reliability of traditional legal escrow with cutting-edge technology to provide unprecedented security, transparency, and efficiency for high-value transactions worldwide.",
        features: [
          {
            id: "ai-security",
            title: "AI-Powered Security",
            description: "Advanced algorithms continuously monitor transactions for potential risks and anomalies.",
            icon: "🤖"
          },
          {
            id: "blockchain",
            title: "Blockchain Transparency",
            description: "Every transaction is recorded on immutable blockchain ledgers for complete auditability.",
            icon: "🔗"
          },
          {
            id: "global-compliance",
            title: "Global Compliance",
            description: "Licensed and regulated across multiple jurisdictions with full KYC/AML compliance.",
            icon: "🌍"
          },
          {
            id: "instant-settlement",
            title: "Instant Settlement",
            description: "Smart contracts enable automated execution when conditions are met.",
            icon: "⚡"
          }
        ]
      };
    } else {
      return {
        title: "The Future of Secure Transactions",
        subtitle: "Experience the next generation of escrow services with blockchain technology and AI intelligence.",
        description: "Gold Escrow represents the evolution of traditional escrow services, combining legal expertise with technological innovation to create the most secure and efficient transaction platform available.",
        features: [
          {
            id: "licensed-regulated",
            title: "Licensed & Regulated",
            description: "Fully licensed by UAE BAR with comprehensive regulatory compliance.",
            icon: "⚖️"
          },
          {
            id: "advanced-technology",
            title: "Advanced Technology",
            description: "Built on cutting-edge blockchain technology for maximum security.",
            icon: "🔐"
          },
          {
            id: "global-reach",
            title: "Global Reach",
            description: "Serve clients worldwide with multi-jurisdictional compliance.",
            icon: "🌐"
          },
          {
            id: "professional-support",
            title: "Professional Support",
            description: "Dedicated legal and technical support for every transaction.",
            icon: "👥"
          }
        ]
      };
    }
  };

  const content = getMissionContent();

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd">
            <g stroke="#FFFFFF" strokeOpacity="0.1">
              <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/>
            </g>
          </g>
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          style={{ y, opacity, scale }}
          className="text-center mb-16"
        >
          {/* Section Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-full text-yellow-400 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse" />
            Our Mission
          </motion.div>

          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {content.title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            {content.subtitle}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            {content.description}
          </motion.p>
        </motion.div>

        {/* Draggable Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
          className="mb-16"
        >
          <DraggableFeatureCards 
            features={content.features} 
            isLoggedIn={isLoggedIn}
          />
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="text-center"
        >
          {isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300"
                >
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/escrow/create">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  Create Escrow
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black font-bold px-8 py-4 rounded-xl transition-all duration-300"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
