import React, { useState, useEffect } from 'react';

interface PaymasterSectionProps {
  userRole: string;
}

interface CoinStack {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
}

const PaymasterSection: React.FC<PaymasterSectionProps> = ({ userRole }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStack, setActiveStack] = useState<string | null>(null);
  const [gasSponsored, setGasSponsored] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userRole === 'guest') return;

    // Simulate gas sponsorship
    const interval = setInterval(() => {
      setGasSponsored(prev => prev + Math.floor(Math.random() * 5) + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [userRole]);

  const coinStacks: CoinStack[] = [
    { id: 'stack-1', x: 20, y: 30, size: 60, rotation: 15, delay: 0 },
    { id: 'stack-2', x: 80, y: 20, size: 80, rotation: -10, delay: 200 },
    { id: 'stack-3', x: 60, y: 70, size: 50, rotation: 25, delay: 400 },
    { id: 'stack-4', x: 10, y: 80, size: 70, rotation: -5, delay: 600 },
    { id: 'stack-5', x: 90, y: 60, size: 65, rotation: 20, delay: 800 },
  ];

  return (
    <section className="relative py-20 px-4 z-10">
      {/* Section Header */}
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
            Paymaster Support
          </span>
        </h2>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Gas fee sponsorship and transaction optimization for seamless blockchain interactions
        </p>
      </div>

      {/* Paymaster Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 rounded-2xl backdrop-blur-sm" />
        
        {/* Content */}
        <div className="relative p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Coin Stacks */}
            <div className="relative h-96">
              <div
                className={`relative w-full h-full transition-all duration-500 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                {/* Floating Coin Stacks */}
                {coinStacks.map((stack) => (
                  <div
                    key={stack.id}
                    className={`absolute group cursor-pointer transition-all duration-500 ${
                      activeStack === stack.id ? 'scale-125 z-20' : 'scale-100'
                    }`}
                    style={{
                      left: `${stack.x}%`,
                      top: `${stack.y}%`,
                      transform: `rotate(${stack.rotation}deg)`,
                      transitionDelay: `${stack.delay}ms`,
                    }}
                    onMouseEnter={() => setActiveStack(stack.id)}
                    onMouseLeave={() => setActiveStack(null)}
                  >
                    {/* Coin Stack */}
                    <div className="relative">
                      {/* Base Coin */}
                      <div className={`w-${stack.size} h-${stack.size} bg-gradient-to-br from-gold to-gold-dark rounded-full border-2 border-gold/50 shadow-gold-soft transition-all duration-300 ${
                        activeStack === stack.id ? 'shadow-gold-glow' : ''
                      }`} />
                      
                      {/* Stacked Coins */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <div className="w-12 h-12 bg-gradient-to-br from-gold-light to-gold rounded-full border-2 border-gold/50 shadow-gold-soft" />
                      </div>
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-full border-2 border-gold/50 shadow-gold-soft" />
                      </div>
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gold-light to-gold rounded-full border-2 border-gold/50 shadow-gold-soft" />
                      </div>
                    </div>

                    {/* Hover Glow */}
                    <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
                      activeStack === stack.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 rounded-full blur-sm" />
                    </div>

                    {/* Tooltip */}
                    <div className={`absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-opacity duration-300 ${
                      activeStack === stack.id ? 'opacity-100' : 'opacity-0'
                    }`}>
                      Gas Sponsored: {Math.floor(Math.random() * 100) + 50} ETH
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90" />
                    </div>
                  </div>
                ))}

                {/* Animated Particles */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-gold rounded-full animate-float"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${3 + Math.random() * 2}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Information */}
            <div
              className={`transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="space-y-8">
                {/* Benefits */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6">Gas Fee Sponsorship Benefits</h3>
                  <div className="space-y-4">
                    {[
                      {
                        title: 'Zero Gas Costs',
                        description: 'Users never pay for transaction fees',
                        icon: '💰',
                      },
                      {
                        title: 'Instant Transactions',
                        description: 'No waiting for gas price optimization',
                        icon: '⚡',
                      },
                      {
                        title: 'Cross-Chain Support',
                        description: 'Works across multiple blockchain networks',
                        icon: '🌐',
                      },
                      {
                        title: 'Automatic Optimization',
                        description: 'Smart routing for best gas prices',
                        icon: '🎯',
                      },
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4 group">
                        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">{benefit.title}</h4>
                          <p className="text-gray-300 text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gold/30">
                  <h4 className="text-lg font-semibold text-white mb-4">Real-Time Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold mb-1">
                        {userRole === 'guest' ? '∞' : gasSponsored.toLocaleString()}
                      </div>
                      <div className="text-gray-300 text-sm">Gas Sponsored (ETH)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold mb-1">
                        {userRole === 'guest' ? '∞' : Math.floor(gasSponsored * 1000).toLocaleString()}
                      </div>
                      <div className="text-gray-300 text-sm">Transactions</div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <button className="px-8 py-3 bg-gradient-to-r from-gold to-gold-dark text-black font-bold rounded-lg shadow-gold-glow hover:shadow-gold transform hover:scale-105 transition-all duration-300">
                    Learn More About Paymaster
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ripple Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-gold/20 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-gold/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Luxury Accent Elements */}
      <div className="absolute top-10 left-10 w-16 h-16 border border-gold/20 rounded-full opacity-30" />
      <div className="absolute bottom-10 right-10 w-12 h-12 border border-gold/20 rounded-full opacity-30" />
    </section>
  );
};

export default PaymasterSection;
