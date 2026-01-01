import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { AdvancedTransactionMarquee } from './AdvancedTransactionMarquee';

interface GlobalImpactSectionProps {
  userRole: string;
  isLoggedIn: boolean;
}

// 3D Globe Component
const Globe: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial
          color="#D4AF37"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export const GlobalImpactSection: React.FC<GlobalImpactSectionProps> = ({ userRole, isLoggedIn }) => {
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

  // Role-based statistics
  const getGlobalStats = () => {
    if (isLoggedIn) {
      return {
        title: "Worldwide Trust Network",
        subtitle: "Join thousands of professionals and businesses who trust Gold Escrow for their most critical transactions.",
        stats: [
          { label: "Active Escrows", value: "2,847", change: "+12%" },
          { label: "Countries Served", value: "156", change: "+3" },
          { label: "Total Volume", value: "$4.2B", change: "+18%" },
          { label: "Success Rate", value: "99.8%", change: "+0.1%" }
        ],
        transactions: [
          { from: "UAE", to: "UK", amount: "$2.3M", type: "Real Estate" },
          { from: "USA", to: "Germany", amount: "$1.8M", type: "Commodities" },
          { from: "Singapore", to: "Australia", amount: "$950K", type: "Technology" },
          { from: "Canada", to: "Japan", amount: "$1.2M", type: "Manufacturing" }
        ]
      };
    } else {
      return {
        title: "Global Transaction Network",
        subtitle: "Experience the power of a truly global escrow platform serving clients across 156 countries.",
        stats: [
          { label: "Countries Served", value: "156", change: "+3" },
          { label: "Languages Supported", value: "24", change: "+2" },
          { label: "Regulatory Compliance", value: "100%", change: "✓" },
          { label: "Customer Satisfaction", value: "98.5%", change: "+0.5%" }
        ],
        transactions: [
          { from: "UAE", to: "UK", amount: "$2.3M", type: "Real Estate" },
          { from: "USA", to: "Germany", amount: "$1.8M", type: "Commodities" },
          { from: "Singapore", to: "Australia", amount: "$950K", type: "Technology" },
          { from: "Canada", to: "Japan", amount: "$1.2M", type: "Manufacturing" }
        ]
      };
    }
  };

  const content = getGlobalStats();

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-green-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-green-500/5 rounded-full blur-3xl" />
      </div>

      {/* Animated Grid */}
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
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-400/20 to-blue-400/20 border border-green-400/30 rounded-full text-green-400 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
            Global Impact
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
        </motion.div>

        {/* Stats and Globe Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.6 }}
            className="grid grid-cols-2 gap-8"
          >
            {content.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl backdrop-blur-xl hover:border-green-400/30 transition-all duration-500"
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  {stat.label}
                </div>
                <div className="text-green-400 text-xs font-medium">
                  {stat.change}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* 3D Globe */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="relative h-96 lg:h-[500px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-2xl border border-slate-700/50 backdrop-blur-xl">
              <Globe />
            </div>
            
            {/* Floating Transaction Indicators */}
            {content.transactions.map((txn, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
                className="absolute p-3 bg-gradient-to-r from-green-400/20 to-blue-400/20 border border-green-400/30 rounded-lg backdrop-blur-sm text-white text-xs"
                style={{
                  top: `${20 + index * 15}%`,
                  left: `${10 + index * 20}%`,
                }}
              >
                <div className="font-bold">{txn.from} → {txn.to}</div>
                <div className="text-green-400">{txn.amount}</div>
                <div className="text-slate-300">{txn.type}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Advanced Live Transaction Network */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 1.4 }}
        >
          <AdvancedTransactionMarquee />
        </motion.div>
      </div>
    </section>
  );
};
