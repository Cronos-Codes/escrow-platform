import React, { useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

interface GlobalImpactMapSectionProps {
  userRole: string;
}

interface CountryData {
  id: string;
  name: string;
  code: string;
  transactions: number;
  volume: string;
  disputes: number;
  position: { x: number; y: number };
  color: string;
}

const countryData: CountryData[] = [
  {
    id: 'usa',
    name: 'United States',
    code: 'US',
    transactions: 12500,
    volume: '$2.5B',
    disputes: 23,
    position: { x: 20, y: 45 },
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'uae',
    name: 'United Arab Emirates',
    code: 'AE',
    transactions: 8900,
    volume: '$1.8B',
    disputes: 12,
    position: { x: 55, y: 50 },
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    code: 'GB',
    transactions: 7600,
    volume: '$1.2B',
    disputes: 18,
    position: { x: 48, y: 42 },
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'singapore',
    name: 'Singapore',
    code: 'SG',
    transactions: 5400,
    volume: '$980M',
    disputes: 8,
    position: { x: 75, y: 55 },
    color: 'from-indigo-400 to-indigo-600'
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'DE',
    transactions: 6200,
    volume: '$1.1B',
    disputes: 15,
    position: { x: 52, y: 40 },
    color: 'from-cyan-400 to-cyan-600'
  },
  {
    id: 'japan',
    name: 'Japan',
    code: 'JP',
    transactions: 4800,
    volume: '$850M',
    disputes: 11,
    position: { x: 85, y: 45 },
    color: 'from-pink-400 to-pink-600'
  },
  {
    id: 'australia',
    name: 'Australia',
    code: 'AU',
    transactions: 3200,
    volume: '$580M',
    disputes: 7,
    position: { x: 82, y: 70 },
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 'canada',
    name: 'Canada',
    code: 'CA',
    transactions: 4100,
    volume: '$720M',
    disputes: 9,
    position: { x: 15, y: 35 },
    color: 'from-emerald-400 to-emerald-600'
  }
];

export const GlobalImpactMapSection: React.FC<GlobalImpactMapSectionProps> = ({ userRole }) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [activeArcs, setActiveArcs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Simulate real-time transaction updates
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setActiveArcs(prev => {
        const newArcs = [...prev];
        if (newArcs.length > 3) newArcs.shift();
        newArcs.push(`arc-${Date.now()}`);
        return newArcs;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isInView]);

  const getFilteredCountries = () => {
    if (userRole === 'guest') {
      return countryData.slice(0, 4); // Show only top 4 countries for guests
    }
    return countryData;
  };

  return (
    <section ref={containerRef} className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 rounded-full blur-3xl" />
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
              Global Impact
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Serving clients across 50+ countries with localized compliance and regulatory frameworks.
          </p>
        </motion.div>

        {/* Globe Container */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* 3D Globe */}
            <motion.div
              className="w-full lg:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <div className="relative w-96 h-96">
                {/* Globe Base */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-full border-2 border-blue-500/30 shadow-2xl backdrop-blur-xl"
                  animate={{
                    rotateY: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Globe Grid */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 opacity-30">
                      <svg width="100%" height="100%" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <g fill="none" fillRule="evenodd">
                          <g stroke="#FFFFFF" strokeOpacity="0.1">
                            <path d="M0 30h60M30 0v60"/>
                          </g>
                        </g>
                      </svg>
                    </div>
                  </div>

                  {/* Country Nodes */}
                  {getFilteredCountries().map((country, index) => (
                    <motion.div
                      key={country.id}
                      className="absolute"
                      style={{
                        left: `${country.position.x}%`,
                        top: `${country.position.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.2, z: 50 }}
                      onHoverStart={() => setHoveredCountry(country.id)}
                      onHoverEnd={() => setHoveredCountry(null)}
                      onClick={() => setSelectedCountry(country)}
                    >
                      <motion.div
                        className={`w-4 h-4 bg-gradient-to-br ${country.color} rounded-full border-2 border-white shadow-lg cursor-pointer`}
                        animate={{
                          scale: hoveredCountry === country.id ? [1, 1.3, 1] : 1,
                          boxShadow: hoveredCountry === country.id
                            ? "0 0 20px rgba(59, 130, 246, 0.6)"
                            : "0 0 10px rgba(255, 255, 255, 0.3)"
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      {/* Pulse Effect */}
                      <AnimatePresence>
                        {hoveredCountry === country.id && (
                          <motion.div
                            className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full"
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}

                  {/* Transaction Arcs */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {activeArcs.map((arcId, index) => {
                      const startCountry = getFilteredCountries()[Math.floor(Math.random() * getFilteredCountries().length)];
                      const endCountry = getFilteredCountries()[Math.floor(Math.random() * getFilteredCountries().length)];

                      return (
                        <motion.path
                          key={arcId}
                          d={`M ${startCountry.position.x} ${startCountry.position.y} Q 50 50 ${endCountry.position.x} ${endCountry.position.y}`}
                          stroke="url(#arcGradient)"
                          strokeWidth="2"
                          fill="none"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                        />
                      );
                    })}
                    <defs>
                      <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>

                {/* Globe Shadow */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-80 h-8 bg-black/20 rounded-full blur-xl" />
              </div>
            </motion.div>

            {/* Statistics Panel */}
            <motion.div
              className="w-full lg:w-1/2"
              initial={{ opacity: 0, x: 100 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                <h3 className="text-3xl font-bold text-white mb-6">Global Statistics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-6xl font-bold text-blue-400">50+</p>
                    <p className="text-white/80">Countries Served</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-6xl font-bold text-purple-400">$8.5B</p>
                    <p className="text-white/80">Total Volume</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-6xl font-bold text-green-400">50K+</p>
                    <p className="text-white/80">Daily Transactions</p>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                    <p className="text-6xl font-bold text-cyan-400">99.9%</p>
                    <p className="text-white/80">Success Rate</p>
                  </div>
                </div>

                {/* Top Countries */}
                <div>
                  <h4 className="text-xl font-bold text-white mb-4">Top Performing Countries</h4>
                  <div className="space-y-3">
                    {getFilteredCountries()
                      .sort((a, b) => b.transactions - a.transactions)
                      .slice(0, 5)
                      .map((country, index) => (
                        <motion.div
                          key={country.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"
                          initial={{ opacity: 0, x: 50 }}
                          animate={isInView ? { opacity: 1, x: 0 } : {}}
                          transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                          onHoverStart={() => setHoveredCountry(country.id)}
                          onHoverEnd={() => setHoveredCountry(null)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 bg-gradient-to-br ${country.color} rounded-full`} />
                            <span className="text-white font-medium">{country.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{country.volume}</p>
                            <p className="text-white/60 text-sm">{country.transactions.toLocaleString()} tx</p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Role-based Additional Content */}
        {userRole !== 'guest' && (
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <h3 className="text-3xl font-bold text-blue-400 mb-4">
                {userRole === 'admin' ? 'Global Analytics' : 'Your Global Reach'}
              </h3>
              <p className="text-slate-300 text-lg">
                {userRole === 'admin'
                  ? 'Access detailed analytics, regional performance metrics, and compliance monitoring across all markets.'
                  : 'Track your transactions across different regions and benefit from our global compliance framework.'
                }
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Country Detail Modal */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCountry(null)}
          >
            <motion.div
              className={`bg-gradient-to-br ${selectedCountry.color} p-8 rounded-2xl max-w-2xl w-full shadow-2xl border border-white/20 backdrop-blur-xl`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-6 backdrop-blur-sm border border-white/30">
                  <span className="text-3xl">🌍</span>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white">{selectedCountry.name}</h3>
                  <p className="text-white/80 text-xl">Country Code: {selectedCountry.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30">
                  <h4 className="text-white font-bold mb-2">Total Transactions</h4>
                  <p className="text-3xl font-bold text-white">{selectedCountry.transactions.toLocaleString()}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30">
                  <h4 className="text-white font-bold mb-2">Volume</h4>
                  <p className="text-3xl font-bold text-white">{selectedCountry.volume}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30">
                  <h4 className="text-white font-bold mb-2">Disputes</h4>
                  <p className="text-3xl font-bold text-white">{selectedCountry.disputes}</p>
                </div>
                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30">
                  <h4 className="text-white font-bold mb-2">Success Rate</h4>
                  <p className="text-3xl font-bold text-white">99.8%</p>
                </div>
              </div>

              <button
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-colors backdrop-blur-sm"
                onClick={() => setSelectedCountry(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
