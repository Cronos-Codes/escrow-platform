import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, useTransform, useScroll } from 'framer-motion';

interface Transaction {
  id: string;
  type: 'escrow' | 'release' | 'dispute' | 'settlement';
  amount: string;
  currency: string;
  from: string;
  to: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

interface AdvancedTransactionMarqueeProps {
  className?: string;
}

export const AdvancedTransactionMarquee: React.FC<AdvancedTransactionMarqueeProps> = ({ 
  className = "" 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hoveredTransaction, setHoveredTransaction] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const controls = useAnimation();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform scroll progress for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  // Generate mock transactions
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'escrow',
        amount: '2,500,000',
        currency: 'USD',
        from: '0x7a3b...f4c2',
        to: '0x9d1e...a8b3',
        timestamp: '2 min ago',
        status: 'completed'
      },
      {
        id: '2',
        type: 'release',
        amount: '1,800,000',
        currency: 'EUR',
        from: '0x4f2a...c7d1',
        to: '0x6e8b...f9a2',
        timestamp: '5 min ago',
        status: 'completed'
      },
      {
        id: '3',
        type: 'settlement',
        amount: '3,200,000',
        currency: 'GBP',
        from: '0x1c9d...e5f8',
        to: '0x3b7a...c4e1',
        timestamp: '8 min ago',
        status: 'pending'
      },
      {
        id: '4',
        type: 'escrow',
        amount: '950,000',
        currency: 'USD',
        from: '0x8f4e...b2c9',
        to: '0x2d6a...f7e3',
        timestamp: '12 min ago',
        status: 'completed'
      },
      {
        id: '5',
        type: 'dispute',
        amount: '1,500,000',
        currency: 'EUR',
        from: '0x5c3b...a8d7',
        to: '0x9e1f...c6b4',
        timestamp: '15 min ago',
        status: 'pending'
      },
      {
        id: '6',
        type: 'release',
        amount: '4,100,000',
        currency: 'USD',
        from: '0x3a7d...f1c8',
        to: '0x6b9e...a4f2',
        timestamp: '18 min ago',
        status: 'completed'
      },
      {
        id: '7',
        type: 'settlement',
        amount: '2,800,000',
        currency: 'GBP',
        from: '0x1f4c...e9b6',
        to: '0x8a3d...f7c1',
        timestamp: '22 min ago',
        status: 'completed'
      },
      {
        id: '8',
        type: 'escrow',
        amount: '1,650,000',
        currency: 'EUR',
        from: '0x7c2e...b8f4',
        to: '0x4d9a...c6e3',
        timestamp: '25 min ago',
        status: 'pending'
      }
    ];

    setTransactions(mockTransactions);
  }, []);

  // Animation controls
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 1, ease: "easeOut" }
      });
    }
  }, [isInView, controls]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'escrow': return '🔒';
      case 'release': return '🔓';
      case 'dispute': return '⚖️';
      case 'settlement': return '✅';
      default: return '💼';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'escrow': return 'from-blue-500 to-blue-600';
      case 'release': return 'from-green-500 to-green-600';
      case 'dispute': return 'from-red-500 to-red-600';
      case 'settlement': return 'from-purple-500 to-purple-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
              style={{
                top: `${i * 5}%`,
                left: 0,
                right: 0,
                width: '100%'
              }}
              animate={{
                x: [0, 100, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        style={{ y, opacity, scale }}
        className="text-center mb-8 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-full text-yellow-400 text-sm font-medium mb-4 backdrop-blur-sm"
        >
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse" />
          Live Transaction Network
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold text-white mb-4"
        >
          Global Activity Feed
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-slate-300 text-lg max-w-2xl mx-auto"
        >
          Real-time transactions flowing through our secure escrow network
        </motion.p>
      </motion.div>

      {/* Marquee Container */}
      <div className="relative overflow-hidden">
        {/* First Marquee Row */}
        <motion.div
          className="flex space-x-8 mb-4"
          animate={{
            x: [0, -50]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {[...transactions, ...transactions].map((tx, index) => (
            <motion.div
              key={`${tx.id}-${index}`}
              className="flex-shrink-0"
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHoveredTransaction(`${tx.id}-${index}`)}
              onHoverEnd={() => setHoveredTransaction(null)}
            >
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="text-2xl"
                      animate={{
                        rotate: hoveredTransaction === `${tx.id}-${index}` ? [0, 360] : 0
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {getTransactionIcon(tx.type)}
                    </motion.div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(tx.type)} text-white`}>
                      {tx.type.toUpperCase()}
                    </div>
                  </div>
                  <div className={`text-xs ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Amount</span>
                    <span className="text-white font-bold">
                      {tx.amount} {tx.currency}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">From</span>
                    <span className="text-slate-300 text-sm font-mono">
                      {tx.from}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">To</span>
                    <span className="text-slate-300 text-sm font-mono">
                      {tx.to}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Time</span>
                    <span className="text-slate-300 text-sm">
                      {tx.timestamp}
                    </span>
                  </div>
                </div>

                {/* Hover Effect */}
                {hoveredTransaction === `${tx.id}-${index}` && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Second Marquee Row (Reverse Direction) */}
        <motion.div
          className="flex space-x-8"
          animate={{
            x: [-50, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {[...transactions, ...transactions].map((tx, index) => (
            <motion.div
              key={`reverse-${tx.id}-${index}`}
              className="flex-shrink-0"
              whileHover={{ 
                scale: 1.05,
                rotateY: -5,
                transition: { duration: 0.2 }
              }}
              onHoverStart={() => setHoveredTransaction(`reverse-${tx.id}-${index}`)}
              onHoverEnd={() => setHoveredTransaction(null)}
            >
              <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border border-slate-700/50 rounded-xl p-4 backdrop-blur-xl min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="text-2xl"
                      animate={{
                        rotate: hoveredTransaction === `reverse-${tx.id}-${index}` ? [0, -360] : 0
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {getTransactionIcon(tx.type)}
                    </motion.div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeColor(tx.type)} text-white`}>
                      {tx.type.toUpperCase()}
                    </div>
                  </div>
                  <div className={`text-xs ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Amount</span>
                    <span className="text-white font-bold">
                      {tx.amount} {tx.currency}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">From</span>
                    <span className="text-slate-300 text-sm font-mono">
                      {tx.from}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">To</span>
                    <span className="text-slate-300 text-sm font-mono">
                      {tx.to}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Time</span>
                    <span className="text-slate-300 text-sm">
                      {tx.timestamp}
                    </span>
                  </div>
                </div>

                {/* Hover Effect */}
                {hoveredTransaction === `reverse-${tx.id}-${index}` && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-transparent rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 1 }}
        className="mt-8 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl backdrop-blur-xl p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {transactions.length * 2}
            </div>
            <div className="text-slate-400 text-sm">Active Transactions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400 mb-1">
              {transactions.filter(tx => tx.status === 'completed').length * 2}
            </div>
            <div className="text-slate-400 text-sm">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {transactions.filter(tx => tx.type === 'escrow').length * 2}
            </div>
            <div className="text-slate-400 text-sm">Escrow Deals</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400 mb-1">
              4
            </div>
            <div className="text-slate-400 text-sm">Currencies</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
