import React, { useState, useEffect } from 'react';

interface BlockchainLedgerProps {
  userRole: string;
}

interface Block {
  id: string;
  hash: string;
  timestamp: string;
  verified: boolean;
  data: string;
}

const BlockchainLedger: React.FC<BlockchainLedgerProps> = ({ userRole }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [activeBlock, setActiveBlock] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Generate sample blockchain data
    const generateBlocks = () => {
      const newBlocks: Block[] = [];
      for (let i = 0; i < 8; i++) {
        newBlocks.push({
          id: `block-${i}`,
          hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`,
          timestamp: new Date(Date.now() - (7 - i) * 60000).toLocaleTimeString(),
          verified: Math.random() > 0.2,
          data: `Escrow Transaction ${i + 1}`,
        });
      }
      setBlocks(newBlocks);
    };

    generateBlocks();

    if (userRole !== 'guest') {
      const interval = setInterval(() => {
        setBlocks(prev => {
          const newBlocks = [...prev];
          const randomIndex = Math.floor(Math.random() * newBlocks.length);
          newBlocks[randomIndex] = {
            ...newBlocks[randomIndex],
            verified: true,
          };
          return newBlocks;
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === 'guest') return;

    const interval = setInterval(() => {
      setActiveBlock(Math.floor(Math.random() * blocks.length));
    }, 1500);

    return () => clearInterval(interval);
  }, [blocks.length, userRole]);

  return (
    <section className="relative py-20 px-4 z-10">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
            Blockchain Transparency
          </span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Immutable ledger technology ensures complete transparency and traceability
        </p>
      </div>

      {/* Ledger Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 rounded-2xl backdrop-blur-sm" />
        
        {/* Blocks Container */}
        <div className="relative p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className={`relative group cursor-pointer transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setActiveBlock(index)}
                onMouseLeave={() => setActiveBlock(null)}
              >
                {/* Block Card */}
                <div
                  className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 transition-all duration-300 overflow-hidden ${
                    activeBlock === index
                      ? 'border-gold shadow-gold-glow scale-105'
                      : block.verified
                      ? 'border-green-500/50 shadow-green-500/20'
                      : 'border-gray-600 shadow-gray-600/20'
                  }`}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/10" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Block Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-white">Block #{index + 1}</div>
                      <div className={`w-3 h-3 rounded-full ${
                        block.verified ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                      }`} />
                    </div>

                    {/* Hash */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Hash</div>
                      <div className="text-xs text-white font-mono bg-gray-800 p-2 rounded border border-gray-700">
                        {block.hash}
                      </div>
                    </div>

                    {/* Data */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Data</div>
                      <div className="text-sm text-white">{block.data}</div>
                    </div>

                    {/* Timestamp */}
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Timestamp</div>
                      <div className="text-xs text-white">{block.timestamp}</div>
                    </div>
                  </div>

                  {/* Verification Glow */}
                  {block.verified && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}

                  {/* Active Glow */}
                  <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
                    activeBlock === index ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-xl blur-sm" />
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>

                {/* Connection Chain */}
                {index < blocks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-gold to-transparent transform -translate-y-1/2">
                    <div className="w-full h-full bg-gold/50 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Connection Lines */}
          <div className="lg:hidden flex justify-center mt-8">
            <div className="grid grid-cols-2 gap-4">
              {blocks.slice(0, -1).map((_, index) => (
                <div key={index} className="w-0.5 h-8 bg-gradient-to-b from-gold to-transparent mx-auto">
                  <div className="w-full h-full bg-gold/50 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Wave Animation */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-green-500/5 to-transparent opacity-0 animate-pulse" />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 text-center">
        <div className="flex justify-center items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-gray-300">Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-gray-300">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gold rounded-full" />
            <span className="text-gray-300">Active</span>
          </div>
        </div>
      </div>

      {/* Luxury Accent Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 border border-gold/20 rounded-full opacity-30" />
      <div className="absolute bottom-10 right-10 w-12 h-12 border border-gold/20 rounded-full opacity-30" />
    </section>
  );
};

export default BlockchainLedger;
