import React, { useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

interface BlockchainAIShowcaseSectionProps {
  userRole: string;
}

interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'completed';
  timestamp: number;
}

interface AINode {
  id: string;
  type: 'input' | 'hidden' | 'output';
  position: { x: number; y: number };
  connections: string[];
  isActive: boolean;
}

const transactions: Transaction[] = [
  { id: 'tx1', from: '0x1234...', to: '0x5678...', amount: '1.5 ETH', status: 'confirmed', timestamp: Date.now() - 5000 },
  { id: 'tx2', from: '0x9abc...', to: '0xdef0...', amount: '0.8 ETH', status: 'pending', timestamp: Date.now() - 3000 },
  { id: 'tx3', from: '0x1111...', to: '0x2222...', amount: '2.3 ETH', status: 'completed', timestamp: Date.now() - 1000 },
];

const aiNodes: AINode[] = [
  { id: 'input1', type: 'input', position: { x: 20, y: 30 }, connections: ['hidden1', 'hidden2'], isActive: true },
  { id: 'input2', type: 'input', position: { x: 20, y: 70 }, connections: ['hidden1', 'hidden3'], isActive: true },
  { id: 'hidden1', type: 'hidden', position: { x: 50, y: 40 }, connections: ['output1'], isActive: false },
  { id: 'hidden2', type: 'hidden', position: { x: 50, y: 60 }, connections: ['output1'], isActive: false },
  { id: 'hidden3', type: 'hidden', position: { x: 50, y: 80 }, connections: ['output2'], isActive: false },
  { id: 'output1', type: 'output', position: { x: 80, y: 50 }, connections: [], isActive: false },
  { id: 'output2', type: 'output', position: { x: 80, y: 90 }, connections: [], isActive: false },
];

export const BlockchainAIShowcaseSection: React.FC<BlockchainAIShowcaseSectionProps> = ({ userRole }) => {
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>(transactions);
  const [activeNodes, setActiveNodes] = useState<AINode[]>(aiNodes);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  // Simulate real-time updates
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      // Add new transaction
      const newTransaction: Transaction = {
        id: `tx${Date.now()}`,
        from: `0x${Math.random().toString(16).substr(2, 6)}...`,
        to: `0x${Math.random().toString(16).substr(2, 6)}...`,
        amount: `${(Math.random() * 5).toFixed(1)} ETH`,
        status: 'pending',
        timestamp: Date.now(),
      };

      setActiveTransactions(prev => {
        const updated = [...prev, newTransaction];
        if (updated.length > 5) updated.shift();
        return updated;
      });

      // Activate random AI node
      setActiveNodes(prev => 
        prev.map(node => ({
          ...node,
          isActive: Math.random() > 0.7 ? !node.isActive : node.isActive
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section ref={containerRef} className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-green-500/5 to-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-500/3 to-green-500/3 rounded-full blur-3xl" />
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
              Blockchain & AI Showcase
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            See our cutting-edge technology in action with real-time blockchain transactions and AI decision-making.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Blockchain Ledger */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -100 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
              <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">🔗</span>
                Live Blockchain Ledger
              </h3>

              <div className="space-y-4">
                {activeTransactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                      tx.status === 'completed' 
                        ? 'bg-green-500/10 border-green-500/30' 
                        : tx.status === 'confirmed'
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-yellow-500/10 border-yellow-500/30'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onHoverStart={() => setHoveredElement(tx.id)}
                    onHoverEnd={() => setHoveredElement(null)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80 text-sm">Transaction {tx.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : tx.status === 'confirmed'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                    <div className="text-white text-sm">
                      <div>From: {tx.from}</div>
                      <div>To: {tx.to}</div>
                      <div className="font-bold text-white mt-1">{tx.amount}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Blockchain Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-2xl font-bold text-blue-400">1.2M+</div>
                  <div className="text-white/60 text-sm">Total Transactions</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-2xl font-bold text-green-400">99.9%</div>
                  <div className="text-white/60 text-sm">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-2xl font-bold text-purple-400">2.3s</div>
                  <div className="text-white/60 text-sm">Avg. Confirmation</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Neural Network */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 100 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
              <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">🤖</span>
                AI Decision Engine
              </h3>

              <div className="relative h-80 bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
                {/* Neural Network Connections */}
                <svg className="absolute inset-0 w-full h-full">
                  {aiNodes.map(node => 
                    node.connections.map(connectionId => {
                      const targetNode = aiNodes.find(n => n.id === connectionId);
                      if (!targetNode) return null;
                      
                      return (
                        <motion.line
                          key={`${node.id}-${connectionId}`}
                          x1={`${node.position.x}%`}
                          y1={`${node.position.y}%`}
                          x2={`${targetNode.position.x}%`}
                          y2={`${targetNode.position.y}%`}
                          stroke="url(#connectionGradient)"
                          strokeWidth="2"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ 
                            pathLength: 1, 
                            opacity: node.isActive && targetNode.isActive ? 0.6 : 0.2 
                          }}
                          transition={{ duration: 1 }}
                        />
                      );
                    })
                  )}
                  <defs>
                    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Neural Network Nodes */}
                {aiNodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    className={`absolute w-6 h-6 rounded-full border-2 cursor-pointer ${
                      node.type === 'input' 
                        ? 'bg-blue-500/80 border-blue-400' 
                        : node.type === 'hidden'
                        ? 'bg-purple-500/80 border-purple-400'
                        : 'bg-green-500/80 border-green-400'
                    }`}
                    style={{
                      left: `${node.position.x}%`,
                      top: `${node.position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: node.isActive ? 1.2 : 1, 
                      opacity: 1,
                      boxShadow: node.isActive ? "0 0 20px rgba(59, 130, 246, 0.6)" : "none"
                    }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.3 }}
                    onHoverStart={() => setHoveredElement(node.id)}
                    onHoverEnd={() => setHoveredElement(null)}
                  >
                    {node.isActive && (
                      <motion.div
                        className="absolute inset-0 w-6 h-6 rounded-full"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* AI Stats */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-2xl font-bold text-purple-400">95%</div>
                  <div className="text-white/60 text-sm">Auto-Processed</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-2xl font-bold text-green-400">99.9%</div>
                  <div className="text-white/60 text-sm">Accuracy Rate</div>
                </div>
              </div>
            </div>
          </motion.div>
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
                {userRole === 'admin' ? 'Advanced Analytics' : 'Real-time Monitoring'}
              </h3>
              <p className="text-slate-300 text-lg">
                {userRole === 'admin'
                  ? 'Access detailed system metrics, performance analytics, and advanced monitoring tools.'
                  : 'Monitor your transactions in real-time with detailed analytics and insights.'
                }
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};


